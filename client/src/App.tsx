import React, { useMemo } from 'react';
import JoinRoom from './components/JoinRoom/JoinRoom';
import VideoRoom from './components/VideoRoom/VideoRoom';
import { useSocket } from './hooks/useSocket';

function getQueryParam(key: string): string | null {
  const params = new URLSearchParams(window.location.search);
  return params.get(key);
}

const App: React.FC = () => {
  const room = useMemo(() => getQueryParam('room'), []);
  const username = sessionStorage.getItem('username');
  const socket = useSocket();

  // No room → show create room screen
  if (!room) {
    return <JoinRoom room={null} />;
  }

  // Has room but no username → show set-username screen
  if (!username) {
    return <JoinRoom room={room} />;
  }

  // Both present → enter the call
  return <VideoRoom room={room} username={username} socket={socket} />;
};

export default App;
