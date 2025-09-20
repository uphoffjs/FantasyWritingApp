import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useWorldbuildingStore } from '../store/worldbuildingStore';

interface ImportExportWebProps {
  projectId?: string; // If provided, export single project. Otherwise export all.
  onImportSuccess?: () => void;
  onExportSuccess?: () => void;
}

export function ImportExportWeb({
  projectId,
  onImportSuccess,
  onExportSuccess,
}: ImportExportWebProps) {
  const { projects, importData, exportData, exportProject } = useWorldbuildingStore();
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // * Handle import
  const handleImport = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
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

  // * Handle export
  const handleExport = async () => {
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
            <ActivityIndicator size="small" color="#FFFFFF" />
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
            <ActivityIndicator size="small"
          color="#FFFFFF" />
          ) : (
            <>
              <Text style={styles.buttonIcon}>📤</Text>
              <Text style={styles.buttonText}>
                {projectId ? ' // ! HARDCODED: Should use design tokensExport Project' : 'Export All'}
              </Text>
            </>
          )}
        </Pressable>
      </View>

      {/* Hidden file input for web */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        style={{ display: 'none' }}
        onChange={handleFileSelect}
      />

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
    fontWeight: '600', color: '#F9FAFB', // ! HARDCODED: Should use design tokens
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14, color: '#9CA3AF', // ! HARDCODED: Should use design tokens
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
  importButton: { backgroundColor: '#059669', // ! HARDCODED: Should use design tokens
  },
  exportButton: { backgroundColor: '#6366F1', // ! HARDCODED: Should use design tokens
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonIcon: {
    fontSize: 20,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600', color: '#FFFFFF', // ! HARDCODED: Should use design tokens
  },
  infoContainer: { backgroundColor: '#1F2937', // ! HARDCODED: Should use design tokens
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1, borderColor: '#374151', // ! HARDCODED: Should use design tokens
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '600', color: '#F9FAFB', // ! HARDCODED: Should use design tokens
    marginBottom: 8,
  },
  infoText: {
    fontSize: 13, color: '#9CA3AF', // ! HARDCODED: Should use design tokens
    lineHeight: 18,
  },
  warningContainer: { backgroundColor: '#7C2D1220', // ! HARDCODED: Should use design tokens
    borderRadius: 8,
    padding: 16,
    borderWidth: 1, borderColor: '#991B1B', // ! HARDCODED: Should use design tokens
  },
  warningTitle: {
    fontSize: 14,
    fontWeight: '600', color: '#FCA5A5', // ! HARDCODED: Should use design tokens
    marginBottom: 8,
  },
  warningText: {
    fontSize: 13, color: '#FCA5A5', // ! HARDCODED: Should use design tokens
    lineHeight: 18,
  },
});