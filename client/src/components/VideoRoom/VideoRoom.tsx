import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Socket } from 'socket.io-client';
import { useMedia } from '../../hooks/useMedia';
import { useWebRTC } from '../../hooks/useWebRTC';
import type { ChatMessage } from '../../types';
import Navbar from '../Navbar/Navbar';
import VideoGrid from '../VideoGrid/VideoGrid';
import ChatPane from '../ChatPane/ChatPane';
import RecordingModal from '../RecordingModal/RecordingModal';
import styles from './VideoRoom.module.css';

interface VideoRoomProps {
  room: string;
  username: string;
  socket: Socket;
}

function generateRandomString(): string {
  const array = new Uint32Array(1);
  window.crypto.getRandomValues(array);
  return array[0].toString(36);
}

const VideoRoom: React.FC<VideoRoomProps> = ({ room, username, socket }) => {
  const randomNumber = useRef(
    `__${generateRandomString()}__${generateRandomString()}__`
  ).current;

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);

  const [chatOpen, setChatOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newChatMessage, setNewChatMessage] = useState(false);
  const [recordingModalOpen, setRecordingModalOpen] = useState(false);
  const [isRecording, setIsRecording] = useState(false);

  const {
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
  } = useMedia();

  const { remoteParticipants, broadcastNewTracks } = useWebRTC({
    socket,
    room,
    localStream,
    screenStream,
    getUserFullMedia,
  });

  // Start local stream on mount
  useEffect(() => {
    startLocalStream().catch(console.error);
  }, [startLocalStream]);

  // Mirror local video
  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  // Handle chat messages from socket
  useEffect(() => {
    const handleChat = (data: { sender: string; msg: string }) => {
      setMessages((prev) => [
        ...prev,
        { sender: data.sender, msg: data.msg, type: 'remote', timestamp: Date.now() },
      ]);
      if (!chatOpen) setNewChatMessage(true);
    };
    socket.on('chat', handleChat);
    return () => { socket.off('chat', handleChat); };
  }, [socket, chatOpen]);

  const sendMessage = useCallback((msg: string) => {
    const data = { room, msg, sender: `${username} (${randomNumber})` };
    socket.emit('chat', data);
    setMessages((prev) => [
      ...prev,
      { sender: username, msg, type: 'local', timestamp: Date.now() },
    ]);
  }, [socket, room, username, randomNumber]);

  const handleToggleChat = () => {
    setChatOpen((prev) => !prev);
    setNewChatMessage(false);
  };

  const handleToggleVideo = () => {
    toggleVideo();
    if (localStream) broadcastNewTracks(localStream, 'video');
  };

  const handleToggleAudio = () => {
    toggleAudio();
    if (localStream) broadcastNewTracks(localStream, 'audio');
  };

  const handleToggleScreen = async () => {
    if (isSharingScreen) {
      stopSharingScreen();
      if (localStream) broadcastNewTracks(localStream, 'video');
    } else {
      try {
        const stream = await shareScreen();
        broadcastNewTracks(stream, 'video');
        stream.getVideoTracks()[0].addEventListener('ended', () => {
          stopSharingScreen();
          if (localStream) broadcastNewTracks(localStream, 'video');
        });
      } catch (e) {
        console.error(e);
      }
    }
  };

  const startRecording = (stream: MediaStream) => {
    const recorder = new MediaRecorder(stream, { mimeType: 'video/webm;codecs=vp9' });
    mediaRecorderRef.current = recorder;
    recordedChunksRef.current = [];

    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) recordedChunksRef.current.push(e.data);
    };

    recorder.onstop = () => {
      setIsRecording(false);
      const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${username}-${Date.now()}-record.webm`;
      a.click();
      URL.revokeObjectURL(url);
    };

    recorder.start(1000);
    setIsRecording(true);
  };

  const handleToggleRecord = () => {
    const recorder = mediaRecorderRef.current;
    if (!recorder || recorder.state === 'inactive') {
      setRecordingModalOpen(true);
    } else if (recorder.state === 'recording') {
      recorder.stop();
    } else if (recorder.state === 'paused') {
      recorder.resume();
    }
  };

  const handleRecordVideo = () => {
    setRecordingModalOpen(false);
    if (localStream) startRecording(localStream);
    else getUserFullMedia().then(startRecording).catch(console.error);
  };

  const handleRecordScreen = () => {
    setRecordingModalOpen(false);
    if (screenStream) {
      startRecording(screenStream);
    } else {
      getDisplayMedia().then(startRecording).catch(console.error);
    }
  };

  const handleLocalVideoClick = () => {
    const el = localVideoRef.current;
    if (!el) return;
    if (!document.pictureInPictureElement) {
      el.requestPictureInPicture?.().catch(console.error);
    } else {
      document.exitPictureInPicture?.().catch(console.error);
    }
  };

  return (
    <div className={styles.room}>
      <Navbar
        randomNumber={randomNumber}
        videoEnabled={videoEnabled}
        audioEnabled={audioEnabled}
        isSharingScreen={isSharingScreen}
        isRecording={isRecording}
        chatOpen={chatOpen}
        onToggleVideo={handleToggleVideo}
        onToggleAudio={handleToggleAudio}
        onToggleScreen={handleToggleScreen}
        onToggleRecord={handleToggleRecord}
        onToggleChat={handleToggleChat}
        newChatMessage={newChatMessage}
      />

      <div className={styles.body}>
        {/* Local video (small pip in corner) */}
        <video
          id="local"
          ref={localVideoRef}
          className={styles.localVideo}
          autoPlay
          muted
          playsInline
          onClick={handleLocalVideoClick}
          title="Click for picture-in-picture"
        />

        <main className={`${styles.main} ${chatOpen ? styles.mainShrunk : ''}`}>
          <VideoGrid participants={remoteParticipants} />
        </main>

        <ChatPane messages={messages} onSend={sendMessage} open={chatOpen} />
      </div>

      <RecordingModal
        open={recordingModalOpen}
        onRecordVideo={handleRecordVideo}
        onRecordScreen={handleRecordScreen}
        onClose={() => setRecordingModalOpen(false)}
      />
    </div>
  );
};

export default VideoRoom;
