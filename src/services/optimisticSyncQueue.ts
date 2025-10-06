import { supabase } from '../lib/supabase';

export type SyncOperation = {
  id: string;
  type: 'create' | 'update' | 'delete';
  entity: 'project' | 'element' | 'answer' | 'relationship';
  entityId: string;
  projectId: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Operation data can be any entity type (Project | WorldElement | Relationship)
  data: any;
  localId?: string;
  remoteId?: string;
  timestamp: number;
  retryCount: number;
  status: 'pending' | 'syncing' | 'success' | 'failed';
  error?: string;
  priority?: 'high' | 'normal' | 'low';
};

class OptimisticSyncQueue {
  private queue: SyncOperation[] = [];
  private isProcessing = false;
  private maxRetries = 3;
  private listeners: Set<(queue: SyncOperation[]) => void> = new Set();

  async addOperation(operation: Omit<SyncOperation, 'id' | 'timestamp' | 'retryCount' | 'status'>): Promise<SyncOperation> {
    const op: SyncOperation = {
      ...operation,
      id: this.generateId(),
      timestamp: Date.now(),
      retryCount: 0,
      status: 'pending',
      priority: operation.priority || 'normal'
    };
    
    this.queue.push(op);
    this.notifyListeners();
    this.processQueue();
    return op;
  }

  async processQueue(): Promise<void> {
    if (this.isProcessing || this.queue.length === 0) return;

    this.isProcessing = true;

    while (this.queue.length > 0) {
      const operation = this.queue.find(op => op.status === 'pending');
      if (!operation) break;

      operation.status = 'syncing';
      this.notifyListeners();

      try {
        await this.executeOperation(operation);
        operation.status = 'success';
        this.queue = this.queue.filter(op => op.id !== operation.id);
      } catch (error) {
        operation.status = 'failed';
        operation.error = error instanceof Error ? error.message : 'Unknown error';
        operation.retryCount++;

        if (operation.retryCount >= this.maxRetries) {
          console.error(`Operation ${operation.id} failed after ${this.maxRetries} retries`, error);
          this.queue = this.queue.filter(op => op.id !== operation.id);
        } else {
          operation.status = 'pending';
          await this.delay(Math.pow(2, operation.retryCount) * 1000);
        }
      }

      this.notifyListeners();
    }

    this.isProcessing = false;
  }

  private async executeOperation(operation: SyncOperation): Promise<void> {
    const { type, entity, data, entityId, projectId } = operation;
    
    // * Map entity to table name
    const tableMap = {
      project: 'projects',
      element: 'world_elements',
      answer: 'world_elements', // Answers are stored in elements
      relationship: 'relationships'
    };
    
    const table = tableMap[entity];

    switch (type) {
      case 'create':
        // * Build the insert data
        // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Insert data structure varies by entity type
        const insertData: any = {
          ...data,
          client_id: entityId,  // * Use client_id to match database schema
        };
        
        // * For projects, don't add project_id (it's the same as client_id)
        // * For other entities, add project_id
        if (entity !== 'project') {
          insertData.project_id = projectId;
        }
        
        // ! CRITICAL: Validate required fields before sending to Supabase
        if (entity === 'project') {
          if (!insertData.user_id) {
            console.error('❌ SYNC FAILED: user_id is required for project creation', {
              entityId,
              data,
              insertData
            });
            throw new Error('user_id is required for project creation');
          }
          if (!insertData.name && insertData.name !== '') {
            console.error('❌ SYNC FAILED: name is required for project creation', {
              entityId,
              data,
              insertData
            });
            throw new Error('name is required for project creation');
          }
        }
        
        const { data: created, error: createError } = await supabase
          .from(table)
          .insert(insertData)
          .select()
          .single();
        
        if (createError) {
          console.error(`❌ SYNC FAILED: Supabase insert error for ${entity}`, {
            error: createError,
            entityId,
            insertData,
            table
          });
          throw createError;
        }
        operation.remoteId = created?.id;
        break;

      case 'update':
        const updateQuery = supabase.from(table).update(data);

        // * Use 'client_id' for matching (client-side ID stored in database)
        if (entity === 'project') {
          // * For projects, entityId is the client-side ID, match against client_id
          updateQuery.eq('client_id', entityId);
        } else {
          // * For other entities, use client_id + project_id constraint
          updateQuery.eq('client_id', entityId).eq('project_id', projectId);
        }
        
        const { error: updateError } = await updateQuery;
        if (updateError) throw updateError;
        break;

      case 'delete':
        // ! Validate entityId before attempting delete
        if (!entityId) {
          throw new Error(`Cannot delete ${entity}: ID is undefined`);
        }

        const deleteQuery = supabase.from(table).delete();

        // * Use 'client_id' for matching (client-side ID stored in database)
        if (entity === 'project') {
          // * For projects, entityId is the client-side ID, match against client_id
          deleteQuery.eq('client_id', entityId);
        } else {
          // * For other entities (elements, relationships), use client_id + project_id
          deleteQuery.eq('client_id', entityId).eq('project_id', projectId);
        }
        
        const { error: deleteError } = await deleteQuery;
        if (deleteError) throw deleteError;
        break;
    }
  }

  subscribe(listener: (queue: SyncOperation[]) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener([...this.queue]));
  }

  getQueue(): SyncOperation[] {
    return [...this.queue];
  }

  clearQueue(): void {
    this.queue = [];
    this.notifyListeners();
  }

  retryFailed(): void {
    this.queue.forEach(op => {
      if (op.status === 'failed') {
        op.status = 'pending';
        op.retryCount = 0;
      }
    });
    this.notifyListeners();
    this.processQueue();
  }

  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// * Create the queue manager with additional methods for the middleware
class OptimisticSyncQueueManager extends OptimisticSyncQueue {
  linkToSyncOperation(_optimisticUpdateId: string, _syncOperationId: string): void {
    // * Link optimistic update to sync operation for rollback purposes
    // * This could be implemented with a Map if needed
  }
  
  // * Get operation by ID
  getOperation(operationId: string): SyncOperation | undefined {
    return this.getQueue().find(op => op.id === operationId);
  }
  
  // * Cancel an operation
  cancelOperation(operationId: string): void {
    const queue = this.getQueue();
    const index = queue.findIndex(op => op.id === operationId);
    if (index !== -1) {
      queue.splice(index, 1);
      this.clearQueue();
      queue.forEach(op => this.addOperation(op));
    }
  }
  
  // * Get operations by status
  getOperationsByStatus(status: SyncOperation['status']): SyncOperation[] {
    return this.getQueue().filter(op => op.status === status);
  }
  
  // * Get operations by entity and project
  getOperationsByEntity(entity: SyncOperation['entity'], projectId?: string): SyncOperation[] {
    return this.getQueue().filter(op => {
      if (projectId) {
        return op.entity === entity && op.projectId === projectId;
      }
      return op.entity === entity;
    });
  }
}

export const optimisticSyncQueue = new OptimisticSyncQueueManager();
export const optimisticSyncQueueManager = optimisticSyncQueue;
export default optimisticSyncQueue;