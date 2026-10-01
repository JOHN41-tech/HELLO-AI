import { IDatabaseAdapter } from './database-adapter.interface';
import { UserProfileSession } from '@/types/session';

export class MemoryStorageAdapter implements IDatabaseAdapter {
  private sessions: Map<string, UserProfileSession> = new Map();

  public async getSession(sessionId: string): Promise<UserProfileSession | null> {
    // Attempt reading from browser localStorage if client side
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(`hello_ai_session_${sessionId}`);
        if (stored) {
          return JSON.parse(stored) as UserProfileSession;
        }
      } catch (e) {
        console.warn('Failed to access localStorage:', e);
      }
    }

    return this.sessions.get(sessionId) || null;
  }

  public async saveSession(session: UserProfileSession): Promise<void> {
    session.updatedAt = new Date().toISOString();
    this.sessions.set(session.sessionId, session);

    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(`hello_ai_session_${session.sessionId}`, JSON.stringify(session));
      } catch (e) {
        console.warn('Failed to write to localStorage:', e);
      }
    }
  }

  public async deleteSession(sessionId: string): Promise<void> {
    this.sessions.delete(sessionId);
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem(`hello_ai_session_${sessionId}`);
      } catch (e) {
        console.warn('Failed to remove from localStorage:', e);
      }
    }
  }

  public async clearAllSessions(): Promise<void> {
    this.sessions.clear();
    if (typeof window !== 'undefined') {
      try {
        const keysToRemove: string[] = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.startsWith('hello_ai_session_')) {
            keysToRemove.push(key);
          }
        }
        keysToRemove.forEach((key) => localStorage.removeItem(key));
      } catch (e) {
        console.warn('Failed to clear localStorage:', e);
      }
    }
  }
}

export const dbAdapter = new MemoryStorageAdapter();
