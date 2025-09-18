import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useWorldbuildingStore } from '../store/worldbuildingStore';
// * Types imported but not used in this file directly
// Cross-platform import/export without native dependencies
// * Native modules will be conditionally imported only on native platforms

interface ImportExportProps {
  projectId?: string; // If provided, export single project. Otherwise export all.
  onImportSuccess?: () => void;
  onExportSuccess?: () => void;
}

export function ImportExport({
  projectId,
  onImportSuccess,
  onExportSuccess,
}: ImportExportProps) {
  const { projects, importData, exportData, exportProject } = useWorldbuildingStore();
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // * Web-specific file input handling
  const handleWebImport = () => {
    if (Platform.OS === 'web' && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleWebFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      
      // * Validate the data structure
      if (!data.version || !data.projects) {
        throw new Error('Invalid data format');
      }

      await importData(data);
      
      Alert.alert(
        'Import Successful',
        `Imported ${data.projects.length} project(s) successfully.`
      );
      
      onImportSuccess?.();
    } catch (error) {
      console.error('Import failed:', error);
      Alert.alert(
        'Import Failed',
        'Failed to import data. Please ensure the file is a valid Fantasy Writing App export.'
      );
    } finally {
      setIsImporting(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // * Native import handling
  const handleNativeImport = async () => {
    setIsImporting(true);
    try {
      // * Dynamic import for native modules
      const DocumentPicker = require('react-native-document-picker');
      const RNFS = require('react-native-fs');

      const result = await DocumentPicker.pick({
        type: [DocumentPicker.types.json],
      });

      if (result && result[0]) {
        const fileContent = await RNFS.readFile(result[0].uri, 'utf8');
        const data = JSON.parse(fileContent);

        // * Validate the data structure
        if (!data.version || !data.projects) {
          throw new Error('Invalid data format');
        }

        await importData(data);
        
        Alert.alert(
          'Import Successful',
          `Imported ${data.projects.length} project(s) successfully.`
        );
        
        onImportSuccess?.();
      }
    } catch (error) {
      // * Handle dynamic import errors gracefully
      if (error && typeof error === 'object' && 'code' in error) {
        // DocumentPicker.isCancel equivalent
        if (error.code !== 'DOCUMENT_PICKER_CANCELED') {
          console.error('Import failed:', error);
          Alert.alert(
            'Import Failed',
            'Failed to import data. Please ensure the file is a valid Fantasy Writing App export.'
          );
        }
      } else {
        console.error('Import failed:', error);
        Alert.alert(
          'Import Failed',
          'Failed to import data. This feature may not be available on this platform.'
        );
      }
    } finally {
      setIsImporting(false);
    }
  };

  // * Export handling for web
  const handleWebExport = async () => {
    setIsExporting(true);
    try {
      let data;
      let filename;
      
      if (projectId) {
        const project = projects.find(p => p.id === projectId);
        if (!project) {
          throw new Error('Project not found');
        }
        data = exportProject(projectId);
        filename = `${project.name.replace(/[^a-z0-9]/gi, '_')}_export.json`;
      } else {
        data = exportData();
        filename = `fantasy_writing_app_backup_${new Date().toISOString().split('T')[0]}.json`;
      }

      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      Alert.alert('Export Successful', 'Your data has been exported successfully.');
      onExportSuccess?.();
    } catch (error) {
      console.error('Export failed:', error);
      Alert.alert('Export Failed', 'Failed to export data. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  // * Export handling for native
  const handleNativeExport = async () => {
    setIsExporting(true);
    try {
      // * Dynamic import for native modules
      const RNFS = require('react-native-fs');
      const Share = require('react-native-share');

      let data;
      let filename;
      let title;
      
      if (projectId) {
        const project = projects.find(p => p.id === projectId);
        if (!project) {
          throw new Error('Project not found');
        }
        data = exportProject(projectId);
        filename = `${project.name.replace(/[^a-z0-9]/gi, '_')}_export.json`;
        title = `Export ${project.name}`;
      } else {
        data = exportData();
        filename = `fantasy_writing_app_backup_${new Date().toISOString().split('T')[0]}.json`;
        title = 'Export All Projects';
      }

      const jsonString = JSON.stringify(data, null, 2);
      const path = `${RNFS.DocumentDirectoryPath}/${filename}`;
      
      await RNFS.writeFile(path, jsonString, 'utf8');

      await Share.open({
        title,
        url: `file://${path}`,
        type: 'application/json',
        filename,
      });

      onExportSuccess?.();
    } catch (error) {
      if (error && typeof error === 'object' && 'message' in error) {
        const errorMessage = (error as Error).message;
        if (!errorMessage.includes('User did not share')) {
          console.error('Export failed:', error);
          Alert.alert('Export Failed', 'Failed to export data. Please try again.');
        }
      } else {
        console.error('Export failed:', error);
        Alert.alert('Export Failed', 'Failed to export data. This feature may not be available on this platform.');
      }
    } finally {
      setIsExporting(false);
    }
  };

  // * Determine which handlers to use based on platform
  const handleImport = Platform.OS === 'web' ? handleWebImport : handleNativeImport;
  const handleExport = Platform.OS === 'web' ? handleWebExport : handleNativeExport;

  return (
    <View style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Data Management</Text>
        <Text style={styles.sectionDescription}>
          Import or export your worldbuilding projects for backup or sharing.
        </Text>
      </View>

      <View style={styles.buttonContainer}>
        {/* Import Button */}
        <Pressable
          style={[styles.button, styles.importButton, isImporting && styles.buttonDisabled]}
          onPress={handleImport}
          disabled={isImporting}
        >
          {isImporting ? (
            <ActivityIndicator size="small" // ! HARDCODED: Should use design tokens
          color="#FFFFFF" />
          ) : (
            <>
              <Text style={styles.buttonIcon}>📥</Text>
              <Text style={styles.buttonText}>Import Data</Text>
            </>
          )}
        </Pressable>

        {/* Export Button */}
        <Pressable
          style={[styles.button, styles.exportButton, isExporting && styles.buttonDisabled]}
          onPress={handleExport}
          disabled={isExporting}
        >
          {isExporting ? (
            <ActivityIndicator size="small" // ! HARDCODED: Should use design tokens
          color="#FFFFFF" />
          ) : (
            <>
              <Text style={styles.buttonIcon}>📤</Text>
              <Text style={styles.buttonText}>
                {projectId ? 'Export Project' : 'Export All'}
              </Text>
            </>
          )}
        </Pressable>
      </View>

      {/* Hidden file input for web */}
      {Platform.OS === 'web' && (
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          style={styles.hiddenInput}
          onChange={handleWebFileSelect}
        />
      )}

      <View style={styles.infoContainer}>
        <Text style={styles.infoTitle}>ℹ️ Export Format</Text>
        <Text style={styles.infoText}>
          Exports are saved as JSON files containing all your projects, elements, 
          answers, and relationships. These files can be imported into any device 
          running Fantasy Writing App.
        </Text>
      </View>

      {projectId && (
        <View style={styles.warningContainer}>
          <Text style={styles.warningTitle}>⚠️ Single Project Export</Text>
          <Text style={styles.warningText}>
            You're exporting only the current project. To backup all your projects, 
            use "Export All" from the main settings.
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    // ! HARDCODED: Should use design tokens
    color: '#F9FAFB',
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    // ! HARDCODED: Should use design tokens
    color: '#9CA3AF',
    lineHeight: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 8,
    minHeight: 48,
  },
  importButton: {
    // ! HARDCODED: Should use design tokens
    backgroundColor: '#059669',
  },
  exportButton: {
    // ! HARDCODED: Should use design tokens
    backgroundColor: '#6366F1',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonIcon: {
    fontSize: 20,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    // ! HARDCODED: Should use design tokens
    color: '#FFFFFF',
  },
  infoContainer: {
    // ! HARDCODED: Should use design tokens
    backgroundColor: '#1F2937',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    // ! HARDCODED: Should use design tokens
    borderColor: '#374151',
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '600',
    // ! HARDCODED: Should use design tokens
    color: '#F9FAFB',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 13,
    // ! HARDCODED: Should use design tokens
    color: '#9CA3AF',
    lineHeight: 18,
  },
  warningContainer: {
    // ! HARDCODED: Should use design tokens
    backgroundColor: '#7C2D1220',
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    // ! HARDCODED: Should use design tokens
    borderColor: '#991B1B',
  },
  warningTitle: {
    fontSize: 14,
    fontWeight: '600',
    // ! HARDCODED: Should use design tokens
    color: '#FCA5A5',
    marginBottom: 8,
  },
  warningText: {
    fontSize: 13,
    // ! HARDCODED: Should use design tokens
    color: '#FCA5A5',
    lineHeight: 18,
  },
  hiddenInput: {
    display: 'none',
  },
});