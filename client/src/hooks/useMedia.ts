import { useState, useRef, useCallback } from 'react';

export interface UseMediaReturn {
  localStream: MediaStream | null;
  screenStream: MediaStream | null;
  videoEnabled: boolean;
  audioEnabled: boolean;
  isSharingScreen: boolean;
  startLocalStream: () => Promise<MediaStream>;
  toggleVideo: () => void;
  toggleAudio: () => void;
  shareScreen: () => Promise<MediaStream>;
  stopSharingScreen: () => void;
  getUserFullMedia: () => Promise<MediaStream>;
  getDisplayMedia: () => Promise<MediaStream>;
}

export function useMedia(): UseMediaReturn {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [screenStream, setScreenStream] = useState<MediaStream | null>(null);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [isSharingScreen, setIsSharingScreen] = useState(false);

  const localStreamRef = useRef<MediaStream | null>(null);
  const screenStreamRef = useRef<MediaStream | null>(null);

  const getUserFullMedia = useCallback((): Promise<MediaStream> => {
    return navigator.mediaDevices.getUserMedia({
      video: true,
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
      },
    });
  }, []);

  const getDisplayMedia = useCallback((): Promise<MediaStream> => {
    return navigator.mediaDevices.getDisplayMedia({
      video: { cursor: 'always' } as MediaTrackConstraints,
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        sampleRate: 44100,
      },
    });
  }, []);

  const startLocalStream = useCallback(async (): Promise<MediaStream> => {
    if (localStreamRef.current) return localStreamRef.current;
    const stream = await getUserFullMedia();
    localStreamRef.current = stream;
    setLocalStream(stream);
    return stream;
  }, [getUserFullMedia]);

  const toggleVideo = useCallback(() => {
    const stream = localStreamRef.current;
    if (!stream) return;
    const track = stream.getVideoTracks()[0];
    if (track) {
      track.enabled = !track.enabled;
      setVideoEnabled(track.enabled);
    }
  }, []);

  const toggleAudio = useCallback(() => {
    const stream = localStreamRef.current;
    if (!stream) return;
    const track = stream.getAudioTracks()[0];
    if (track) {
      track.enabled = !track.enabled;
      setAudioEnabled(track.enabled);
    }
  }, []);

  const shareScreen = useCallback(async (): Promise<MediaStream> => {
    const stream = await getDisplayMedia();
    screenStreamRef.current = stream;
    setScreenStream(stream);
    setIsSharingScreen(true);
    return stream;
  }, [getDisplayMedia]);

  const stopSharingScreen = useCallback(() => {
    const stream = screenStreamRef.current;
    if (stream) {
      stream.getTracks().forEach((t) => t.stop());
    }
    screenStreamRef.current = null;
    setScreenStream(null);
    setIsSharingScreen(false);
  }, []);

  return {
    localStream,
    screenStream,
    videoEnabled,
    audioEnabled,
    isSharingScreen,
    startLocalStream,
    toggleVideo,
    toggleAudio,
    shareScreen,
    stopSharingScreen,
    getUserFullMedia,
    getDisplayMedia,
  };
}
