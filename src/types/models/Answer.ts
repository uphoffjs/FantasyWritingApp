export interface Answer {
  value: string | string[] | number | boolean | Date | null;
  updatedAt: Date;
  history?: AnswerHistory[];
}

export interface AnswerHistory {
  value: string | string[] | number | boolean | Date | null;
  changedAt: Date;
  changedBy?: string;
}

export interface AnswerUpdate {
  questionId: string;
  value: string | string[] | number | boolean | Date | null;
}

export interface BulkAnswerUpdate {
  elementId: string;
  answers: AnswerUpdate[];
}

// Type guards
export function isTextAnswer(value: unknown): value is string {
  return typeof value === 'string';
}

export function isNumberAnswer(value: unknown): value is number {
  return typeof value === 'number';
}

export function isBooleanAnswer(value: unknown): value is boolean {
  return typeof value === 'boolean';
}

export function isDateAnswer(value: unknown): value is Date {
  return value instanceof Date;
}

export function isMultiSelectAnswer(value: unknown): value is string[] {
  return Array.isArray(value) && value.every(v => typeof v === 'string');
}