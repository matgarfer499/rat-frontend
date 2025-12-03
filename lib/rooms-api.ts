/**
 * API client for room operations
 */

import type { Room } from '@/types/room';
import { apiFetch, getApiHeaders, API_BASE_URL } from './fetch-helper';

export interface CreateRoomRequest {
  username: string;
  category_id: number;
  max_players?: number;
  is_public?: boolean;
  password?: string;
}

export interface RoomResponse {
  id: string;
  host_id: string;
  phase: string;
  player_count: number;
  max_players: number;
  is_public: boolean;
  has_password: boolean;
}

export interface PublicRoom {
  id: string;
  player_count: number;
  max_players: number;
  category_id: number;
}

export interface JoinRoomRequest {
  username: string;
  room_id: string;
  password?: string;
}

export interface JoinRoomResponse {
  room_id: string;
  player_id: string;
  message: string;
}

export interface CheckRoomResponse {
  room_id: string;
  exists: boolean;
  is_public: boolean;
  requires_password: boolean;
  player_count: number;
  max_players: number;
  phase: string;
  category_id: number;
}

/**
 * Create a new game room
 */
export async function createRoom(request: CreateRoomRequest): Promise<RoomResponse> {
  const response = await apiFetch('/rooms/', {
    method: 'POST',
    headers: getApiHeaders('application/json'),
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to create room');
  }

  return response.json();
}

/**
 * Get list of public rooms
 */
export async function getPublicRooms(): Promise<PublicRoom[]> {
  const response = await apiFetch('/rooms/public');

  if (!response.ok) {
    throw new Error('Failed to fetch public rooms');
  }

  return response.json();
}

/**
 * Get room information by ID (returns full room state)
 */
export async function getRoom(roomId: string): Promise<Room> {
  const response = await apiFetch(`/rooms/${roomId}`);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Room not found');
  }

  return response.json();
}

/**
 * Validate and prepare to join a room
 */
export async function joinRoom(request: JoinRoomRequest): Promise<JoinRoomResponse> {
  const response = await apiFetch(`/rooms/${request.room_id}/join`, {
    method: 'POST',
    headers: getApiHeaders('application/json'),
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to join room');
  }

  return response.json();
}

/**
 * Check if a room exists and if it requires a password
 */
export async function checkRoom(roomId: string): Promise<CheckRoomResponse> {
  const response = await apiFetch(`/rooms/${roomId}/check`);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Room not found');
  }

  return response.json();
}

/**
 * Get Socket.IO connection URL
 */
export function getSocketURL(): string {
  return API_BASE_URL;
}

/**
 * Get categories with translations
 */
export async function getCategories(language: string): Promise<Array<{
  id: number;
  key: string;
  translations: Array<{
    language: string;
    name: string;
  }>;
}>> {
  const response = await apiFetch(`/categories/?language=${language}`);

  if (!response.ok) {
    throw new Error('Failed to fetch categories');
  }

  return response.json();
}
