import React from 'react';
import styles from './Navbar.module.css';

interface NavbarProps {
  randomNumber: string;
  videoEnabled: boolean;
  audioEnabled: boolean;
  isSharingScreen: boolean;
  isRecording: boolean;
  chatOpen: boolean;
  onToggleVideo: () => void;
  onToggleAudio: () => void;
  onToggleScreen: () => void;
  onToggleRecord: () => void;
  onToggleChat: () => void;
  newChatMessage: boolean;
}

const Navbar: React.FC<NavbarProps> = ({
  randomNumber,
  videoEnabled,
  audioEnabled,
  isSharingScreen,
  isRecording,
  chatOpen,
  onToggleVideo,
  onToggleAudio,
  onToggleScreen,
  onToggleRecord,
  onToggleChat,
  newChatMessage,
}) => {
  return (
    <nav className={styles.navbar}>
      <div className={styles.brand}>
        <span className={styles.brandIcon}>📹</span>
        <span className={styles.brandName}>VideoCall</span>
      </div>

      <div className={styles.uid}>
        <span className={styles.uidLabel}>ID</span>
        <span className={styles.uidValue} id="randomNumber">{randomNumber}</span>
      </div>

      <div className={styles.controls}>
        <button
          id="toggle-video"
          className={`${styles.btn} ${!videoEnabled ? styles.btnActive : ''}`}
          onClick={onToggleVideo}
          title={videoEnabled ? 'Hide Video' : 'Show Video'}
        >
          {videoEnabled ? '🎥' : '🚫'}
        </button>

        <button
          id="toggle-mute"
          className={`${styles.btn} ${!audioEnabled ? styles.btnActive : ''}`}
          onClick={onToggleAudio}
          title={audioEnabled ? 'Mute' : 'Unmute'}
        >
          {audioEnabled ? '🎤' : '🔇'}
        </button>

        <button
          id="share-screen"
          className={`${styles.btn} ${isSharingScreen ? styles.btnScreenActive : ''}`}
          onClick={onToggleScreen}
          title={isSharingScreen ? 'Stop Sharing' : 'Share Screen'}
        >
          🖥️
        </button>

        <button
          id="record"
          className={`${styles.btn} ${isRecording ? styles.btnRecording : ''}`}
          onClick={onToggleRecord}
          title={isRecording ? 'Stop Recording' : 'Record'}
        >
          {isRecording ? '⏹️' : '⏺️'}
        </button>

        <button
          id="toggle-chat-pane"
          className={`${styles.btn} ${chatOpen ? styles.btnActive : ''}`}
          onClick={onToggleChat}
          title="Toggle Chat"
        >
          💬
          {newChatMessage && !chatOpen && (
            <span className={styles.badge} id="new-chat-notification">●</span>
          )}
        </button>

        <a href="/" className={styles.leaveBtn} title="Leave" id="leave-btn">
          🚪
        </a>
      </div>
    </nav>
  );
};

export default Navbar;
