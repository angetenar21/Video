import React from 'react';
import type { RemoteParticipant } from '../../types';
import VideoCard from '../VideoCard/VideoCard';
import styles from './VideoGrid.module.css';

interface VideoGridProps {
  participants: RemoteParticipant[];
}

const VideoGrid: React.FC<VideoGridProps> = ({ participants }) => {
  const count = participants.length;

  // Determine column count for responsive grid
  const cols =
    count <= 1 ? 1 :
    count <= 2 ? 2 :
    count <= 4 ? 2 :
    count <= 9 ? 3 : 4;

  return (
    <div
      id="videos"
      className={styles.grid}
      style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}
    >
      {participants.map((p) => (
        <VideoCard key={p.socketId} socketId={p.socketId} stream={p.stream} />
      ))}

      {participants.length === 0 && (
        <div className={styles.empty}>
          <div className={styles.emptyIcon}>👥</div>
          <p className={styles.emptyText}>Waiting for others to join…</p>
          <p className={styles.emptyHint}>Share the room link to invite participants</p>
        </div>
      )}
    </div>
  );
};

export default VideoGrid;
