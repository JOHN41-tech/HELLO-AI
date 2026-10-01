import { NextRequest, NextResponse } from 'next/server';
import { ChatInputSchema } from '@/lib/validation/schemas';
import { getAIService } from '@/lib/ai/ai-service';
import { processConversationTurn } from '@/lib/ai/conversation/conversation-controller';
import { dbAdapter } from '@/lib/database/memory-storage-adapter';
import { getLanguageConfig } from '@/lib/i18n/languages';
import { ConversationHistoryEntry } from '@/types/conversation';
import { redactSensitiveText } from '@/lib/privacy/redaction';
import { parseBoundedJson } from '@/lib/api/bounded-json';

export async function POST(req: NextRequest) {
  try {
    const boundedBody = await parseBoundedJson(req, 32_768);
    if (!boundedBody.ok) {
      return NextResponse.json({ error: boundedBody.error }, { status: boundedBody.status });
    }
    const parseResult = ChatInputSchema.safeParse(boundedBody.data);

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Invalid payload', details: parseResult.error.format() },
        { status: 400 }
      );
    }

    const { message, answer, sessionId, language, profileContext } = parseResult.data;
    const languageConfig = getLanguageConfig(language);
    const now = new Date().toISOString();

    let session = await dbAdapter.getSession(sessionId);
    if (!session) {
      session = {
        sessionId,
        createdAt: now,
        updatedAt: now,
        language,
        locale: languageConfig.locale,
        demographics: {},
        answers: {},
        currentStepIndex: 0,
        conversationHistory: [],
      };
    } else {
      // A language switch changes only presentation; history, collected facts, and progress remain.
      session.language = language;
      session.locale = languageConfig.locale;
      session.updatedAt = now;
    }

    if (profileContext) {
      const safeDemographics = Object.fromEntries(
        Object.entries(profileContext.demographics ?? {}).map(([field, value]) => [
          field,
          typeof value === 'string' ? redactSensitiveText(value) : value,
        ])
      );
      const safeAnswers = Object.fromEntries(
        Object.entries(profileContext.answers ?? {}).map(([field, value]) => [
          field,
          typeof value === 'string' ? redactSensitiveText(value) : value,
        ])
      );
      session.demographics = { ...session.demographics, ...safeDemographics };
      session.answers = { ...session.answers, ...safeAnswers };
    }

    if (answer) {
      const answerValue = typeof answer.value === 'string' ? redactSensitiveText(answer.value) : answer.value;
      session.answers = { ...session.answers, [answer.fieldKey]: answerValue };
      if (answer.fieldKey === 'age' && typeof answerValue === 'number') session.demographics.age = answerValue;
      if (answer.fieldKey === 'state' && typeof answerValue === 'string') session.demographics.state = answerValue;
      if (answer.fieldKey === 'gender' && ['female', 'male', 'other'].includes(String(answerValue))) {
        session.demographics.gender = answerValue as 'female' | 'male' | 'other';
      }
      if (answer.fieldKey === 'annualIncome' && typeof answerValue === 'number') {
        session.demographics.annualIncome = answerValue;
      }
    }

    const originalTurnMessage = message ?? `Guided answer — ${answer!.fieldKey}: ${String(answer!.value)}`;
    const turnMessage = redactSensitiveText(originalTurnMessage);
    const priorHistory = (session.conversationHistory ?? []).map((entry) => ({
      ...entry,
      content: redactSensitiveText(entry.content),
    }));
    const aiResponse = await processConversationTurn({
      message: turnMessage,
      session,
      language,
      history: priorHistory,
      aiService: getAIService(),
    });

    const responseText = redactSensitiveText(aiResponse.responseText ?? aiResponse.message);
    const safeQuestion = aiResponse.question
      ? {
          ...aiResponse.question,
          prompt: Object.fromEntries(
            Object.entries(aiResponse.question.prompt).map(([code, value]) => [code, redactSensitiveText(value)])
          ),
        }
      : undefined;
    const turnHistory: ConversationHistoryEntry[] = [
      {
        role: 'user',
        content: redactSensitiveText(message ?? `${answer!.fieldKey}: ${String(answer!.value)}`),
        language,
        timestamp: now,
      },
      {
        role: 'assistant',
        content: responseText,
        language,
        timestamp: new Date().toISOString(),
      },
    ];
    session.conversationHistory = [...priorHistory, ...turnHistory].slice(-20);
    session.updatedAt = new Date().toISOString();
    await dbAdapter.saveSession(session);

    return NextResponse.json({
      success: true,
      language,
      locale: languageConfig.locale,
      direction: languageConfig.direction,
      data: { ...aiResponse, question: safeQuestion, message: responseText, responseText },
    });
  } catch {
    // Do not log request bodies or upstream errors; either may contain private user data.
    return NextResponse.json(
      { error: 'Failed to process assistant request. Please try again.' },
      { status: 500 }
    );
  }
}
