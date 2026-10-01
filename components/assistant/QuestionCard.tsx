'use client';

import React, { useId, useState } from 'react';
import { GuidedQuestion, QuestionOption } from '@/types/conversation';
import { LanguageCode } from '@/types/language';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { HelpCircle, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import { translateLocalizedText } from '@/lib/i18n/localization';

export interface QuestionCardProps {
  question: GuidedQuestion;
  language: LanguageCode;
  onAnswer: (fieldKey: string, value: string | number | boolean) => void;
}

export function QuestionCard({ question, language, onAnswer }: QuestionCardProps) {
  const { t } = useLanguage();
  const questionId = useId();
  const [inputValue, setInputValue] = useState('');
  const [selectedOption, setSelectedOption] = useState<string | number | boolean | null>(null);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const promptText = translateLocalizedText(language, question.prompt);
  const helpText = question.helpText ? translateLocalizedText(language, question.helpText) : '';
  const choiceOptions: QuestionOption[] = question.options?.length
    ? question.options
    : question.inputType === 'yes_no'
      ? [
          { label: { [language]: t('common.yes') }, value: true },
          { label: { [language]: t('common.no') }, value: false },
        ]
      : [];

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (hasSubmitted) return;
    if (selectedOption !== null) {
      setHasSubmitted(true);
      onAnswer(question.fieldKey, selectedOption);
    } else if (inputValue.trim()) {
      setHasSubmitted(true);
      const value = question.inputType === 'number' ? Number(inputValue) : inputValue;
      onAnswer(question.fieldKey, value);
    }
  };

  return (
    <Card className="my-2 border-emerald-500/30 bg-slate-900" role="group" aria-labelledby={`${questionId}-title`}>
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-950 text-emerald-400">
          <HelpCircle className="h-5 w-5" aria-hidden="true" />
        </div>
        <div className="min-w-0 flex-1">
          <h3 id={`${questionId}-title`} className="text-base font-bold leading-snug text-slate-100 sm:text-lg">
            {promptText}
          </h3>
          {helpText && <p className="mt-1 text-sm leading-relaxed text-slate-500">{helpText}</p>}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mt-4 space-y-3">
        {choiceOptions.length > 0 ? (
          <fieldset disabled={hasSubmitted}>
            <legend className="sr-only">{promptText}</legend>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {choiceOptions.map((option, index) => {
                const label = translateLocalizedText(language, option.label);
                const isSelected = selectedOption === option.value;
                return (
                  <button
                    key={`${String(option.value)}-${index}`}
                    type="button"
                    onClick={() => {
                      if (hasSubmitted) return;
                      setSelectedOption(option.value);
                      setHasSubmitted(true);
                      onAnswer(question.fieldKey, option.value);
                    }}
                    className={`flex min-h-12 items-center justify-between gap-3 rounded-xl border px-4 py-3 text-start text-sm font-semibold transition-colors disabled:cursor-default disabled:opacity-75 ${
                      isSelected
                        ? 'border-emerald-500 bg-emerald-950 text-emerald-400'
                        : 'border-slate-800 bg-slate-950 text-slate-300 hover:border-emerald-500/50 hover:bg-emerald-950'
                    }`}
                    aria-pressed={isSelected}
                  >
                    <span className="leading-snug">{label}</span>
                    {isSelected && <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden="true" />}
                  </button>
                );
              })}
            </div>
          </fieldset>
        ) : (
          <div className="flex flex-col gap-2 sm:flex-row">
            <label htmlFor={`${questionId}-input`} className="sr-only">
              {promptText || t('assistant.typeAnswer')}
            </label>
            <input
              id={`${questionId}-input`}
              type={question.inputType === 'number' ? 'number' : question.inputType === 'date' ? 'date' : 'text'}
              inputMode={question.inputType === 'number' ? 'numeric' : undefined}
              value={inputValue}
              onChange={(event) => setInputValue(event.target.value)}
              placeholder={question.inputType === 'date' ? undefined : t('assistant.typeAnswer')}
              aria-label={promptText || t('assistant.typeAnswer')}
              className="min-h-12 min-w-0 flex-1 rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-base text-slate-100 placeholder:text-slate-500 focus:border-emerald-500 focus:outline-none"
              maxLength={1000}
              disabled={hasSubmitted}
            />
            <Button type="submit" variant="primary" size="md" disabled={!inputValue.trim() || hasSubmitted}>
              {t('actions.continue')}
            </Button>
          </div>
        )}
      </form>
    </Card>
  );
}
