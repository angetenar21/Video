import { useState, useRef, useCallback, useEffect } from 'react';
import { Socket } from 'socket.io-client';
import type { RemoteParticipant, PeerConnections } from '../types';

const ICE_SERVERS: RTCConfiguration = {
  iceServers: [
    { urls: ['stun:stun.l.google.com:19302', 'stun:stun1.l.google.com:19302'] },
  ],
};

interface UseWebRTCProps {
  socket: Socket;
  room: string;
  localStream: MediaStream | null;
  screenStream: MediaStream | null;
  getUserFullMedia: () => Promise<MediaStream>;
}

export interface UseWebRTCReturn {
  remoteParticipants: RemoteParticipant[];
  socketId: string;
  broadcastNewTracks: (stream: MediaStream, kind: 'audio' | 'video') => void;
}

export function useWebRTC({
  socket,
  room,
  localStream,
  screenStream,
  getUserFullMedia,
}: UseWebRTCProps): UseWebRTCReturn {
  const [remoteParticipants, setRemoteParticipants] = useState<RemoteParticipant[]>([]);
  const [socketId, setSocketId] = useState('');

  const pcRef = useRef<PeerConnections>({});
  const localStreamRef = useRef<MediaStream | null>(null);
  const screenStreamRef = useRef<MediaStream | null>(null);

  // Keep refs in sync with props
  useEffect(() => { localStreamRef.current = localStream; }, [localStream]);
  useEffect(() => { screenStreamRef.current = screenStream; }, [screenStream]);

  const replaceTrack = useCallback((track: MediaStreamTrack, peer: RTCPeerConnection) => {
    const sender = peer.getSenders().find((s) => s.track?.kind === track.kind);
    if (sender) sender.replaceTrack(track);
  }, []);

  const broadcastNewTracks = useCallback((stream: MediaStream, kind: 'audio' | 'video') => {
    const track = kind === 'audio' ? stream.getAudioTracks()[0] : stream.getVideoTracks()[0];
    if (!track) return;
    Object.values(pcRef.current).forEach((peer) => {
      replaceTrack(track, peer);
    });
  }, [replaceTrack]);

  const removeParticipant = useCallback((partnerSocketId: string) => {
    setRemoteParticipants((prev) => prev.filter((p) => p.socketId !== partnerSocketId));
    if (pcRef.current[partnerSocketId]) {
      pcRef.current[partnerSocketId].close();
      delete pcRef.current[partnerSocketId];
    }
  }, []);

  const init = useCallback(
    async (createOffer: boolean, partnerSocketId: string) => {
      const pc = new RTCPeerConnection(ICE_SERVERS);
      pcRef.current[partnerSocketId] = pc;

      // Add local tracks to the peer connection
      const addTracks = (stream: MediaStream) => {
        stream.getTracks().forEach((track) => pc.addTrack(track, stream));
      };

      if (screenStreamRef.current?.getTracks().length) {
        addTracks(screenStreamRef.current);
      } else if (localStreamRef.current) {
        addTracks(localStreamRef.current);
      } else {
        try {
          const stream = await getUserFullMedia();
          localStreamRef.current = stream;
          addTracks(stream);
        } catch (e) {
          console.error('stream error:', e);
        }
      }

      // Create offer if we're the initiator
      if (createOffer) {
        pc.onnegotiationneeded = async () => {
          try {
            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);
            socket.emit('sdp', {
              description: pc.localDescription,
              to: partnerSocketId,
              sender: socket.id,
            });
          } catch (e) {
            console.error('offer error:', e);
          }
        };
      }

      // Send ICE candidates
      pc.onicecandidate = ({ candidate }) => {
        socket.emit('ice candidates', {
          candidate,
          to: partnerSocketId,
          sender: socket.id,
        });
      };

      // Handle incoming remote tracks
      pc.ontrack = (e) => {
        const stream = e.streams[0];
        setRemoteParticipants((prev) => {
          const exists = prev.find((p) => p.socketId === partnerSocketId);
          if (exists) {
            return prev.map((p) =>
              p.socketId === partnerSocketId ? { ...p, stream } : p
            );
          }
          return [...prev, { socketId: partnerSocketId, stream }];
        });
      };

      // Handle disconnections
      pc.onconnectionstatechange = () => {
        if (
          pc.iceConnectionState === 'disconnected' ||
          pc.iceConnectionState === 'failed' ||
          pc.signalingState === 'closed'
        ) {
          removeParticipant(partnerSocketId);
        }
      };

      pc.onsignalingstatechange = () => {
        if (pc.signalingState === 'closed') {
          removeParticipant(partnerSocketId);
        }
      };
    },
    [socket, getUserFullMedia, removeParticipant]
  );

  useEffect(() => {
    if (!room) return;

    const handleConnect = () => {
      const sid = socket.id ?? '';
      setSocketId(sid);

      socket.emit('subscribe', { room, socketId: sid });
    };

    const handleNewUser = (data: { socketId: string }) => {
      socket.emit('newUserStart', { to: data.socketId, sender: socket.id });
      init(true, data.socketId);
    };

    const handleNewUserStart = (data: { sender: string }) => {
      init(false, data.sender);
    };

    const handleIceCandidates = async (data: {
      candidate: RTCIceCandidateInit | null;
      sender: string;
    }) => {
      const pc = pcRef.current[data.sender];
      if (pc && data.candidate) {
        try {
          await pc.addIceCandidate(new RTCIceCandidate(data.candidate));
        } catch (e) {
          console.error('ICE candidate error:', e);
        }
      }
    };

    const handleSdp = async (data: {
      description: RTCSessionDescriptionInit;
      sender: string;
    }) => {
      const pc = pcRef.current[data.sender];
      if (!pc) return;

      if (data.description.type === 'offer') {
        await pc.setRemoteDescription(new RTCSessionDescription(data.description));

        let stream = localStreamRef.current;
        if (!stream) {
          try {
            stream = await getUserFullMedia();
            localStreamRef.current = stream;
          } catch (e) {
            console.error(e);
            return;
          }
        }

        stream.getTracks().forEach((track) => pc.addTrack(track, stream!));

        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        socket.emit('sdp', {
          description: pc.localDescription,
          to: data.sender,
          sender: socket.id,
        });
      } else if (data.description.type === 'answer') {
        await pc.setRemoteDescription(new RTCSessionDescription(data.description));
      }
    };

    if (socket.connected) {
      handleConnect();
    }

    socket.on('connect', handleConnect);
    socket.on('new user', handleNewUser);
    socket.on('newUserStart', handleNewUserStart);
    socket.on('ice candidates', handleIceCandidates);
    socket.on('sdp', handleSdp);

    return () => {
      socket.off('connect', handleConnect);
      socket.off('new user', handleNewUser);
      socket.off('newUserStart', handleNewUserStart);
      socket.off('ice candidates', handleIceCandidates);
      socket.off('sdp', handleSdp);

      Object.values(pcRef.current).forEach((pc) => pc.close());
      pcRef.current = {};
    };
  }, [room, socket, init, getUserFullMedia]);

  return { remoteParticipants, socketId, broadcastNewTracks };
}
