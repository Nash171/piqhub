export type UserRole = 'admin' | 'player';

export interface User {
  id: number;
  username: string;
  role: UserRole;
  created_at: string;
}

export interface SessionUser {
  id: number;
  username: string;
  role: UserRole;
}

export type EventStatus = 'upcoming' | 'open' | 'locked' | 'completed' | 'hidden';

export interface Event {
  id: number;
  name: string;
  status: EventStatus;
  created_at: string;
}

export type MatchStatus = 'upcoming' | 'locked' | 'completed';

export interface Match {
  id: number;
  event_id: number;
  team_a: string;
  team_b: string;
  match_time: string;
  winner: 'team_a' | 'team_b' | null;
  status: MatchStatus;
}

export type EventRegistrationStatus = 'pending' | 'confirmed' | 'rejected' | 'blocked';

export interface EventRegistration {
  id: number;
  event_id: number;
  user_id: number;
  coins: number;
  status: EventRegistrationStatus;
}

export interface Bet {
  id: number;
  match_id: number;
  user_id: number;
  team_chosen: 'team_a' | 'team_b';
  amount: number;
  placed_at: string;
}

export interface LeaderboardEntry {
  user_id: number;
  username: string;
  coins: number;
}
