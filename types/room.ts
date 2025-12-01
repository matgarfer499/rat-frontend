/**
 * Room and Socket.IO event types for multiplayer
 */

export enum RoomPhase {
  WAITING = 'waiting',
  HINTS = 'hints',
  VOTING = 'voting',
  RESULTS = 'results',
}

export enum PlayerRole {
  CIVILIAN = 'civilian',
  IMPOSTOR = 'impostor',
}

export interface Player {
  id: string;
  username: string;
  user_id?: number | null;
  is_ready: boolean;
  role?: PlayerRole | null;
  hint?: string | null;
  vote?: string | null;
  is_host: boolean;
}

export interface RoomSettings {
  max_players: number;
  category_id: number;
  is_public: boolean;
  password?: string | null;
}

export interface Room {
  id: string;
  host_id: string;
  settings: RoomSettings;
  phase: RoomPhase;
  players: Record<string, Player>;
  word?: string | null;
  round_number: number;
  created_at: number;
}

export interface PublicRoom {
  id: string;
  player_count: number;
  max_players: number;
  category_id: number;
}

// Socket.IO event payloads
export interface JoinRoomData {
  room_id: string;
  username: string;
  password?: string;
}

export interface LeaveRoomData {
  room_id: string;
}

export interface GameEventData {
  room_id: string;
  event_type: 'hint_submitted' | 'vote_submitted' | 'ready_toggle' | 'start_game';
  payload?: any;
}

export interface PlayerJoinedEvent {
  player_id: string;
  username: string;
}

export interface PlayerLeftEvent {
  player_id: string;
  username: string;
}

export interface GameEvent {
  event_type: string;
  player_id: string;
  payload: any;
}

export interface SocketError {
  message: string;
}
