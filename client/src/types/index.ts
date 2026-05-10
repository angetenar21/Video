export interface ChatMessage {
  sender: string;
  msg: string;
  type: 'local' | 'remote';
  timestamp: number;
}

export interface RemoteParticipant {
  socketId: string;
  stream: MediaStream | null;
}

export type PeerConnections = Record<string, RTCPeerConnection>;

export interface IceServerConfig {
  iceServers: RTCIceServer[];
}

export interface SdpPayload {
  description: RTCSessionDescriptionInit;
  sender: string;
  to: string;
}

export interface IceCandidatePayload {
  candidate: RTCIceCandidateInit | null;
  sender: string;
  to: string;
}

export interface SubscribePayload {
  room: string;
  socketId: string;
}

export interface ChatPayload {
  room: string;
  msg: string;
  sender: string;
}
