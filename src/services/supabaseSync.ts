import { supabase } from '../lib/supabase';
import { optimisticSyncQueueManager } from './optimisticSyncQueue';
import { Project, WorldElement, Relationship, QuestionnaireTemplate as _QuestionnaireTemplate } from '../types';
import { mapCategoryToDb as _mapCategoryToDb, ensureCategoryForDb } from '../utils/categoryMapping';

export class SupabaseSyncService {
  // * Sync all projects for the current user
  async syncProjects(localProjects: Project[], userId: string): Promise<void> {
    try {
      // * Fetch remote projects
      const { data: remoteProjects, error } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', userId);
      
      if (error) throw error;
      
      // * Create a map of remote projects by client_id
      const remoteMap = new Map(
        (remoteProjects || []).map(p => [p.client_id, p])
      );
      
      // * Sync each local project
      for (const localProject of localProjects) {
        const remoteProject = remoteMap.get(localProject.id);
        
        if (!remoteProject) {
          // * Project doesn't exist remotely, create it
          await optimisticSyncQueueManager.addOperation({
            type: 'create',
            entity: 'project',
            entityId: localProject.id,
            projectId: localProject.id,
            data: {
              name: localProject.name,
              description: localProject.description,
              // ! CRITICAL: Include user_id for RLS policy compliance
              user_id: userId,
            }
          });
        } else if (this.hasProjectChanged(localProject, remoteProject)) {
          // * Project exists but has changed, update it
          await optimisticSyncQueueManager.addOperation({
            type: 'update',
            entity: 'project',
            entityId: localProject.id,
            projectId: localProject.id,
            data: {
              name: localProject.name,
              description: localProject.description,
              updated_at: new Date().toISOString()
            }
          });
        }
        
        // * Sync elements for this project
        await this.syncElements(localProject.elements, localProject.id);
        
        // * Sync relationships
        await this.syncRelationships(localProject.relationships || [], localProject.id);
      }
      
      // * Process the queue
      await optimisticSyncQueueManager.processQueue();
    } catch (error) {
      console.error('Error syncing projects:', error);
      throw error;
    }
  }
  
  // * Sync elements for a project
  private async syncElements(localElements: WorldElement[], projectId: string): Promise<void> {
    try {
      // * Fetch remote elements
      const { data: remoteElements, error } = await supabase
        .from('world_elements')
        .select('*')
        .eq('project_id', projectId);
      
      if (error) throw error;
      
      // * Create a map of remote elements by client_id
      const remoteMap = new Map(
        (remoteElements || []).map(e => [e.client_id, e])
      );
      
      // * Sync each local element
      for (const localElement of localElements) {
        const remoteElement = remoteMap.get(localElement.id);
        
        if (!remoteElement) {
          // * Element doesn't exist remotely, create it
          await optimisticSyncQueueManager.addOperation({
            type: 'create',
            entity: 'element',
            entityId: localElement.id,
            projectId: projectId,
            data: {
              name: localElement.name,
              category: ensureCategoryForDb(localElement.category),
              template_id: localElement.templateId,
              answers: localElement.answers || {}
            }
          });
        } else if (this.hasElementChanged(localElement, remoteElement)) {
          // * Element exists but has changed, update it
          await optimisticSyncQueueManager.addOperation({
            type: 'update',
            entity: 'element',
            entityId: localElement.id,
            projectId: projectId,
            data: {
              name: localElement.name,
              category: ensureCategoryForDb(localElement.category),
              template_id: localElement.templateId,
              answers: localElement.answers || {},
              updated_at: new Date().toISOString()
            }
          });
        }
      }
    } catch (error) {
      console.error('Error syncing elements:', error);
      throw error;
    }
  }
  
  // * Sync relationships for a project
  private async syncRelationships(localRelationships: Relationship[], projectId: string): Promise<void> {
    try {
      // * Fetch remote relationships
      const { data: remoteRelationships, error } = await supabase
        .from('relationships')
        .select('*')
        .eq('project_id', projectId);
      
      if (error) throw error;
      
      // * Create a map of remote relationships by client_id
      const remoteMap = new Map(
        (remoteRelationships || []).map(r => [r.client_id, r])
      );
      
      // * Sync each local relationship
      for (const localRelationship of localRelationships) {
        const remoteRelationship = remoteMap.get(localRelationship.id);
        
        if (!remoteRelationship) {
          // * Relationship doesn't exist remotely, create it
          await optimisticSyncQueueManager.addOperation({
            type: 'create',
            entity: 'relationship',
            entityId: localRelationship.id,
            projectId: projectId,
            data: {
              source_id: localRelationship.sourceId,
              target_id: localRelationship.targetId,
              relationship_type: localRelationship.type,
              description: localRelationship.description,
              metadata: localRelationship.metadata || {}
            }
          });
        } else if (this.hasRelationshipChanged(localRelationship, remoteRelationship)) {
          // * Relationship exists but has changed, update it
          await optimisticSyncQueueManager.addOperation({
            type: 'update',
            entity: 'relationship',
            entityId: localRelationship.id,
            projectId: projectId,
            data: {
              source_id: localRelationship.sourceId,
              target_id: localRelationship.targetId,
              relationship_type: localRelationship.type,
              description: localRelationship.description,
              metadata: localRelationship.metadata || {},
              updated_at: new Date().toISOString()
            }
          });
        }
      }
    } catch (error) {
      console.error('Error syncing relationships:', error);
      throw error;
    }
  }
  
  // * Fetch projects from Supabase
  async fetchProjects(userId: string): Promise<Project[]> {
    try {
      const { data: remoteProjects, error } = await supabase
        .from('projects')
        .select(`
          *,
          world_elements (*),
          relationships (*)
        `)
        .eq('user_id', userId);
      
      if (error) throw error;
      
      // * Transform remote data to local format
      // ! Handle projects with missing client_id by using server id as fallback
      return (remoteProjects || [])
        .filter(p => {
          // ! CRITICAL: Filter out projects with invalid names to prevent sync errors
          if (!p.name || typeof p.name !== 'string' || !p.name.trim()) {
            console.error('[supabaseSync] Skipping project with invalid name:', {
              id: p.id,
              client_id: p.client_id,
              name: p.name,
              description: p.description
            });
            return false;
          }
          return true;
        })
        .map(p => {
          // * Use client_id if available, otherwise fallback to server id
          const projectId = p.client_id || p.id;
          if (!p.client_id && p.id) {
            console.warn('[supabaseSync] Project missing client_id, using server id as fallback:', p);
          }
          
          return {
            id: projectId,
            name: p.name.trim(), // * Ensure name is trimmed
            description: p.description || '',
            elements: (p.world_elements || []).map((e: any) => ({
              id: e.client_id || e.id,  // * Fallback to server id if client_id missing
              name: e.name,
              category: e.category,
              templateId: e.template_id,
              answers: e.answers || {},
              relationships: []
            })),
            relationships: (p.relationships || []).map((r: any) => ({
              id: r.client_id || r.id,  // * Fallback to server id if client_id missing
              sourceId: r.source_id,
              targetId: r.target_id,
              type: r.relationship_type,
              description: r.description,
              metadata: r.metadata || {}
            })),
            createdAt: new Date(p.created_at),
            updatedAt: new Date(p.updated_at)
          };
        });
    } catch (error) {
      console.error('Error fetching projects:', error);
      throw error;
    }
  }
  
  // * Check if a project has changed
  private hasProjectChanged(local: Project, remote: any): boolean {
    return local.name !== remote.name || 
           local.description !== (remote.description || '');
  }
  
  // * Check if an element has changed
  private hasElementChanged(local: WorldElement, remote: any): boolean {
    return local.name !== remote.name || 
           local.category !== remote.category ||
           local.templateId !== remote.template_id ||
           JSON.stringify(local.answers) !== JSON.stringify(remote.answers);
  }
  
  // * Check if a relationship has changed
  private hasRelationshipChanged(local: Relationship, remote: any): boolean {
    return local.sourceId !== remote.source_id ||
           local.targetId !== remote.target_id ||
           local.type !== remote.relationship_type ||
           local.description !== remote.description ||
           JSON.stringify(local.metadata) !== JSON.stringify(remote.metadata);
  }
  
  // * Delete a project from Supabase
  async deleteProject(projectId: string): Promise<void> {
    await optimisticSyncQueueManager.addOperation({
      type: 'delete',
      entity: 'project',
      entityId: projectId,
      projectId: projectId,
      data: {},
      priority: 'high'
    });
    
    await optimisticSyncQueueManager.processQueue();
  }
  
  // * Delete an element from Supabase
  async deleteElement(elementId: string, projectId: string): Promise<void> {
    await optimisticSyncQueueManager.addOperation({
      type: 'delete',
      entity: 'element',
      entityId: elementId,
      projectId: projectId,
      data: {},
      priority: 'high'
    });
    
    await optimisticSyncQueueManager.processQueue();
  }
  
  // * Delete a relationship from Supabase
  async deleteRelationship(relationshipId: string, projectId: string): Promise<void> {
    await optimisticSyncQueueManager.addOperation({
      type: 'delete',
      entity: 'relationship',
      entityId: relationshipId,
      projectId: projectId,
      data: {},
      priority: 'high'
    });
    
    await optimisticSyncQueueManager.processQueue();
  }
}

export const supabaseSyncService = new SupabaseSyncService();
export default supabaseSyncService;