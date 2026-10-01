import { UserProfileSession } from '@/types/session';

export interface IDatabaseAdapter {
  getSession(sessionId: string): Promise<UserProfileSession | null>;
  saveSession(session: UserProfileSession): Promise<void>;
  deleteSession(sessionId: string): Promise<void>;
  clearAllSessions(): Promise<void>;
}
