/**
 * Room and Socket.IO event types for multiplayer
 */

export enum RoomPhase {
  WAITING = 'waiting',
  ROLE_REVEAL = 'role_reveal',
  PLAYING = 'playing',
  VOTING = 'voting',
  RESULTS = 'results',
}

export enum PlayerRole {
  CIVILIAN = 'civilian',
  IMPOSTOR = 'impostor',
  DETECTIVE = 'detective',
  JOKER = 'joker',
}

export enum GameResult {
  CIVILIANS_WIN = 'civilians_win',
  IMPOSTOR_WINS = 'impostor_wins',
}

export interface Player {
  id: string;
  username: string;
  user_id?: number | null;
  is_ready: boolean;
  role?: PlayerRole | null;
  word?: string | null;
  vote?: string | null;
  is_host: boolean;
  wants_to_vote: boolean;
}

export interface RoomSettings {
  max_players: number;
  category_ids: number[];
  is_public: boolean;
  password?: string | null;
  detective_enabled?: boolean;
  joker_enabled?: boolean;
  voting_time?: number;
  discussion_timer_enabled?: boolean;
  discussion_time?: number;
}

export interface GameState {
  word: string;
  impostor_id: string;
  detective_id?: string | null;
  joker_id?: string | null;
  starting_player_id: string;
  phase_start_time: number;
  votes_submitted: number;
  result?: GameResult | null;
  most_voted_id?: string | null;
}

export interface Room {
  id: string;
  host_id: string;
  max_players: number;
  settings: RoomSettings;
  phase: RoomPhase;
  players: Record<string, Player>;
  game_state?: GameState | null;
  round_number: number;
  created_at: number;
}

export interface PublicRoom {
  id: string;
  player_count: number;
  max_players: number;
  category_ids: number[];
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

// Game phase specific events
export interface PhaseChangeEvent {
  phase: RoomPhase;
  phase_start_time: number;
}

export interface VoteResultEvent {
  result: GameResult;
  impostor_id: string;
  most_voted_id: string;
  votes: Record<string, string>; // player_id -> voted_for_id
}
