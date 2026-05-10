# VideoCall — Real-Time Multi-Participant Video Conferencing

A low-latency video conferencing application built with **React**, **TypeScript**, and **WebRTC** for real-time peer-to-peer audio/video streaming, backed by a **Node.js / Socket.io** signaling server.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, TypeScript, Vite |
| Real-time A/V | WebRTC (RTCPeerConnection) |
| Signaling | Socket.io over WebSocket |
| Backend | Node.js, Express |
| Styling | Vanilla CSS Modules (dark-mode) |

---

## Features

- 🎥 **Multi-participant video calls** — P2P WebRTC streams between all participants
- 🔇 **Toggle audio / video** — mute/unmute mic and camera independently
- 🖥️ **Screen sharing** — share your screen and switch back to camera
- 💬 **Real-time text chat** — sidebar chat with message history
- ⏺️ **Local recording** — record your video stream or screen (saved as `.webm`)
- 🔊 **Per-participant controls** — mute individual remote streams, go fullscreen
- 🖼️ **Picture-in-picture** — click your local video to enter PiP mode
- 🔗 **Shareable room links** — create a room and share the URL

---

## Architecture

```
Browser A (React)  ←—— WebRTC P2P A/V ——→  Browser B (React)
         ↕  Socket.io signaling (SDP + ICE)  ↕
              Node.js + Express + Socket.io
```

The Node.js server acts purely as a **signaling relay** — it never touches media. All audio/video travels directly peer-to-peer via WebRTC.

### Frontend Structure

```
client/src/
├── types/index.ts           # TypeScript interfaces (ChatMessage, RemoteParticipant, etc.)
├── hooks/
│   ├── useSocket.ts         # Socket.io connection lifecycle
│   ├── useMedia.ts          # Camera, mic, screen capture state
│   └── useWebRTC.ts         # Full WebRTC orchestration (offers, answers, ICE)
└── components/
    ├── JoinRoom/            # Create room + enter username screens
    ├── Navbar/              # Call controls (video, audio, screen, record, chat)
    ├── VideoRoom/           # Main call view orchestrator
    ├── VideoGrid/           # Auto-layout remote participant grid
    ├── VideoCard/           # Individual remote stream + mute/expand controls
    ├── ChatPane/            # Sliding chat sidebar
    └── RecordingModal/      # Choose video vs screen recording
```

---

## Getting Started

### Prerequisites
- Node.js 18+
- npm 9+

### Install

```bash
# Install server dependencies
npm install

# Install client dependencies
npm run client:install
cd client && npm install
```

### Run (Development)

You need **two terminals**:

```bash
# Terminal 1 — Signaling server (port 3000)
node src/app.js

# Terminal 2 — React dev server (port 5173)
npm run client:dev
```

Then open **http://localhost:5173** in your browser.

> The Vite dev server automatically proxies all `/socket.io/*` requests to the Node server on port 3000.

### Build for Production

```bash
# Build the React app
npm run client:build

# Run the unified server (serves built React app + Socket.io on port 3000)
npm start
```

---

## How It Works

1. **Create a room** — enter a room name and your display name. A unique shareable link is generated.
2. **Join** — open the link in another browser or share it. Enter your display name.
3. **The signaling flow:**
   - New participant connects via Socket.io and emits `subscribe` with the room name
   - Existing participants are notified (`new user` event) and initiate WebRTC offers
   - SDP offers/answers and ICE candidates are relayed through the Node server
   - Once negotiation completes, video/audio flows directly peer-to-peer

---

## Scripts

| Command | Description |
|---|---|
| `npm start` | Start Node.js server (serves `client/dist` in production) |
| `npm run watch` | Start Node.js server with nodemon (auto-restart on changes) |
| `npm run client:dev` | Start Vite dev server for React frontend |
| `npm run client:build` | Build React frontend to `client/dist/` |

---

## License

MIT
