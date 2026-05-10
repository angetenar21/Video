import React, { useState } from 'react';
import styles from './JoinRoom.module.css';

function generateRandomString(): string {
  const array = new Uint32Array(1);
  window.crypto.getRandomValues(array);
  return array[0].toString(36);
}

type View = 'create' | 'join';

interface JoinRoomProps {
  room: string | null;
}

const JoinRoom: React.FC<JoinRoomProps> = ({ room }) => {
  const [view] = useState<View>(room ? 'join' : 'create');
  const [roomName, setRoomName] = useState('');
  const [yourName, setYourName] = useState('');
  const [username, setUsername] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [roomLink, setRoomLink] = useState('');

  const handleCreateRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomName.trim() || !yourName.trim()) {
      setErrorMsg('All fields are required');
      return;
    }
    setErrorMsg('');
    sessionStorage.setItem('username', yourName.trim());
    const sanitized = roomName.trim().replace(/ /g, '_');
    const link = `${location.origin}?room=${sanitized}_${generateRandomString()}`;
    setRoomLink(link);
    setRoomName('');
    setYourName('');
  };

  const handleEnterRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) {
      setErrorMsg('Please input your name');
      return;
    }
    setErrorMsg('');
    sessionStorage.setItem('username', username.trim());
    location.reload();
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.card}>
        <div className={styles.logo}>
          <span className={styles.logoIcon}>📹</span>
          <span className={styles.logoText}>VideoCall</span>
        </div>

        {view === 'create' ? (
          <>
            <h1 className={styles.title}>Create a Room</h1>
            <p className={styles.subtitle}>Start a new video conference</p>

            {errorMsg && <div className={styles.error}>{errorMsg}</div>}

            <form onSubmit={handleCreateRoom} className={styles.form}>
              <div className={styles.field}>
                <label className={styles.label}>Room Name</label>
                <input
                  id="room-name"
                  type="text"
                  className={styles.input}
                  placeholder="e.g. Team Standup"
                  value={roomName}
                  onChange={(e) => setRoomName(e.target.value)}
                />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Your Name</label>
                <input
                  id="your-name"
                  type="text"
                  className={styles.input}
                  placeholder="e.g. Alice"
                  value={yourName}
                  onChange={(e) => setYourName(e.target.value)}
                />
              </div>
              <button id="create-room" type="submit" className={styles.btn}>
                Create Room
              </button>
            </form>

            {roomLink && (
              <div className={styles.roomCreated}>
                <p>Room created! Share this link:</p>
                <a
                  href={roomLink}
                  className={styles.roomLink}
                  id="room-created-link"
                >
                  {roomLink}
                </a>
              </div>
            )}
          </>
        ) : (
          <>
            <h1 className={styles.title}>Enter Your Name</h1>
            <p className={styles.subtitle}>Before joining the call</p>

            {errorMsg && <div className={styles.error}>{errorMsg}</div>}

            <form onSubmit={handleEnterRoom} className={styles.form}>
              <div className={styles.field}>
                <label className={styles.label}>Your Name</label>
                <input
                  id="username"
                  type="text"
                  className={styles.input}
                  placeholder="e.g. Alice"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
              <button id="enter-room" type="submit" className={styles.btn}>
                Join Room
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default JoinRoom;
