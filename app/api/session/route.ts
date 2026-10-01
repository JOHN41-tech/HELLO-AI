import { NextRequest, NextResponse } from 'next/server';
import { dbAdapter } from '@/lib/database/memory-storage-adapter';
import { UserProfileSession } from '@/types/session';
import { getLanguageConfig, isValidLanguageCode } from '@/lib/i18n/languages';
import { LanguageCode } from '@/types/language';
import { parseBoundedJson } from '@/lib/api/bounded-json';
import { SessionIdSchema, SessionPersistInputSchema } from '@/lib/validation/schemas';

function validSessionId(value: string | null): value is string {
  return SessionIdSchema.safeParse(value).success;
}

export async function GET(req: NextRequest) {
  const sessionId = new URL(req.url).searchParams.get('sessionId');
  if (!validSessionId(sessionId)) {
    return NextResponse.json({ error: 'Invalid or missing session identifier' }, { status: 400 });
  }

  const session = await dbAdapter.getSession(sessionId);
  return NextResponse.json({ success: true, data: session });
}

export async function POST(req: NextRequest) {
  try {
    const parsedBody = await parseBoundedJson(req, 32_768);
    if (!parsedBody.ok) {
      return NextResponse.json({ error: parsedBody.error }, { status: parsedBody.status });
    }

    const parseResult = SessionPersistInputSchema.safeParse(parsedBody.data);
    if (!parseResult.success) {
      const language = parsedBody.data && typeof parsedBody.data === 'object' && !Array.isArray(parsedBody.data) && 'language' in parsedBody.data
        ? (parsedBody.data as Record<string, unknown>).language
        : undefined;
      if (typeof language === 'string' && !isValidLanguageCode(language)) {
        return NextResponse.json({ error: 'Invalid or unsupported language code' }, { status: 400 });
      }
      return NextResponse.json({ error: 'Invalid session payload' }, { status: 400 });
    }

    const input = parseResult.data;
    const now = new Date().toISOString();
    const config = getLanguageConfig(input.language as LanguageCode);
    const session: UserProfileSession = {
      sessionId: input.sessionId,
      createdAt: input.createdAt ?? now,
      updatedAt: now,
      language: input.language as LanguageCode,
      locale: config.locale,
      demographics: input.demographics ?? {},
      answers: input.answers ?? {},
      currentStepIndex: input.currentStepIndex ?? 0,
    };

    await dbAdapter.saveSession(session);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to save session' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const sessionId = new URL(req.url).searchParams.get('sessionId');
  if (!validSessionId(sessionId)) {
    return NextResponse.json({ error: 'Invalid or missing session identifier' }, { status: 400 });
  }

  await dbAdapter.deleteSession(sessionId);
  return NextResponse.json({ success: true, message: 'Session deleted' });
}
