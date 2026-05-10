import React from 'react';
import styles from './RecordingModal.module.css';

interface RecordingModalProps {
  open: boolean;
  onRecordVideo: () => void;
  onRecordScreen: () => void;
  onClose: () => void;
}

const RecordingModal: React.FC<RecordingModalProps> = ({
  open,
  onRecordVideo,
  onRecordScreen,
  onClose,
}) => {
  if (!open) return null;

  return (
    <div id="recording-options-modal" className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <h2 className={styles.title}>What would you like to record?</h2>
        <div className={styles.options}>
          <button
            id="record-video"
            className={styles.optionBtn}
            onClick={onRecordVideo}
          >
            <span className={styles.optionIcon}>🎥</span>
            <span className={styles.optionLabel}>Record Video</span>
            <span className={styles.optionHint}>Your camera stream</span>
          </button>
          <button
            id="record-screen"
            className={styles.optionBtn}
            onClick={onRecordScreen}
          >
            <span className={styles.optionIcon}>🖥️</span>
            <span className={styles.optionLabel}>Record Screen</span>
            <span className={styles.optionHint}>Your screen share</span>
          </button>
        </div>
        <button id="closeModal" className={styles.closeBtn} onClick={onClose}>
          Cancel
        </button>
      </div>
    </div>
  );
};

export default RecordingModal;
