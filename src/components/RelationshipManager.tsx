import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import { CrossPlatformPicker, PickerItem } from './CrossPlatformPicker';
import { WorldElement, Relationship } from '../types/models';
import { useWorldbuildingStore } from '../store/worldbuildingStore';
import { v4 as uuidv4 } from 'uuid';
import { getCategoryIcon } from '../utils/categoryMapping';

interface RelationshipManagerProps {
  element: WorldElement;
  projectId: string;
  visible: boolean;
  onClose: () => void;
}

const RELATIONSHIP_TYPES = [
  // * Character relationships
  { value: 'parent_of', label: 'Parent of', reverse: 'child_of' },
  { value: 'child_of', label: 'Child of', reverse: 'parent_of' },
  { value: 'sibling_of', label: 'Sibling of', reverse: 'sibling_of' },
  { value: 'spouse_of', label: 'Spouse of', reverse: 'spouse_of' },
  { value: 'friend_of', label: 'Friend of', reverse: 'friend_of' },
  { value: 'enemy_of', label: 'Enemy of', reverse: 'enemy_of' },
  { value: 'mentor_of', label: 'Mentor of', reverse: 'student_of' },
  { value: 'student_of', label: 'Student of', reverse: 'mentor_of' },
  { value: 'ally_of', label: 'Ally of', reverse: 'ally_of' },
  { value: 'rival_of', label: 'Rival of', reverse: 'rival_of' },
  
  // * Location relationships
  { value: 'located_in', label: 'Located in', reverse: 'contains' },
  { value: 'contains', label: 'Contains', reverse: 'located_in' },
  { value: 'near', label: 'Near', reverse: 'near' },
  { value: 'connected_to', label: 'Connected to', reverse: 'connected_to' },
  
  // * Ownership relationships
  { value: 'owns', label: 'Owns', reverse: 'owned_by' },
  { value: 'owned_by', label: 'Owned by', reverse: 'owns' },
  { value: 'created_by', label: 'Created by', reverse: 'creator_of' },
  { value: 'creator_of', label: 'Creator of', reverse: 'created_by' },
  
  // * Organization relationships
  { value: 'member_of', label: 'Member of', reverse: 'has_member' },
  { value: 'has_member', label: 'Has member', reverse: 'member_of' },
  { value: 'leads', label: 'Leads', reverse: 'led_by' },
  { value: 'led_by', label: 'Led by', reverse: 'leads' },
  { value: 'works_for', label: 'Works for', reverse: 'employs' },
  { value: 'employs', label: 'Employs', reverse: 'works_for' },
  
  // * Generic relationships
  { value: 'related_to', label: 'Related to', reverse: 'related_to' },
  { value: 'associated_with', label: 'Associated with', reverse: 'associated_with' },
  { value: 'influences', label: 'Influences', reverse: 'influenced_by' },
  { value: 'influenced_by', label: 'Influenced by', reverse: 'influences' },
];

export function RelationshipManager({
  element,
  projectId,
  visible,
  onClose,
}: RelationshipManagerProps) {
  const { projects, createRelationship, deleteRelationship } = useWorldbuildingStore();
  const [selectedElementId, setSelectedElementId] = useState<string>('');
  const [relationshipType, setRelationshipType] = useState<string>('related_to');
  const [customDescription, setCustomDescription] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [createBidirectional, _setCreateBidirectional] = useState(true);

  const project = projects.find((p) => p.id === projectId);
  const allElements = useMemo(() => project?.elements || [], [project?.elements]);
  
  // * Get existing relationships for this element
  const elementRelationships = useMemo(() => {
    if (!project) return [];
    return project.relationships?.filter(
      (r) => r.fromId === element.id || r.toId === element.id
    ) || [];
  }, [project, element.id]);

  // * Filter available elements (exclude self and search)
  const availableElements = useMemo(() => {
    return allElements
      .filter((e) => e.id !== element.id)
      .filter((e) => {
        if (!searchQuery) return true;
        const query = searchQuery.toLowerCase();
        return (
          e.name.toLowerCase().includes(query) ||
          e.category.toLowerCase().includes(query) ||
          e.description?.toLowerCase().includes(query)
        );
      });
  }, [allElements, element.id, searchQuery]);

  // * Convert elements to picker items
  const elementPickerItems: PickerItem[] = useMemo(() => 
    availableElements.map((elem) => ({
      label: `${getCategoryIcon(elem.category)} ${elem.name} (${elem.category})`,
      value: elem.id,
    })), [availableElements]
  );

  // * Convert relationship types to picker items
  const relationshipTypeItems: PickerItem[] = useMemo(() => 
    RELATIONSHIP_TYPES.map((type) => ({
      label: type.label,
      value: type.value,
    })), []
  );

  const handleCreateRelationship = () => {
    if (!selectedElementId) {
      Alert.alert('Error', 'Please select an element to create a relationship with');
      return;
    }

    const targetElement = allElements.find((e) => e.id === selectedElementId);
    if (!targetElement) return;

    // * Create the primary relationship
    const newRelationship: Relationship = {
      id: uuidv4(),
      fromId: element.id,
      toId: selectedElementId,
      type: relationshipType,
      description: customDescription || undefined,
      metadata: {
        fromName: element.name,
        toName: targetElement.name,
        fromCategory: element.category,
        toCategory: targetElement.category,
      },
    };

    createRelationship(projectId, newRelationship);

    // * Create bidirectional relationship if requested
    if (createBidirectional) {
      const relationshipDef = RELATIONSHIP_TYPES.find((r) => r.value === relationshipType);
      if (relationshipDef && relationshipDef.reverse !== relationshipType) {
        const reverseRelationship: Relationship = {
          id: uuidv4(),
          fromId: selectedElementId,
          toId: element.id,
          type: relationshipDef.reverse,
          description: customDescription ? `Reverse: ${customDescription}` : undefined,
          metadata: {
            fromName: targetElement.name,
            toName: element.name,
            fromCategory: targetElement.category,
            toCategory: element.category,
          },
        };
        createRelationship(projectId, reverseRelationship);
      }
    }

    // * Reset form
    setSelectedElementId('');
    setCustomDescription('');
    Alert.alert('Success', 'Relationship created successfully');
  };

  const handleDeleteRelationship = (relationshipId: string) => {
    Alert.alert(
      'Delete Relationship',
      'Are you sure you want to delete this relationship?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            deleteRelationship(projectId, relationshipId);
          },
        },
      ]
    );
  };

  const renderRelationship = (relationship: Relationship) => {
    const isOutgoing = relationship.fromId === element.id;
    const otherElementId = isOutgoing ? relationship.toId : relationship.fromId;
    const otherElement = allElements.find((e) => e.id === otherElementId);
    
    if (!otherElement) return null;

    return (
      <View key={relationship.id} style={styles.relationshipCard}>
        <View style={styles.relationshipContent}>
          <View style={styles.relationshipIcon}>
            <Text style={styles.relationshipIconText}>
              {getCategoryIcon(otherElement.category)}
            </Text>
          </View>
          
          <View style={styles.relationshipInfo}>
            <Text style={styles.relationshipName}>
              {otherElement.name}
            </Text>
            <Text style={styles.relationshipType}>
              {isOutgoing ? relationship.type.replace(/_/g, ' ') : `← ${relationship.type.replace(/_/g, ' ')}`} </Text>
            {relationship.description && (
              <Text style={styles.relationshipDescription}>
                {relationship.description}
              </Text>
            )}
          </View>

          <Pressable
            style={styles.deleteButton}
            onPress={() => handleDeleteRelationship(relationship.id)}
          >
            <Text style={styles.deleteIcon}>🗑️</Text>
          </Pressable>
        </View>
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <Text style={styles.title}>Manage Relationships</Text>
            <Pressable onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeIcon}>✕</Text>
            </Pressable>
          </View>

          <Text style={styles.elementName}>
            {getCategoryIcon(element.category)} {element.name}
          </Text>

          <ScrollView
            style={styles.content}
            showsVerticalScrollIndicator={false}
          >
            {/* Create New Relationship Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Create New Relationship</Text>

              <View style={styles.field}>
                <Text style={styles.label}>Search Elements</Text>
                <TextInput
                  style={styles.input}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  placeholder="Search by name, category, or description..." placeholderTextColor="#6B7280"
                />
              </View>

              <View style={styles.field}>
                <Text style={styles.label}>Select Element</Text>
                <View style={styles.pickerContainer}>
                  <CrossPlatformPicker
                    selectedValue={selectedElementId}
                    onValueChange={setSelectedElementId}
                    items={elementPickerItems}
                    style={styles.picker}
                    dropdownIconColor="
      #9CA3AF"
                    placeholder="Choose an element..."
                    mode="dropdown"
                  />
                </View>
              </View>

              <View style={styles.field}>
                <Text style={styles.label}>Relationship Type</Text>
                <View style={styles.pickerContainer}>
                  <CrossPlatformPicker
                    selectedValue={relationshipType}
                    onValueChange={setRelationshipType}
                    items={relationshipTypeItems}
                    style={styles.picker}
                    dropdownIconColor="
      #9CA3AF"
                    mode="dropdown"
                  />
                </View>
              </View>

              <View style={styles.field}>
                <Text style={styles.label}>Description (Optional)</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={customDescription}
                  onChangeText={setCustomDescription}
                  placeholder="Add context or details about this relationship..."
                  // ! HARDCODED: Should use design tokens
          placeholderTextColor="#6B7280"
                  multiline
                  numberOfLines={3}
                />
              </View>

              <Pressable
                style={[
                  styles.createButton,
                  !selectedElementId && styles.createButtonDisabled,
                ]}
                onPress={handleCreateRelationship}
                disabled={!selectedElementId}
              >
                <Text style={styles.createButtonText}>
                  Create Relationship
                </Text>
              </Pressable>
            </View>

            {/* Existing Relationships Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                Existing Relationships ({elementRelationships.length})
              </Text>

              {elementRelationships.length === 0 ? (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyIcon}>🔗</Text>
                  <Text style={styles.emptyTitle}>No Relationships</Text>
                  <Text style={styles.emptyText}>
                    This element has no relationships yet.
                    Create one above to connect it with other elements.
                  </Text>
                </View>
              ) : (
                <View style={styles.relationshipsList}>
                  {elementRelationships.map(renderRelationship)}
                </View>
              )}
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: ' // ! HARDCODED: Should use design tokens // ! HARDCODED: Should use design tokensrgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: { backgroundColor: '#111827', // ! HARDCODED: Should use design tokens
    borderRadius: 16,
    width: '90%',
    maxWidth: 600,
    maxHeight: '85%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700', color: '#F9FAFB', // ! HARDCODED: Should use design tokens
  },
  closeButton: {
    padding: 8,
  },
  closeIcon: {
    fontSize: 24, color: '#6B7280', // ! HARDCODED: Should use design tokens
  },
  elementName: {
    fontSize: 16,
    fontWeight: '600', color: '#9CA3AF', // ! HARDCODED: Should use design tokens
    paddingHorizontal: 24,
    paddingBottom: 16,
    borderBottomWidth: 1, borderBottomColor: '#374151', // ! HARDCODED: Should use design tokens
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  section: {
    paddingVertical: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600', color: '#F9FAFB', // ! HARDCODED: Should use design tokens
    marginBottom: 16,
  },
  field: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500', color: '#D1D5DB', // ! HARDCODED: Should use design tokens
    marginBottom: 8,
  },
  input: { backgroundColor: '#1F2937', // ! HARDCODED: Should use design tokens
    borderRadius: 8,
    padding: 12, color: '#F9FAFB', // ! HARDCODED: Should use design tokens
    fontSize: 14,
    borderWidth: 1, borderColor: '#374151', // ! HARDCODED: Should use design tokens
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  pickerContainer: { backgroundColor: '#1F2937', // ! HARDCODED: Should use design tokens
    borderRadius: 8,
    borderWidth: 1, borderColor: '#374151', // ! HARDCODED: Should use design tokens
    overflow: 'hidden',
  },
  picker: { color: '#F9FAFB', // ! HARDCODED: Should use design tokens
    height: 50,
  },
  createButton: { backgroundColor: '#6366F1', // ! HARDCODED: Should use design tokens
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  createButtonDisabled: { backgroundColor: '#4B5563', // ! HARDCODED: Should use design tokens
    opacity: 0.5,
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: '600', color: '#FFFFFF', // ! HARDCODED: Should use design tokens
  },
  relationshipsList: {
    gap: 12,
  },
  relationshipCard: { backgroundColor: '#1F2937', // ! HARDCODED: Should use design tokens
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1, borderColor: '#374151', // ! HARDCODED: Should use design tokens
  },
  relationshipContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  relationshipIcon: {
    width: 40,
    height: 40,
    borderRadius: 8, backgroundColor: '#374151', // ! HARDCODED: Should use design tokens
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  relationshipIconText: {
    fontSize: 20,
  },
  relationshipInfo: {
    flex: 1,
  },
  relationshipName: {
    fontSize: 16,
    fontWeight: '600', color: '#F9FAFB', // ! HARDCODED: Should use design tokens
    marginBottom: 2,
  },
  relationshipType: {
    fontSize: 13, color: '#6366F1', // ! HARDCODED: Should use design tokens
    marginBottom: 4,
    textTransform: 'capitalize',
  },
  relationshipDescription: {
    fontSize: 12, color: '#9CA3AF', // ! HARDCODED: Should use design tokens
    fontStyle: 'italic',
  },
  deleteButton: {
    padding: 8,
  },
  deleteIcon: {
    fontSize: 20,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600', color: '#F9FAFB', // ! HARDCODED: Should use design tokens
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14, color: '#6B7280', // ! HARDCODED: Should use design tokens
    textAlign: 'center',
    lineHeight: 20,
  },
});