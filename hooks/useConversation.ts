'use client';

import { useState, useCallback } from 'react';
import { ChatMessage, GuidedQuestion } from '@/types/conversation';
import { UserProfileSession } from '@/types/session';
import { LanguageCode } from '@/types/language';
import { AIServiceResponse } from '@/types/ai';
import { getLanguageConfig } from '@/lib/i18n/languages';
import { translateKey } from '@/lib/i18n/localization';
import { SAFE_PROFILE_FIELDS } from '@/lib/privacy/profile-fields';

type AnswerValue = string | number | boolean;
interface GuidedAnswerPayload { fieldKey: string; value: AnswerValue }
type ChatPayload = { message?: string; answer?: GuidedAnswerPayload };

/** Conversation requests pass through the server so provider keys never reach the browser. */
export function useConversation(session: UserProfileSession, language: LanguageCode) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [activeQuestion, setActiveQuestion] = useState<GuidedQuestion | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lastFailedTurn, setLastFailedTurn] = useState<ChatPayload | null>(null);

  const requestAssistant = useCallback(
    async (payload: ChatPayload): Promise<AIServiceResponse> => {
      const languageConfig = getLanguageConfig(language);
      const safeFields = new Set<string>(SAFE_PROFILE_FIELDS);
      const profileContext = {
        demographics: Object.fromEntries(
          Object.entries(session.demographics).filter(([field, value]) => safeFields.has(field) && value !== undefined)
        ),
        answers: Object.fromEntries(Object.entries(session.answers).filter(([field]) => safeFields.has(field))),
      };
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: session.sessionId,
          language,
          locale: languageConfig.locale,
          direction: languageConfig.direction,
          profileContext,
          ...payload,
        }),
      });

      if (!res.ok) throw new Error('Chat request failed');
      const result = await res.json();
      return result.data as AIServiceResponse;
    },
    [session.sessionId, session.demographics, session.answers, language]
  );

  const addMessage = useCallback((msg: Omit<ChatMessage, 'id' | 'timestamp'>) => {
    const newMessage: ChatMessage = {
      ...msg,
      id: `msg_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      timestamp: new Date().toISOString(),
    };
    setMessages((previous) => [...previous, newMessage]);
    return newMessage;
  }, []);

  const appendResponse = useCallback((response: AIServiceResponse) => {
    const responseText = response.responseText ?? response.message;
    if (responseText) {
      addMessage({
        role: 'assistant',
        content: responseText,
        language,
        type: response.question ? 'question' : response.suggestedService ? 'service' : 'text',
        metadata: {
          question: response.question,
          service: response.suggestedService,
          eligibilityResult: response.eligibilityResult,
          shouldSpeak: response.shouldSpeak,
          provider: response.provider,
        },
      });
    }
    setActiveQuestion(response.question ?? null);
  }, [addMessage, language]);

  const sendMessage = useCallback(
    async (text: string, isVoice: boolean = false) => {
      if (!session.sessionId || !text.trim()) return;

      const payload: ChatPayload = { message: text };
      addMessage({ role: 'user', content: text, language, type: isVoice ? 'voice' : 'text' });
      setIsTyping(true);
      setActiveQuestion(null);
      setError(null);
      setLastFailedTurn(null);

      try {
        const response = await requestAssistant(payload);
        appendResponse(response);
      } catch {
        setLastFailedTurn(payload);
        setError(translateKey(language, 'errors.generic'));
      } finally {
        setIsTyping(false);
      }
    },
    [addMessage, appendResponse, language, requestAssistant, session.sessionId]
  );

  const answerQuestion = useCallback(
    async (
      fieldKey: string,
      value: AnswerValue,
      onAnswered?: (fieldKey: string, value: AnswerValue) => void
    ) => {
      if (!session.sessionId) return;
      onAnswered?.(fieldKey, value);
      addMessage({ role: 'user', content: String(value), language, type: 'text' });
      setActiveQuestion(null);
      setIsTyping(true);
      setError(null);
      const payload: ChatPayload = { answer: { fieldKey, value } };
      setLastFailedTurn(null);

      try {
        const response = await requestAssistant(payload);
        appendResponse(response);
      } catch {
        setLastFailedTurn(payload);
        setError(translateKey(language, 'errors.generic'));
      } finally {
        setIsTyping(false);
      }
    },
    [addMessage, appendResponse, language, requestAssistant, session.sessionId]
  );

  const retryLastRequest = useCallback(async () => {
    if (!lastFailedTurn || isTyping) return;
    const payload = lastFailedTurn;
    setIsTyping(true);
    setError(null);
    try {
      const response = await requestAssistant(payload);
      appendResponse(response);
      setLastFailedTurn(null);
    } catch {
      setError(translateKey(language, 'errors.generic'));
    } finally {
      setIsTyping(false);
    }
  }, [appendResponse, isTyping, language, lastFailedTurn, requestAssistant]);

  const resetConversation = useCallback(() => {
    setMessages([]);
    setActiveQuestion(null);
    setIsTyping(false);
    setError(null);
    setLastFailedTurn(null);
  }, []);

  return {
    messages,
    isTyping,
    activeQuestion,
    error,
    clearError: useCallback(() => setError(null), []),
    sendMessage,
    answerQuestion,
    retryLastRequest,
    resetConversation,
  };
}
