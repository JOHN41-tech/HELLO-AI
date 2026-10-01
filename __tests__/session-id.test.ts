import { beforeEach, describe, expect, it } from 'vitest';
import { NextRequest } from 'next/server';
import { GET as sessionGet, DELETE as sessionDelete, POST as sessionPost } from '@/app/api/session/route';
import { POST as chatPost } from '@/app/api/chat/route';
import { POST as eligibilityPost } from '@/app/api/eligibility/check/route';
import { dbAdapter } from '@/lib/database/memory-storage-adapter';
import { isSessionId, LEGACY_SESSION_ID, resolveBrowserSessionId } from '@/lib/session/session-id';
import { ChatInputSchema } from '@/lib/validation/schemas';

const SESSION_A = 'session_00000000-0000-4000-8000-000000000011';
const SESSION_B = 'session_00000000-0000-4000-8000-000000000012';

function createStorage(initial: Record<string, string> = {}) {
  const entries = new Map(Object.entries(initial));
  return {
    getItem: (key: string) => entries.get(key) ?? null,
    setItem: (key: string, value: string) => { entries.set(key, value); },
    removeItem: (key: string) => { entries.delete(key); },
    entries,
  };
}

describe('anonymous session isolation', () => {
  beforeEach(async () => {
    await dbAdapter.deleteSession(SESSION_A);
    await dbAdapter.deleteSession(SESSION_B);
    await dbAdapter.deleteSession(LEGACY_SESSION_ID);
  });

  it('generates and persists separate secure IDs for separate browser profiles', () => {
    const storageA = createStorage();
    const storageB = createStorage();
    const idA = resolveBrowserSessionId(storageA, () => '00000000-0000-4000-8000-000000000101');
    const idB = resolveBrowserSessionId(storageB, () => '00000000-0000-4000-8000-000000000102');

    expect(isSessionId(idA)).toBe(true);
    expect(isSessionId(idB)).toBe(true);
    expect(idA).not.toBe(idB);
    expect(resolveBrowserSessionId(storageA, () => '00000000-0000-4000-8000-000000000103')).toBe(idA);
  });

  it('migrates this browser’s legacy local profile under its new isolated ID', () => {
    const legacy = {
      sessionId: LEGACY_SESSION_ID,
      language: 'ta',
      demographics: { age: 29 },
      answers: { state: 'Tamil Nadu' },
      currentStepIndex: 2,
    };
    const storage = createStorage({ [`hello_ai_session_${LEGACY_SESSION_ID}`]: JSON.stringify(legacy) });
    const id = resolveBrowserSessionId(storage, () => '00000000-0000-4000-8000-000000000104');

    expect(id).not.toBe(LEGACY_SESSION_ID);
    expect(JSON.parse(storage.getItem(`hello_ai_session_${id}`) ?? '{}')).toMatchObject({
      sessionId: id,
      language: 'ta',
      demographics: { age: 29 },
      answers: { state: 'Tamil Nadu' },
    });
    expect(storage.getItem(`hello_ai_session_${LEGACY_SESSION_ID}`)).toBeNull();
  });

  it('rejects the old shared ID at API boundaries', async () => {
    expect(ChatInputSchema.safeParse({ sessionId: LEGACY_SESSION_ID, language: 'en', message: 'help' }).success).toBe(false);

    const get = await sessionGet(new NextRequest(`http://localhost/api/session?sessionId=${LEGACY_SESSION_ID}`));
    const remove = await sessionDelete(new NextRequest(`http://localhost/api/session?sessionId=${LEGACY_SESSION_ID}`, { method: 'DELETE' }));
    const post = await sessionPost(new NextRequest('http://localhost/api/session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId: LEGACY_SESSION_ID, language: 'en' }),
    }));

    expect(get.status).toBe(400);
    expect(remove.status).toBe(400);
    expect(post.status).toBe(400);
  });

  it('does not mix profile or conversation history between distinct sessions', async () => {
    const now = new Date().toISOString();
    await dbAdapter.saveSession({
      sessionId: SESSION_A,
      createdAt: now,
      updatedAt: now,
      language: 'en',
      locale: 'en-IN',
      demographics: { age: 73, state: 'Private test value' },
      answers: { age: 73 },
      currentStepIndex: 3,
      conversationHistory: [{ role: 'user', content: 'private-history-marker', language: 'en', timestamp: now }],
    });

    const response = await chatPost(new NextRequest('http://localhost/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId: SESSION_B, language: 'en', message: 'I need general help.' }),
    }));
    expect(response.status).toBe(200);

    const sessionA = await dbAdapter.getSession(SESSION_A);
    const sessionB = await dbAdapter.getSession(SESSION_B);
    expect(sessionA?.demographics.age).toBe(73);
    expect(sessionB?.demographics.age).toBeUndefined();
    expect(sessionB?.conversationHistory?.some((entry) => entry.content.includes('private-history-marker'))).toBe(false);
  });

  it('bounds malformed public API payloads before work is performed', async () => {
    const tooLarge = await chatPost(new NextRequest('http://localhost/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId: SESSION_A, language: 'en', message: 'x'.repeat(33_000) }),
    }));
    const invalidEligibility = await eligibilityPost(new NextRequest('http://localhost/api/eligibility/check', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ serviceId: 'pmegp', session: { demographics: { age: 'not-a-number' } } }),
    }));

    expect(tooLarge.status).toBe(413);
    expect(invalidEligibility.status).toBe(400);
  });
});
