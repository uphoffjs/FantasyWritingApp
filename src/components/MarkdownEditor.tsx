import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  Pressable,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';

interface MarkdownEditorProps {
  value: string;
  onChange: (text: string) => void;
  placeholder?: string;
  label?: string;
  error?: string;
  minHeight?: number;
  maxHeight?: number;
  showToolbar?: boolean;
  showPreview?: boolean;
}

interface FormattingButton {
  icon: string;
  label: string;
  prefix: string;
  suffix?: string;
  multiline?: boolean;
}

const FORMATTING_BUTTONS: FormattingButton[] = [
  { icon: 'B', label: 'Bold', prefix: '**', suffix: '**' },
  { icon: 'I', label: 'Italic', prefix: '_', suffix: '_' },
  { icon: 'H1', label: 'Heading 1', prefix: '# ' },
  { icon: 'H2', label: 'Heading 2', prefix: '## ' },
  { icon: '•', label: 'Bullet', prefix: '- ' },
  { icon: '1.', label: 'Number', prefix: '1. ' },
  { icon: '[ ]', label: 'Checkbox', prefix: '- [ ] ' },
  { icon: '"', label: 'Quote', prefix: '> ' },
  { icon: '< >', label: 'Code', prefix: '`', suffix: '`' },
  { icon: '---', label: 'Divider', prefix: '\n---\n' },
  { icon: '🔗', label: 'Link', prefix: '[', suffix: '](url)' },
  { icon: '```', label: 'Code Block', prefix: '```\n', suffix: '\n```', multiline: true },
];

export function MarkdownEditor({
  value,
  onChange,
  placeholder = 'Enter text... (Markdown supported)',
  label,
  error,
  minHeight = 120,
  maxHeight = 400,
  showToolbar = true,
  showPreview = false,
}: MarkdownEditorProps) {
  const [selection, setSelection] = useState({ start: 0, end: 0 });
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [inputHeight, setInputHeight] = useState(minHeight);

  const handleFormat = useCallback((button: FormattingButton) => {
    const { start, end } = selection;
    const selectedText = value.substring(start, end);
    const beforeText = value.substring(0, start);
    const afterText = value.substring(end);

    let newText: string;
    let newCursorPosition: number;

    if (button.suffix) {
      // * Wrap selected text
      if (selectedText) {
        newText = `${beforeText}${button.prefix}${selectedText}${button.suffix}${afterText}`;
        newCursorPosition = start + button.prefix.length + selectedText.length + button.suffix.length;
      } else {
        // // DEPRECATED: * Insert with placeholder
        const placeholder = button.multiline ? 'code' : 'text';
        newText = `${beforeText}${button.prefix}${placeholder}${button.suffix}${afterText}`;
        newCursorPosition = start + button.prefix.length;
      }
    } else {
      // TODO: * Prefix only (like headings, lists)
      if (start === 0 || value[start - 1] === '\n') {
        // TODO: * At line start, just add prefix
        newText = `${beforeText}${button.prefix}${afterText}`;
        newCursorPosition = start + button.prefix.length;
      } else {
        // * Not at line start, add newline first
        newText = `${beforeText}\n${button.prefix}${afterText}`;
        newCursorPosition = start + 1 + button.prefix.length;
      }
    }

    onChange(newText);
    // Note: Setting cursor position directly doesn't work reliably in React Native
    // * This is a limitation we have to accept
  }, [value, selection, onChange]);

  const renderPreview = () => {
    // * Simple markdown to text conversion (very basic)
    let previewText = value;
    
    // * Convert headers
    previewText = previewText.replace(/^### (.*?)$/gm, '🔹 $1');
    previewText = previewText.replace(/^## (.*?)$/gm, '🔸 $1');
    previewText = previewText.replace(/^# (.*?)$/gm, '🔶 $1');
    
    // // DEPRECATED: * Convert bold and italic
    previewText = previewText.replace(/\*\*(.*?)\*\*/g, '$1');
    previewText = previewText.replace(/_(.*?)_/g, '$1');
    
    // * Convert lists
    previewText = previewText.replace(/^- \[ \] (.*?)$/gm, '☐ $1');
    previewText = previewText.replace(/^- \[x\] (.*?)$/gm, '☑ $1');
    previewText = previewText.replace(/^- (.*?)$/gm, '• $1');
    previewText = previewText.replace(/^\d+\. (.*?)$/gm, '• $1');
    
    // * Convert quotes
    previewText = previewText.replace(/^> (.*?)$/gm, '│ $1');
    
    // * Convert code blocks
    previewText = previewText.replace(/```[\s\S]*?```/g, '[CODE BLOCK]');
    previewText = previewText.replace(/`(.*?)`/g, '$1');
    
    // * Convert links
    previewText = previewText.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
    
    // * Convert horizontal rules
    previewText = previewText.replace(/^---$/gm, '━━━━━━━━━━━━━━━');

    return previewText;
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      {/* Label */}
      {label && (
        <View style={styles.labelContainer}>
          <Text style={styles.label}>{label}</Text>
          {showPreview && (
            <Pressable
              onPress={() => setIsPreviewMode(!isPreviewMode)}
              style={styles.previewToggle}
            >
              <Text style={styles.previewToggleText}>
                {isPreviewMode ? '✏️ Edit' : '👁️ Preview'}
              </Text>
            </Pressable>
          )}
        </View>
      )}

      {/* Toolbar */}
      {showToolbar && !isPreviewMode && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.toolbar}
          contentContainerStyle={styles.toolbarContent}
        >
          {FORMATTING_BUTTONS.map((button) => (
            <Pressable
              key={button.label}
              style={styles.toolbarButton}
              onPress={() => handleFormat(button)}
            >
              <Text style={styles.toolbarButtonText}>{button.icon}</Text>
            </Pressable>
          ))}
        </ScrollView>
      )}

      {/* Editor/Preview */}
      <View style={[styles.editorContainer, { minHeight, maxHeight }]}>
        {isPreviewMode ? (
          <ScrollView style={styles.preview} showsVerticalScrollIndicator={false}>
            <Text style={styles.previewText}>{renderPreview() || 'Nothing to preview'}</Text>
          </ScrollView>
        ) : (
          <TextInput
            style={[styles.input, { height: Math.max(minHeight, Math.min(inputHeight, maxHeight)) }]}
            value={value}
            onChangeText={onChange}
            placeholder={placeholder} placeholderTextColor="#6B7280"
            multiline
            textAlignVertical="top"
            onSelectionChange={(event) => setSelection(event.nativeEvent.selection)}
            onContentSizeChange={(event) => {
              setInputHeight(event.nativeEvent.contentSize.height);
            }}
            scrollEnabled={inputHeight > maxHeight}
          />
        )}
      </View>

      {/* Error Message */}
      {error && (
        <Text style={styles.error}>{error}</Text>
      )}

      {/* Help Text */}
      {/* ! HARDCODED: Should use design tokens */}
      {!isPreviewMode && (
        <Text style={styles.helpText}>
          Tip: Use **bold**, _italic_, # headers, - lists, &gt; quotes
        </Text>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  labelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '500', color: '#F9FAFB', // ! HARDCODED: Should use design tokens
  },
  previewToggle: {
    paddingHorizontal: 8,
    paddingVertical: 4, backgroundColor: '#374151', // ! HARDCODED: Should use design tokens
    borderRadius: 4,
  },
  previewToggleText: {
    fontSize: 12, color: '#9CA3AF', // ! HARDCODED: Should use design tokens
  },
  toolbar: { backgroundColor: '#1F2937', // ! HARDCODED: Should use design tokens
    borderRadius: 8,
    marginBottom: 8,
    maxHeight: 44,
  },
  toolbarContent: {
    flexDirection: 'row',
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  toolbarButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 4, backgroundColor: '#374151', // ! HARDCODED: Should use design tokens
    borderRadius: 4,
    minWidth: 36,
    alignItems: 'center',
  },
  toolbarButtonText: {
    fontSize: 14,
    fontWeight: '600', color: '#F9FAFB', // ! HARDCODED: Should use design tokens
  },
  editorContainer: { backgroundColor: '#1F2937', // ! HARDCODED: Should use design tokens
    borderRadius: 8,
    borderWidth: 1, borderColor: '#374151', // ! HARDCODED: Should use design tokens
  },
  input: {
    padding: 12,
    fontSize: 14, color: '#F9FAFB', // ! HARDCODED: Should use design tokens
    lineHeight: 20,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  preview: {
    padding: 12,
  },
  previewText: {
    fontSize: 14, color: '#F9FAFB', // ! HARDCODED: Should use design tokens
    lineHeight: 22,
  },
  error: {
    fontSize: 12, color: '#EF4444', // ! HARDCODED: Should use design tokens
    marginTop: 4,
    marginLeft: 4,
  },
  helpText: {
    fontSize: 11, color: '#6B7280', // ! HARDCODED: Should use design tokens
    marginTop: 4,
    marginLeft: 4,
  },
});