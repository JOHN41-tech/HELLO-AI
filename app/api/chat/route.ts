import { NextRequest, NextResponse } from 'next/server';
import { ChatInputSchema } from '@/lib/validation/schemas';
import { aiService } from '@/lib/ai/mock-ai-service';
import { dbAdapter } from '@/lib/database/memory-storage-adapter';
import { getLanguageConfig } from '@/lib/i18n/languages';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parseResult = ChatInputSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Invalid payload', details: parseResult.error.format() },
        { status: 400 }
      );
    }

    // safeParse already refined this to a valid code, so the cast is narrowing, not coercion.
    const { message, answer, sessionId, language: lang } = parseResult.data;
    const langConfig = getLanguageConfig(lang);

    let session = await dbAdapter.getSession(sessionId);
    if (!session) {
      session = {
        sessionId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        language: lang,
        locale: langConfig.locale,
        demographics: {},
        answers: {},
        currentStepIndex: 0,
      };
    } else {
      // Switching language updates presentation only. Conversation, profile, and
      // eligibility state must survive the switch untouched.
      session.language = lang;
      session.locale = langConfig.locale;
      session.updatedAt = new Date().toISOString();
    }

    // Guided answers persist before the guide runs, so the next question reads the value
    // the user just gave instead of re-asking the same field.
    if (answer) {
      session.answers = { ...session.answers, [answer.fieldKey]: answer.value };
      session.updatedAt = new Date().toISOString();
    }

    const aiResponse = await aiService.generateResponse(message ?? '', session, lang, []);

    await dbAdapter.saveSession(session);

    return NextResponse.json({
      success: true,
      language: lang,
      locale: langConfig.locale,
      data: aiResponse,
    });
  } catch (err: unknown) {
    console.error('Chat API Error:', err);
    return NextResponse.json(
      { error: 'Failed to process assistant request. Please try again.' },
      { status: 500 }
    );
  }
}
