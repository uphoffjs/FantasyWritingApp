/**
 * CRDT (Conflict-free Replicated Data Type) definitions for collaborative editing
 */

/**
 * Hybrid Logical Clock for distributed timestamp ordering
 */
export interface HLC {
  timestamp: number;
  counter: number;
  nodeId: string;
}

/**
 * Base CRDT operation that all operations extend
 */
export interface CRDTOperation {
  id: string;
  timestamp: HLC;
  type: string;
  targetId: string;
  peerId: string;
}

/**
 * Last-Write-Wins Register for scalar values
 */
export interface LWWRegister<T> {
  value: T;
  timestamp: HLC;
  
  merge(other: LWWRegister<T>): LWWRegister<T>;
  get(): T;
  set(value: T, timestamp: HLC): void;
}

/**
 * Observed-Remove Set for collections without duplicates
 */
export interface ORSet<T> {
  adds: Map<T, Set<string>>; // value -> set of unique tags
  removes: Map<T, Set<string>>; // value -> set of removed tags
  
  add(value: T, tag: string): void;
  remove(value: T): void;
  merge(other: ORSet<T>): ORSet<T>;
  values(): Set<T>;
  has(value: T): boolean;
}

/**
 * Replicated Growing Array for ordered lists
 */
export interface RGA<T> {
  elements: Map<string, RGANode<T>>;
  tombstones: Set<string>;
  
  insert(index: number, value: T, id: string): void;
  remove(index: number): void;
  merge(other: RGA<T>): RGA<T>;
  toArray(): T[];
}

export interface RGANode<T> {
  id: string;
  value: T;
  timestamp: HLC;
  deleted: boolean;
  prev: string | null;
  next: string | null;
}

/**
 * CRDT Counter for numeric values
 */
export interface Counter {
  increments: Map<string, number>; // nodeId -> increment count
  decrements: Map<string, number>; // nodeId -> decrement count
  
  increment(nodeId: string, amount: number): void;
  decrement(nodeId: string, amount: number): void;
  value(): number;
  merge(other: Counter): Counter;
}

/**
 * LWW Map for key-value collections
 */
export interface LWWMap<K, V> {
  registers: Map<K, LWWRegister<V | null>>;
  
  set(key: K, value: V, timestamp: HLC): void;
  delete(key: K, timestamp: HLC): void;
  get(key: K): V | undefined;
  merge(other: LWWMap<K, V>): LWWMap<K, V>;
  entries(): Map<K, V>;
}

/**
 * Rich Text CRDT for collaborative text editing
 */
export interface RichTextCRDT {
  characters: RGA<CharacterNode>;
  formatting: Map<string, ORSet<FormatRange>>;
  
  insert(index: number, text: string, formats?: Format[]): void;
  delete(index: number, length: number): void;
  format(start: number, end: number, format: Format): void;
  merge(other: RichTextCRDT): RichTextCRDT;
  toString(): string;
  toHTML(): string;
}

export interface CharacterNode {
  char: string;
  id: string;
  formats: Set<string>;
}

export interface FormatRange {
  start: string; // character ID
  end: string;   // character ID
  format: Format;
}

export interface Format {
  type: 'bold' | 'italic' | 'underline' | 'link' | 'color';
  value?: string;
}

/**
 * Peer information for collaboration
 */
export interface PeerInfo {
  id: string;
  name: string;
  color: string;
  cursor?: CursorPosition;
  selection?: Selection;
  lastSeen: number;
  status: 'active' | 'idle' | 'offline';
}

export interface CursorPosition {
  elementId: string;
  field: string;
  offset: number;
}

export interface Selection {
  elementId: string;
  field: string;
  start: number;
  end: number;
}

/**
 * Operation types for CRDT synchronization
 */
export enum CRDTOperationType {
  // LWW Register operations
  SET_VALUE = 'SET_VALUE',
  
  // OR-Set operations
  ADD_ELEMENT = 'ADD_ELEMENT',
  REMOVE_ELEMENT = 'REMOVE_ELEMENT',
  
  // RGA operations
  INSERT_AT = 'INSERT_AT',
  DELETE_AT = 'DELETE_AT',
  
  // * Counter operations
  INCREMENT = 'INCREMENT',
  DECREMENT = 'DECREMENT',
  
  // * Map operations
  SET_ENTRY = 'SET_ENTRY',
  DELETE_ENTRY = 'DELETE_ENTRY',
  
  // * Rich text operations
  INSERT_TEXT = 'INSERT_TEXT',
  DELETE_TEXT = 'DELETE_TEXT',
  FORMAT_TEXT = 'FORMAT_TEXT'
}

/**
 * Specific operation interfaces
 */
export interface SetValueOperation<T = unknown> extends CRDTOperation {
  type: CRDTOperationType.SET_VALUE;
  path: string[];
  value: T;
}

export interface AddElementOperation<T = unknown> extends CRDTOperation {
  type: CRDTOperationType.ADD_ELEMENT;
  collectionPath: string[];
  element: T;
  tag: string;
}

export interface RemoveElementOperation<T = unknown> extends CRDTOperation {
  type: CRDTOperationType.REMOVE_ELEMENT;
  collectionPath: string[];
  element: T;
}

export interface InsertAtOperation<T = unknown> extends CRDTOperation {
  type: CRDTOperationType.INSERT_AT;
  arrayPath: string[];
  index: number;
  value: T;
  id: string;
}

export interface DeleteAtOperation extends CRDTOperation {
  type: CRDTOperationType.DELETE_AT;
  arrayPath: string[];
  index: number;
}

export interface SetEntryOperation<T = unknown> extends CRDTOperation {
  type: CRDTOperationType.SET_ENTRY;
  path: string[];
  value: T;
}

export interface IncrementOperation extends CRDTOperation {
  type: CRDTOperationType.INCREMENT;
  path: string[];
  amount?: number;
}

export type SpecificCRDTOperation = 
  | SetValueOperation
  | AddElementOperation
  | RemoveElementOperation
  | InsertAtOperation
  | DeleteAtOperation
  | SetEntryOperation
  | IncrementOperation;