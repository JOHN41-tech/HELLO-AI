'use client';

import React, { useState } from 'react';
import { GuidedQuestion } from '@/types/conversation';
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
  const [inputValue, setInputValue] = useState<string>('');
  const [selectedOption, setSelectedOption] = useState<string | number | boolean | null>(null);

  const promptText = translateLocalizedText(language, question.prompt);
  const helpText = question.helpText ? translateLocalizedText(language, question.helpText) : '';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedOption !== null) {
      onAnswer(question.fieldKey, selectedOption);
    } else if (inputValue.trim()) {
      const val = question.inputType === 'number' ? Number(inputValue) : inputValue;
      onAnswer(question.fieldKey, val);
    }
  };

  return (
    <Card className="border-emerald-500/40 bg-slate-900/95 my-3 shadow-xl ring-1 ring-emerald-500/20">
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-xl bg-emerald-950/80 text-emerald-400 border border-emerald-500/30 shrink-0">
          <HelpCircle className="w-5 h-5" />
        </div>
        <div className="flex-1">
          <h3 className="text-base sm:text-lg font-bold text-emerald-300 leading-snug">{promptText}</h3>
          {helpText && <p className="text-xs text-slate-400 mt-1">{helpText}</p>}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mt-4 space-y-3">
        {question.options && question.options.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {question.options.map((opt, idx) => {
              const label = translateLocalizedText(language, opt.label);
              const isSelected = selectedOption === opt.value;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setSelectedOption(opt.value);
                    onAnswer(question.fieldKey, opt.value);
                  }}
                  className={`flex items-center justify-between p-3.5 rounded-xl border text-start text-sm font-semibold transition-all min-h-[48px] cursor-pointer ${
                    isSelected
                      ? 'bg-emerald-600 text-white border-emerald-400 shadow-md'
                      : 'bg-slate-800/80 text-slate-200 border-slate-700 hover:border-emerald-500/50 hover:bg-slate-800'
                  }`}
                >
                  <span>{label}</span>
                  {isSelected && <CheckCircle2 className="w-4 h-4 text-white shrink-0" />}
                </button>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row gap-2">
            <label htmlFor={`guided-input-${question.id}`} className="sr-only">
              {promptText || t('assistant.typeAnswer')}
            </label>
            <input
              id={`guided-input-${question.id}`}
              type={question.inputType === 'number' ? 'number' : 'text'}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={t('assistant.typeAnswer')}
              aria-label={promptText || t('assistant.typeAnswer')}
              className="flex-1 bg-slate-950 border border-slate-700 focus:border-emerald-400 text-slate-100 rounded-xl px-4 py-3 text-base outline-none min-h-[48px]"
              autoFocus
            />
            <Button
              type="submit"
              variant="primary"
              size="md"
              aria-label={t('actions.submit')}
            >
              {t('actions.submit')}
            </Button>
          </div>
        )}
      </form>
    </Card>
  );
}
