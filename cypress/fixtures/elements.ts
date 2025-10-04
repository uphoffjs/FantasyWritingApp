// Mock elements for testing
export const createMockElement = (overrides = {}) => ({
  id: 'test-element-1',
  name: 'Test Element',
  type: 'character',
  category: 'Characters',
  answers: {},
  relationships: [],
  completionPercentage: 0,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...overrides
});

export const mockElement = createMockElement();

export const mockElements = [
  createMockElement({ id: 'el-1', name: 'Character 1' }),
  createMockElement({ id: 'el-2', name: 'Character 2', completionPercentage: 50 }),
  createMockElement({ id: 'el-3', name: 'Character 3', completionPercentage: 100 })
];
