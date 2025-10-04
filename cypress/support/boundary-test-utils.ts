// * Utility functions and test data for boundary condition testing
// * Helps ensure components handle edge cases properly

/**
 * Collection of boundary test values for various data types
 */
export const BoundaryValues = {
  // * String boundaries
  strings: {
    empty: '',
    single: 'a',
    veryShort: 'ab',
    normal: 'This is a normal string',
    long: 'a'.repeat(255),
    veryLong: 'a'.repeat(1000),
    extremelyLong: 'a'.repeat(10000),
    withSpaces: '   spaced   ',
    onlySpaces: '     ',
    withNewlines: 'line1\nline2\nline3',
    withTabs: 'tab\there\ttabs',
    withSpecialChars: '!@#$%^&*()_+-=[]{}|;\':",./<>?',
    withEmoji: '😀 emoji 🎉 test 🚀',
    withUnicode: '你好世界 مرحبا بالعالم हैलो वर्ल्ड',
    withHtml: '<script>alert("xss")</script>',
    withSql: "'; DROP TABLE users; --",
    withEscapeChars: '\\n\\t\\r\\\'\\"\\\\'
  },

  // * Number boundaries
  numbers: {
    zero: 0,
    one: 1,
    negativeOne: -1,
    smallPositive: 0.0001,
    smallNegative: -0.0001,
    largePositive: 999999,
    largeNegative: -999999,
    maxSafeInteger: Number.MAX_SAFE_INTEGER,
    minSafeInteger: Number.MIN_SAFE_INTEGER,
    infinity: Infinity,
    negativeInfinity: -Infinity,
    notANumber: NaN,
    decimal: 3.14159,
    negativeDecimal: -3.14159,
    scientificNotation: 1.23e10,
    verySmallDecimal: 0.000000001
  },

  // * Array boundaries
  arrays: {
    empty: [],
    single: ['one'],
    small: ['one', 'two'],
    normal: ['one', 'two', 'three', 'four', 'five'],
    large: new Array(100).fill('item'),
    veryLarge: new Array(1000).fill('item'),
    mixed: [1, 'string', true, null, undefined, { obj: true }, [1, 2]],
    nested: [[1, 2], [3, 4], [5, 6]],
    deeplyNested: [[[[[[['deep']]]]]]],
    withNulls: [null, null, null],
    withUndefined: [undefined, undefined],
    sparse: Object.assign([], { 0: 'first', 999: 'last' })
  },

  // * Object boundaries
  objects: {
    empty: {},
    single: { key: 'value' },
    small: { key1: 'value1', key2: 'value2' },
    normal: { id: 1, name: 'Test', value: 100, active: true },
    large: Object.fromEntries(
      Array.from({ length: 100 }, (_, i) => [`key${i}`, `value${i}`])
    ),
    veryLarge: Object.fromEntries(
      Array.from({ length: 1000 }, (_, i) => [`key${i}`, `value${i}`])
    ),
    nested: { level1: { level2: { level3: { level4: 'deep' } } } },
    circular: (() => {
      const obj: Record<string, unknown> = { prop: 'value' };
      obj.self = obj;
      return obj;
    })(),
    withNullValues: { key1: null, key2: null },
    withUndefinedValues: { key1: undefined, key2: undefined },
    withSpecialKeys: {
      '': 'empty key',
      ' ': 'space key',
      '123': 'numeric key',
      'key-with-dash': 'dashed',
      'key.with.dots': 'dotted',
      'key with spaces': 'spaced'
    }
  },

  // * Date boundaries
  dates: {
    now: new Date(),
    epoch: new Date(0),
    future: new Date('2099-12-31'),
    past: new Date('1900-01-01'),
    invalid: new Date('invalid'),
    leapDay: new Date('2024-02-29'),
    endOfYear: new Date('2023-12-31'),
    startOfYear: new Date('2023-01-01'),
    midnightUTC: new Date('2023-06-15T00:00:00.000Z'),
    justBeforeMidnight: new Date('2023-06-15T23:59:59.999Z')
  },

  // * Boolean boundaries (simple but complete)
  booleans: {
    true: true,
    false: false,
    truthy: [1, 'string', [], {}, true],
    falsy: [0, '', null, undefined, false, NaN]
  },

  // * Null and undefined
  nullish: {
    null: null,
    undefined: undefined,
    void0: undefined
  }
};

/**
 * Test data for form inputs
 */
export const FormBoundaryData = {
  // * Text input boundaries
  textInputs: {
    valid: ['Normal text', 'user@example.com', 'John Doe'],
    empty: ['', '   ', '\t\n'],
    tooShort: ['a', 'ab'],
    tooLong: ['x'.repeat(256), 'x'.repeat(1000)],
    special: ['<script>alert(1)</script>', "Robert'); DROP TABLE users;--"],
    unicode: ['😀🎉', '你好', 'مرحبا', 'こんにちは']
  },

  // * Number input boundaries
  numberInputs: {
    valid: [0, 1, 100, -50, 3.14],
    boundaries: [Number.MAX_SAFE_INTEGER, Number.MIN_SAFE_INTEGER],
    invalid: [NaN, Infinity, -Infinity],
    strings: ['123', '3.14', '1e5', 'not a number']
  },

  // * Email validation
  emails: {
    valid: [
      'user@example.com',
      'user.name@example.com',
      'user+tag@example.co.uk',
      'user_123@test-domain.org'
    ],
    invalid: [
      'notanemail',
      '@example.com',
      'user@',
      'user @example.com',
      'user@.com',
      'user@example',
      'user..name@example.com'
    ],
    edge: [
      'a@b.c', // Minimum valid
      'very.long.email.address.that.might.cause.issues@very.long.domain.name.example.com',
      '"special@chars"@example.com',
      'user@[192.168.1.1]' // IP address domain
    ]
  },

  // ! SECURITY: * Password validation
  passwords: {
    weak: ['123', 'password', 'abc'],
    medium: ['Password1', 'Test123!'],
    strong: ['MyS3cur3P@ssw0rd!', 'Correct-Horse-Battery-Staple'],
    edge: ['', ' ', 'a'.repeat(100)]
  },

  // * File uploads
  files: {
    sizes: {
      empty: 0,
      tiny: 1, // 1 byte
      small: 1024, // 1KB
      medium: 1024 * 1024, // 1MB
      large: 10 * 1024 * 1024, // 10MB
      veryLarge: 100 * 1024 * 1024 // 100MB
    },
    names: {
      normal: 'document.pdf',
      noExtension: 'document',
      multipleExtensions: 'document.tar.gz',
      special: 'my file (1).pdf',
      veryLong: 'x'.repeat(255) + '.pdf',
      unicode: '文档.pdf'
    },
    types: {
      images: ['image/jpeg', 'image/png', 'image/gif', 'image/svg+xml'],
      documents: ['application/pdf', 'application/msword', 'text/plain'],
      invalid: ['application/x-executable', 'application/x-sharedlib']
    }
  }
};

// * Note: Component testing helpers removed during E2E migration
// * Only boundary data exports are retained for E2E input validation testing
// * For component testing helpers, see git history before 2025-10-02