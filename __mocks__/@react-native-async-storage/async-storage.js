// * Mock for @react-native-async-storage/async-storage
// * Provides in-memory storage for testing

const mockStorage = {};

const AsyncStorageMock = {
  setItem: jest.fn((key, value) => {
    mockStorage[key] = value;
    return Promise.resolve(null);
  }),

  getItem: jest.fn((key) => {
    return Promise.resolve(mockStorage[key] || null);
  }),

  removeItem: jest.fn((key) => {
    delete mockStorage[key];
    return Promise.resolve(null);
  }),

  clear: jest.fn(() => {
    Object.keys(mockStorage).forEach((key) => delete mockStorage[key]);
    return Promise.resolve(null);
  }),

  getAllKeys: jest.fn(() => {
    return Promise.resolve(Object.keys(mockStorage));
  }),

  multiGet: jest.fn((keys) => {
    const result = keys.map((key) => [key, mockStorage[key] || null]);
    return Promise.resolve(result);
  }),

  multiSet: jest.fn((pairs) => {
    pairs.forEach(([key, value]) => {
      mockStorage[key] = value;
    });
    return Promise.resolve(null);
  }),

  multiRemove: jest.fn((keys) => {
    keys.forEach((key) => delete mockStorage[key]);
    return Promise.resolve(null);
  }),

  mergeItem: jest.fn((key, value) => {
    const existing = mockStorage[key];
    if (existing) {
      const existingObj = JSON.parse(existing);
      const newObj = JSON.parse(value);
      const merged = { ...existingObj, ...newObj };
      mockStorage[key] = JSON.stringify(merged);
    } else {
      mockStorage[key] = value;
    }
    return Promise.resolve(null);
  }),

  multiMerge: jest.fn((pairs) => {
    pairs.forEach(([key, value]) => {
      const existing = mockStorage[key];
      if (existing) {
        const existingObj = JSON.parse(existing);
        const newObj = JSON.parse(value);
        const merged = { ...existingObj, ...newObj };
        mockStorage[key] = JSON.stringify(merged);
      } else {
        mockStorage[key] = value;
      }
    });
    return Promise.resolve(null);
  }),

  flushGetRequests: jest.fn(() => {
    return Promise.resolve(null);
  }),
};

export default AsyncStorageMock;