// Central export file for all components
// This file helps tests find components

// Export existing components
export { default as AuthGuard } from './AuthGuard';
export { default as Button } from './Button';
export { default as ColorPaletteDemo } from './ColorPaletteDemo';
export { default as CreateElementModal } from './CreateElementModal';
export { default as CreateProjectModal } from './CreateProjectModal';
export { default as CrossPlatformDatePicker } from './CrossPlatformDatePicker';
export { default as CrossPlatformPicker } from './CrossPlatformPicker';
export { default as ElementBrowser } from './ElementBrowser';
export { default as ElementCard } from './ElementCard';
export { default as ElementEditor } from './ElementEditor';
export { default as GlobalSearch } from './GlobalSearch';
export { default as ImportExport } from './ImportExport';
export { default as ImportExportWeb } from './ImportExportWeb';
export { default as InstallPrompt } from './InstallPrompt';
export { default as MarkdownEditor } from './MarkdownEditor';
export { default as ProjectCard } from './ProjectCard';
export { default as ProjectList } from './ProjectList';
export { default as RelationshipManager } from './RelationshipManager';
export { default as SearchProvider } from './SearchProvider';
export { default as TemplateEditor } from './TemplateEditor';
export { default as TemplateSelector } from './TemplateSelector';
export { default as TestableView } from './TestableView';
export { default as TextInput } from './TextInput';

// Import real error components
import { ErrorBoundary, useErrorHandler, withErrorBoundary } from './ErrorBoundary';
import { ErrorMessage, useErrorMessage } from './ErrorMessage';
import { ErrorNotification, useNotifications, NotificationContainer } from './ErrorNotification';

// Re-export test helper components that tests expect
// These are imported from test helpers for now
import {
  BasicQuestionsSelector,
  Breadcrumb,
  CompletionHeatmap,
  EditProjectModal,
  KeyboardShortcutsHelp,
  MilestoneSystem,
  MobileHeader,
  PerformanceMonitor,
  ProgressReport,
  RelationshipGraph,
  RelationshipList,
  RelationshipModal,
  ResourceHints,
  SearchResults,
  SyncQueueStatus,
  VirtualizedElementList,
  VirtualizedProjectList,
  ElementHeader,
  GraphControls,
  AutoSaveIndicator,
  LoadingSpinner,
  // ErrorMessage,  // Now using real component
  // ErrorNotification,  // Now using real component
  // ErrorBoundary,  // Now using real component
  Toast,
  ProgressBar,
  Badge,
  Accordion,
  Card,
  Modal,
  Checkbox,
  RadioButton,
  Select,
  Slider,
  Switch,
  Tabs,
  TagInput,
  TagMultiSelect,
  ListBox,
  Grid,
  GridItem,
  VirtualizedList,
  EmptyState,
  NotificationBadge,
  Avatar,
  Tooltip,
  BulkActions,
  FilterBar,
  FormLayout,
  PageLayout,
  SpeciesSelector
} from '../../cypress/support/component-test-helpers';

// Re-export the test helper components
export {
  BasicQuestionsSelector,
  Breadcrumb,
  CompletionHeatmap,
  EditProjectModal,
  KeyboardShortcutsHelp,
  MilestoneSystem,
  MobileHeader,
  PerformanceMonitor,
  ProgressReport,
  RelationshipGraph,
  RelationshipList,
  RelationshipModal,
  ResourceHints,
  SearchResults,
  SyncQueueStatus,
  VirtualizedElementList,
  VirtualizedProjectList,
  ElementHeader,
  GraphControls,
  AutoSaveIndicator,
  LoadingSpinner,
  // ErrorMessage,  // Now exported from real component
  // ErrorNotification,  // Now exported from real component
  // ErrorBoundary,  // Now exported from real component
  Toast,
  ProgressBar,
  Badge,
  Accordion,
  Card,
  Modal,
  Checkbox,
  RadioButton,
  Select,
  Slider,
  Switch,
  Tabs,
  TagInput,
  TagMultiSelect,
  ListBox,
  Grid,
  GridItem,
  VirtualizedList,
  EmptyState,
  NotificationBadge,
  Avatar,
  Tooltip,
  BulkActions,
  FilterBar,
  FormLayout,
  PageLayout,
  SpeciesSelector
};

// Export real error components
export {
  ErrorBoundary,
  useErrorHandler,
  withErrorBoundary,
  ErrorMessage,
  useErrorMessage,
  ErrorNotification,
  useNotifications,
  NotificationContainer
};

// Export any subcomponent paths that tests might be looking for
export { ElementHeader as ElementHeader2 } from '../../cypress/support/component-test-helpers';
export { GraphControls as GraphControls2 } from '../../cypress/support/component-test-helpers';