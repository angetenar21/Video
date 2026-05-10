import React, { useRef, useEffect, useState } from 'react';
import styles from './VideoCard.module.css';

interface VideoCardProps {
  socketId: string;
  stream: MediaStream | null;
}

const VideoCard: React.FC<VideoCardProps> = ({ socketId, stream }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [muted, setMuted] = useState(false);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  const handleExpand = () => {
    const el = videoRef.current;
    if (!el) return;
    if (el.requestFullscreen) el.requestFullscreen();
    else if ((el as any).webkitRequestFullscreen) (el as any).webkitRequestFullscreen();
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !muted;
      setMuted(!muted);
    }
  };

  return (
    <div className={styles.card} id={socketId}>
      <video
        ref={videoRef}
        id={`${socketId}-video`}
        className={styles.video}
        autoPlay
        playsInline
      />
      <div className={styles.overlay}>
        <span className={styles.peerId}>{socketId.slice(0, 8)}…</span>
        <div className={styles.actions}>
          <button
            className={`${styles.actionBtn} ${muted ? styles.mutedBtn : ''}`}
            onClick={toggleMute}
            title={muted ? 'Unmute' : 'Mute'}
          >
            {muted ? '🔇' : '🔊'}
          </button>
          <button
            className={styles.actionBtn}
            onClick={handleExpand}
            title="Expand"
          >
            ⛶
          </button>
        </div>
      </div>
    </div>
  );
};

export default VideoCard;
