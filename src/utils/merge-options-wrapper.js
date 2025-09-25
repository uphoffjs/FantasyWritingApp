// * Wrapper for merge-options to fix ESM/CommonJS interop issue
// ! This fixes the issue where @react-native-async-storage/async-storage
// ! expects a default export from merge-options
import mergeOptions from 'merge-options';

// * Re-export as both default and named export for compatibility
export default mergeOptions;
export { mergeOptions };