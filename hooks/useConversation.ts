'use client';

import { useState, useCallback } from 'react';
import { ChatMessage, GuidedQuestion } from '@/types/conversation';
import { UserProfileSession } from '@/types/session';
import { LanguageCode } from '@/types/language';
import { AIServiceResponse } from '@/types/ai';
import { translateKey, translateLocalizedText } from '@/lib/i18n/localization';

type AnswerValue = string | number | boolean;

interface GuidedAnswerPayload {
  fieldKey: string;
  value: AnswerValue;
}

/**
 * Conversation state for the assistant.
 *
 * Requests go through POST /api/chat rather than calling the AI service directly so the
 * selected language, locale, and session state are validated and persisted server-side.
 * Message history stays in the browser, so switching language never clears the thread.
 */
export function useConversation(session: UserProfileSession, language: LanguageCode) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [activeQuestion, setActiveQuestion] = useState<GuidedQuestion | null>(null);
  const [error, setError] = useState<string | null>(null);

  const requestAssistant = useCallback(
    async (payload: { message?: string; answer?: GuidedAnswerPayload }): Promise<AIServiceResponse> => {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: session.sessionId, language, ...payload }),
      });

      if (!res.ok) {
        throw new Error(`Chat request failed with status ${res.status}`);
      }

      const result = await res.json();
      return result.data as AIServiceResponse;
    },
    [session.sessionId, language]
  );

  const addMessage = useCallback((msg: Omit<ChatMessage, 'id' | 'timestamp'>) => {
    const newMessage: ChatMessage = {
      ...msg,
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, newMessage]);
    return newMessage;
  }, []);

  const sendMessage = useCallback(
    async (text: string, isVoice: boolean = false) => {
      if (!text.trim()) return;

      // 1. Add user message
      addMessage({
        role: 'user',
        content: text,
        language,
        type: isVoice ? 'voice' : 'text',
      });

      setIsTyping(true);
      setActiveQuestion(null);
      setError(null);

      try {
        const response = await requestAssistant({ message: text });

        setIsTyping(false);

        if (response.message) {
          addMessage({
            role: 'assistant',
            content: response.message,
            language,
            type: 'text',
          });
        }

        if (response.question) {
          setActiveQuestion(response.question);
          addMessage({
            role: 'assistant',
            content: translateLocalizedText(language, response.question.prompt),
            language,
            type: 'question',
            metadata: { question: response.question },
          });
        }

        if (response.suggestedService) {
          addMessage({
            role: 'assistant',
            content: translateKey(language, 'assistant.schemeSuggestion'),
            language,
            type: 'service',
            metadata: {
              service: response.suggestedService,
              eligibilityResult: response.eligibilityResult,
            },
          });
        }
      } catch {
        setIsTyping(false);
        setError(translateKey(language, 'errors.generic'));
      }
    },
    [addMessage, language, requestAssistant]
  );

  const answerQuestion = useCallback(
    async (fieldKey: string, value: string | number | boolean, onAnswered?: (fieldKey: string, value: string | number | boolean) => void) => {
      onAnswered?.(fieldKey, value);

      const labelText = String(value);
      addMessage({
        role: 'user',
        content: labelText,
        language,
        type: 'text',
      });

      setActiveQuestion(null);
      setIsTyping(true);
      setError(null);

      try {
        // Guided answers travel as structured data so the server can persist the value
        // against the session. No translated instruction string crosses the wire.
        const response = await requestAssistant({ answer: { fieldKey, value } });
        setIsTyping(false);

        if (response.message) {
          addMessage({
            role: 'assistant',
            content: response.message,
            language,
            type: 'text',
          });
        }

        if (response.question) {
          setActiveQuestion(response.question);
          addMessage({
            role: 'assistant',
            content: translateLocalizedText(language, response.question.prompt),
            language,
            type: 'question',
            metadata: { question: response.question },
          });
        } else if (response.suggestedService) {
          addMessage({
            role: 'assistant',
            content: translateKey(language, 'assistant.schemeMatched'),
            language,
            type: 'service',
            metadata: {
              service: response.suggestedService,
              eligibilityResult: response.eligibilityResult,
            },
          });
        }
      } catch {
        setIsTyping(false);
        setError(translateKey(language, 'errors.generic'));
      }
    },
    [addMessage, language, requestAssistant]
  );

  const resetConversation = useCallback(() => {
    setMessages([]);
    setActiveQuestion(null);
    setIsTyping(false);
    setError(null);
  }, []);

  return {
    messages,
    isTyping,
    activeQuestion,
    error,
    clearError: useCallback(() => setError(null), []),
    sendMessage,
    answerQuestion,
    resetConversation,
  };
}
