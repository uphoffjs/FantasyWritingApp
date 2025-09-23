/**
 * TemplateSelector - Web Version
 * Modal for selecting question templates for worldbuilding elements
 * Uses HTML elements and Tailwind for web rendering
 */

import React, { useState, useMemo } from 'react';
import { QuestionnaireTemplate, ElementCategory } from '../types/models';
import { useWorldbuildingStore } from '../store/worldbuildingStore';
import { DEFAULT_TEMPLATES } from '../types/worldbuilding';
import { getCategoryIcon } from '../utils/categoryMapping';
import { getTestProps } from '../utils/react-native-web-polyfills';

interface TemplateSelectorProps {
  category: ElementCategory;
  onSelectTemplate: (template: QuestionnaireTemplate) => void;
  onClose: () => void;
  visible: boolean;
}

export function TemplateSelector({
  category,
  onSelectTemplate,
  onClose,
  visible,
}: TemplateSelectorProps) {
  const { templates = [] } = useWorldbuildingStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // * Filter templates by category and search query
  const filteredTemplates = useMemo(() => {
    const categoryTemplates = templates.filter(t => t.category === category);

    // * Add default template if it exists
    const defaultTemplate = DEFAULT_TEMPLATES[category];
    if (defaultTemplate && defaultTemplate.questions?.length > 0) {
      const defaultWithId: QuestionnaireTemplate = {
        id: `default-${category}`,
        name: defaultTemplate.name || `Default ${category} Template`,
        description: defaultTemplate.description || '',
        category,
        questions: defaultTemplate.questions,
        isDefault: true,
        author: 'System',
        tags: ['default', 'starter'],
      };
      categoryTemplates.unshift(defaultWithId);
    }

    // * Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return categoryTemplates.filter(
        t =>
          t.name.toLowerCase().includes(query) ||
          t.description?.toLowerCase().includes(query) ||
          t.tags?.some(tag => tag.toLowerCase().includes(query))
      );
    }

    return categoryTemplates;
  }, [templates, category, searchQuery]);

  const handleSelectTemplate = async () => {
    if (!selectedTemplateId) return;

    const template = filteredTemplates.find(t => t.id === selectedTemplateId);
    if (template) {
      setIsLoading(true);
      try {
        await new Promise(resolve => setTimeout(resolve, 500)); // Simulate loading
        onSelectTemplate(template);
        onClose();
      } catch (error) {
        console.error('Failed to apply template:', error);
        alert('Failed to apply template. Please try again.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative bg-gray-800 rounded-lg w-full max-w-3xl max-h-[80vh] shadow-xl">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-100">Select a Template</h2>
              <p className="text-sm text-gray-400 mt-1">
                Choose a questionnaire template for your {category} element
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-200 transition-colors"
              {...getTestProps('close-template-selector')}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="px-6 py-4 border-b border-gray-700">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search templates..."
              className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-100 placeholder-gray-500 focus:outline-none focus:border-indigo-500"
              {...getTestProps('template-search')}
            />
            <svg
              className="absolute left-3 top-2.5 w-5 h-5 text-gray-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>

        {/* Template List */}
        <div className="overflow-y-auto max-h-[50vh] p-6">
          {filteredTemplates.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-4xl mb-4">📭</div>
              <p className="text-gray-400">
                {searchQuery
                  ? 'No templates match your search'
                  : `No templates available for ${category}`}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredTemplates.map((template) => (
                <div
                  key={template.id}
                  className={`border rounded-lg p-4 cursor-pointer transition-all ${
                    selectedTemplateId === template.id
                      ? 'border-indigo-500 bg-indigo-900 bg-opacity-20'
                      : 'border-gray-700 bg-gray-900 hover:border-gray-600'
                  }`}
                  onClick={() => setSelectedTemplateId(template.id)}
                  {...getTestProps(`template-${template.id}`)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-gray-100">{template.name}</h3>
                        {template.isDefault && (
                          <span className="px-2 py-0.5 bg-green-500 bg-opacity-20 text-green-400 text-xs rounded-full">
                            Default
                          </span>
                        )}
                      </div>
                      {template.description && (
                        <p className="text-sm text-gray-400 mb-2">{template.description}</p>
                      )}
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span>📝 {template.questions?.length || 0} questions</span>
                        {template.author && <span>👤 {template.author}</span>}
                      </div>
                      {template.tags && template.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {template.tags.map((tag) => (
                            <span
                              key={tag}
                              className="px-2 py-0.5 bg-gray-700 text-gray-400 text-xs rounded-full"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="ml-4">
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          selectedTemplateId === template.id
                            ? 'border-indigo-500 bg-indigo-500'
                            : 'border-gray-600'
                        }`}
                      >
                        {selectedTemplateId === template.id && (
                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Preview Questions */}
                  {selectedTemplateId === template.id && template.questions && (
                    <div className="mt-4 pt-4 border-t border-gray-700">
                      <h4 className="text-sm font-medium text-gray-300 mb-2">Questions Preview:</h4>
                      <div className="space-y-1">
                        {template.questions.slice(0, 3).map((q, idx) => (
                          <div key={q.id} className="text-xs text-gray-400">
                            {idx + 1}. {q.text}
                          </div>
                        ))}
                        {template.questions.length > 3 && (
                          <div className="text-xs text-gray-500 italic">
                            ...and {template.questions.length - 3} more questions
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="px-6 py-4 border-t border-gray-700 flex justify-between items-center">
          <div className="text-sm text-gray-400">
            {selectedTemplateId && (
              <span>
                Selected: {filteredTemplates.find(t => t.id === selectedTemplateId)?.name}
              </span>
            )}
          </div>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-700 text-gray-100 rounded-lg hover:bg-gray-600 transition-colors"
              {...getTestProps('cancel-template-button')}
            >
              Cancel
            </button>
            <button
              onClick={handleSelectTemplate}
              disabled={!selectedTemplateId || isLoading}
              className={`px-4 py-2 rounded-lg transition-colors ${
                !selectedTemplateId || isLoading
                  ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  : 'bg-indigo-500 text-white hover:bg-indigo-600'
              }`}
              {...getTestProps('apply-template-button')}
            >
              {isLoading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                  </svg>
                  Applying...
                </span>
              ) : (
                'Apply Template'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TemplateSelector;