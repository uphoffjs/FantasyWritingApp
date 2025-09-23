/**
 * ElementEditor - Web Version
 * Editor for worldbuilding element details and questionnaires
 * Uses HTML elements and Tailwind for web rendering
 */

import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { WorldElement, Question, Answer } from '../types/models';
import { useWorldbuildingStore } from '../store/worldbuildingStore';
import { getTestProps } from '../utils/react-native-web-polyfills';

interface ElementEditorProps {
  element: WorldElement;
  projectId: string;
  onSave?: () => void;
  onCancel?: () => void;
  autoSave?: boolean;
}

interface QuestionFieldProps {
  question: Question;
  value: any;
  onChange: (value: any) => void;
  disabled?: boolean;
}

function QuestionField({ question, value, onChange, disabled }: QuestionFieldProps) {
  // * Handle text input
  if (question.type === 'text') {
    return (
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-300 mb-2">
          {question.text}
          {question.required && <span className="text-red-400 ml-1">*</span>}
        </label>
        {question.helpText && (
          <p className="text-xs text-gray-500 mb-2">{question.helpText}</p>
        )}
        <input
          type="text"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          placeholder={question.placeholder}
          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-100 placeholder-gray-500 focus:outline-none focus:border-indigo-500 disabled:opacity-50"
          {...getTestProps(`question-${question.id}`)}
        />
      </div>
    );
  }

  // * Handle long text input
  if (question.type === 'longText') {
    return (
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-300 mb-2">
          {question.text}
          {question.required && <span className="text-red-400 ml-1">*</span>}
        </label>
        {question.helpText && (
          <p className="text-xs text-gray-500 mb-2">{question.helpText}</p>
        )}
        <textarea
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          placeholder={question.placeholder}
          rows={4}
          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-100 placeholder-gray-500 focus:outline-none focus:border-indigo-500 disabled:opacity-50 resize-vertical"
          {...getTestProps(`question-${question.id}`)}
        />
      </div>
    );
  }

  // * Handle select/dropdown
  if (question.type === 'select' && question.options) {
    return (
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-300 mb-2">
          {question.text}
          {question.required && <span className="text-red-400 ml-1">*</span>}
        </label>
        {question.helpText && (
          <p className="text-xs text-gray-500 mb-2">{question.helpText}</p>
        )}
        <select
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-100 focus:outline-none focus:border-indigo-500 disabled:opacity-50"
          {...getTestProps(`question-${question.id}`)}
        >
          <option value="">Select an option...</option>
          {question.options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>
    );
  }

  // * Handle number input
  if (question.type === 'number') {
    return (
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-300 mb-2">
          {question.text}
          {question.required && <span className="text-red-400 ml-1">*</span>}
        </label>
        {question.helpText && (
          <p className="text-xs text-gray-500 mb-2">{question.helpText}</p>
        )}
        <input
          type="number"
          value={value || ''}
          onChange={(e) => onChange(e.target.value ? Number(e.target.value) : null)}
          disabled={disabled}
          placeholder={question.placeholder}
          min={question.min}
          max={question.max}
          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-100 placeholder-gray-500 focus:outline-none focus:border-indigo-500 disabled:opacity-50"
          {...getTestProps(`question-${question.id}`)}
        />
      </div>
    );
  }

  // * Handle boolean/switch
  if (question.type === 'boolean') {
    return (
      <div className="mb-6">
        <label className="flex items-center justify-between cursor-pointer">
          <div className="flex-1">
            <span className="block text-sm font-medium text-gray-300">
              {question.text}
              {question.required && <span className="text-red-400 ml-1">*</span>}
            </span>
            {question.helpText && (
              <p className="text-xs text-gray-500 mt-1">{question.helpText}</p>
            )}
          </div>
          <div className="ml-4">
            <input
              type="checkbox"
              checked={value || false}
              onChange={(e) => onChange(e.target.checked)}
              disabled={disabled}
              className="sr-only"
              {...getTestProps(`question-${question.id}`)}
            />
            <div
              className={`w-11 h-6 rounded-full transition-colors ${
                value ? 'bg-indigo-500' : 'bg-gray-600'
              } ${disabled ? 'opacity-50' : ''}`}
            >
              <div
                className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform ${
                  value ? 'translate-x-6' : 'translate-x-0.5'
                } mt-0.5`}
              />
            </div>
          </div>
        </label>
      </div>
    );
  }

  // * Handle date input
  if (question.type === 'date') {
    return (
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-300 mb-2">
          {question.text}
          {question.required && <span className="text-red-400 ml-1">*</span>}
        </label>
        {question.helpText && (
          <p className="text-xs text-gray-500 mb-2">{question.helpText}</p>
        )}
        <input
          type="date"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-100 placeholder-gray-500 focus:outline-none focus:border-indigo-500 disabled:opacity-50"
          {...getTestProps(`question-${question.id}`)}
        />
      </div>
    );
  }

  // * Fallback for unknown types
  return null;
}

export function ElementEditor({
  element,
  projectId,
  onSave,
  onCancel,
  autoSave = false,
}: ElementEditorProps) {
  const { updateElement, updateAnswer } = useWorldbuildingStore();
  const [elementData, setElementData] = useState({
    name: element.name || '',
    description: element.description || '',
  });
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // * Initialize answers from element
  useEffect(() => {
    if (element.questions) {
      const initialAnswers: Record<string, any> = {};
      element.questions.forEach((question) => {
        if (element.answers) {
          const existingAnswer = element.answers[question.id];
          if (existingAnswer !== undefined) {
            initialAnswers[question.id] = existingAnswer;
          }
        }
      });
      setAnswers(initialAnswers);
    }
  }, [element]);

  // * Auto-save functionality
  useEffect(() => {
    if (autoSave && hasChanges) {
      const timer = setTimeout(() => {
        handleSave();
      }, 2000); // Auto-save after 2 seconds of no changes

      return () => clearTimeout(timer);
    }
  }, [hasChanges, elementData, answers, autoSave]);

  const handleElementChange = (field: string, value: string) => {
    setElementData((prev) => ({
      ...prev,
      [field]: value,
    }));
    setHasChanges(true);
  };

  const handleAnswerChange = (questionId: string, value: any) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: value,
    }));
    setHasChanges(true);
  };

  const handleSave = useCallback(async () => {
    setIsSaving(true);
    try {
      // * Update element basic info
      await updateElement(projectId, element.id, elementData);

      // * Update answers
      if (element.questions) {
        for (const question of element.questions) {
          if (answers[question.id] !== undefined) {
            await updateAnswer(projectId, element.id, question.id, answers[question.id]);
          }
        }
      }

      setHasChanges(false);
      setLastSaved(new Date());
      onSave?.();
    } catch (error) {
      console.error('Failed to save element:', error);
      alert('Failed to save changes. Please try again.');
    } finally {
      setIsSaving(false);
    }
  }, [elementData, answers, element, projectId, updateElement, updateAnswer, onSave]);

  // * Calculate question progress
  const questionProgress = useMemo(() => {
    if (!element.questions || element.questions.length === 0) {
      return { answered: 0, total: 0, percentage: 0 };
    }

    const answered = element.questions.filter(
      (q) => answers[q.id] !== undefined && answers[q.id] !== '' && answers[q.id] !== null
    ).length;

    const total = element.questions.length;
    const percentage = Math.round((answered / total) * 100);

    return { answered, total, percentage };
  }, [element.questions, answers]);

  return (
    <div className="p-6">
      {/* Basic Information */}
      <div className="bg-gray-800 rounded-lg p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-100 mb-4">Basic Information</h3>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Element Name
          </label>
          <input
            type="text"
            value={elementData.name}
            onChange={(e) => handleElementChange('name', e.target.value)}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-100 placeholder-gray-500 focus:outline-none focus:border-indigo-500"
            placeholder="Enter element name..."
            {...getTestProps('element-name-input')}
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Description
          </label>
          <textarea
            value={elementData.description}
            onChange={(e) => handleElementChange('description', e.target.value)}
            rows={3}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-100 placeholder-gray-500 focus:outline-none focus:border-indigo-500 resize-vertical"
            placeholder="Enter a brief description..."
            {...getTestProps('element-description-input')}
          />
        </div>

        {/* Save status */}
        {autoSave && (
          <div className="flex items-center justify-between text-sm">
            <div className="text-gray-400">
              {isSaving ? (
                <span className="flex items-center">
                  <svg className="animate-spin h-4 w-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                    <path className="opacity-75" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                  </svg>
                  Saving...
                </span>
              ) : hasChanges ? (
                <span className="text-yellow-400">Unsaved changes</span>
              ) : lastSaved ? (
                <span className="text-green-400">
                  Saved {lastSaved.toLocaleTimeString()}
                </span>
              ) : null}
            </div>
            {!autoSave && (
              <button
                onClick={handleSave}
                disabled={!hasChanges || isSaving}
                className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                {...getTestProps('save-button')}
              >
                Save Changes
              </button>
            )}
          </div>
        )}
      </div>

      {/* Questions */}
      {element.questions && element.questions.length > 0 && (
        <div className="bg-gray-800 rounded-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-100">Questions</h3>
            <div className="text-sm text-gray-400">
              {questionProgress.answered} / {questionProgress.total} answered ({questionProgress.percentage}%)
            </div>
          </div>

          <div className="space-y-6">
            {element.questions.map((question, index) => (
              <div key={question.id} className="border-b border-gray-700 last:border-b-0 pb-6 last:pb-0">
                <QuestionField
                  question={question}
                  value={answers[question.id]}
                  onChange={(value) => handleAnswerChange(question.id, value)}
                  disabled={isSaving}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* No questions message */}
      {(!element.questions || element.questions.length === 0) && (
        <div className="bg-gray-800 rounded-lg p-6 text-center">
          <div className="text-4xl mb-4">📝</div>
          <p className="text-gray-400 mb-4">No questions defined for this element yet.</p>
          <p className="text-sm text-gray-500">
            Select a template to add questions for this element type.
          </p>
        </div>
      )}
    </div>
  );
}

export default ElementEditor;