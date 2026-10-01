import { NextRequest, NextResponse } from 'next/server';
import { dbAdapter } from '@/lib/database/memory-storage-adapter';
import { UserProfileSession } from '@/types/session';
import { getLanguageConfig, isValidLanguageCode } from '@/lib/i18n/languages';
import { LanguageCode } from '@/types/language';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const sessionId = searchParams.get('sessionId') || 'session_default_user';

  const session = await dbAdapter.getSession(sessionId);
  return NextResponse.json({ success: true, data: session });
}

export async function POST(req: NextRequest) {
  try {
    const session: UserProfileSession = await req.json();

    // An unsupported language must fail loudly rather than persist and render wrong copy.
    if (session.language !== undefined && !isValidLanguageCode(session.language)) {
      return NextResponse.json(
        { error: 'Invalid or unsupported language code' },
        { status: 400 }
      );
    }

    if (session.language) {
      // The locale always follows the language so speech and formatting stay consistent.
      const config = getLanguageConfig(session.language as LanguageCode);
      session.locale = config.locale;
    }

    await dbAdapter.saveSession(session);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to save session' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const sessionId = searchParams.get('sessionId') || 'session_default_user';
  await dbAdapter.deleteSession(sessionId);
  return NextResponse.json({ success: true, message: 'Session deleted' });
}
