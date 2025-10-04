// * Stub component for testing - TODO: Implement actual LinkModal
import React from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet } from 'react-native';

import { getTestProps } from '../utils/react-native-web-polyfills';

interface LinkModalProps {
  visible: boolean;
  onClose: () => void;
  onSelect?: (elementId: string, elementType: string) => void;
  selectedElementId?: string;
  selectedElementType?: string;
  availableElements?: Array<{ id: string; name: string; type: string }>;
  testID?: string;
}

export const LinkModal: React.FC<LinkModalProps> = ({
  visible,
  onClose,
  onSelect,
  availableElements = [],
  testID = 'link-modal'
}) => {
  return (
    <Modal
      visible={visible}
      onRequestClose={onClose}
      animationType="slide"
      {...getTestProps(testID)}
    >
      <View style={styles.container} {...getTestProps(`${testID}-container`)}>
        <View style={styles.header}>
          <Text style={styles.title} {...getTestProps(`${testID}-title`)}>Link Element</Text>
          <TouchableOpacity onPress={onClose} {...getTestProps(`${testID}-close`)}>
            <Text style={styles.closeButton}>✕</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.content} {...getTestProps(`${testID}-content`)}>
          {availableElements.map((element) => (
            <TouchableOpacity
              key={element.id}
              style={styles.elementItem}
              onPress={() => onSelect?.(element.id, element.type)}
              {...getTestProps(`${testID}-element-${element.id}`)}
            >
              <Text>{element.name}</Text>
              <Text style={styles.elementType}>{element.type}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  closeButton: {
    fontSize: 24,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  elementItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  elementType: {
    fontSize: 12,
    marginTop: 4,
  },
});

export default LinkModal;
