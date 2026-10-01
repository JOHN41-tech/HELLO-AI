import { LanguageCode, LocalizedText } from './language';
import { GovernmentService } from './service';
import { EligibilityResult } from './session';

export type MessageRole = 'user' | 'assistant' | 'system';

export interface ConversationHistoryEntry {
  role: 'user' | 'assistant';
  content: string;
  language: LanguageCode;
  timestamp: string;
}

export type MessageType =
  | 'text'
  | 'voice'
  | 'question'
  | 'service'
  | 'eligibility'
  | 'document'
  | 'guidance';

export type QuestionInputType =
  | 'text'
  | 'number'
  | 'single_select'
  | 'multi_select'
  | 'yes_no'
  | 'date';

export interface QuestionOption {
  label: LocalizedText;
  value: string | number | boolean;
}

export interface GuidedQuestion {
  id: string;
  fieldKey: string;
  prompt: LocalizedText;
  helpText?: LocalizedText;
  inputType: QuestionInputType;
  options?: QuestionOption[];
  defaultValue?: string | number | boolean;
  required: boolean;
}

export interface ChatMessageMetadata {
  audioUrl?: string;
  question?: GuidedQuestion;
  service?: GovernmentService;
  eligibilityResult?: EligibilityResult;
  stepIndex?: number;
  isAudioPlaying?: boolean;
  shouldSpeak?: boolean;
  provider?: 'gemini' | 'mock' | 'fallback';
}

export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: string; // ISO string
  language: LanguageCode;
  type: MessageType;
  metadata?: ChatMessageMetadata;
}
