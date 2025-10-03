/**
 * Settings Screen
 * App settings and preferences
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Platform, TouchableOpacity, Switch, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Button } from '../components/Button';
import { ImportExport } from '../components/ImportExport';
import { ImportExportWeb } from '../components/ImportExportWeb';
import { useWorldbuildingStore } from '../store/worldbuildingStore';
import { useAuthStore } from '../store/authStore';
import Icon from 'react-native-vector-icons/MaterialIcons';

export function SettingsScreen() {
  const navigation = useNavigation();
  const { projects, clearAllData } = useWorldbuildingStore();
  const { isAuthenticated, user, logout } = useAuthStore();
  const [preferences, setPreferences] = useState({
    darkMode: true,
    autoSave: true,
    notifications: true,
    analytics: false,
  });

  const handleClearAllData = () => {
    Alert.alert(
      'Clear All Data',
      'Are you sure you want to delete all your projects and data? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete All',
          style: 'destructive',
          onPress: async () => {
            await clearAllData();
            Alert.alert('Success', 'All data has been cleared.');
          },
        },
      ]
    );
  };

  const handleLogout = async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out? Your data will remain saved.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          onPress: async () => {
            await logout();
          },
        },
      ]
    );
  };

  const ImportExportComponent = Platform.OS === 'web' ? ImportExportWeb : ImportExport;

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
        </TouchableOpacity>
        <Text style={styles.title}>Settings</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Account Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>
        <View style={styles.accountCard}>
          <View style={styles.accountInfo}>
            <Icon 
              name={isAuthenticated ? "account-circle" : "person-outline"} 
              size={48} 
            />
            <View style={styles.accountDetails}>
              <Text style={styles.accountName}>
                {isAuthenticated && user ? user.email : 'Not Signed In'}
              </Text>
              <Text style={styles.accountStatus}>
                {isAuthenticated ? 'Signed in' : 'Not signed in'}
              </Text>
            </View>
          </View>
          <Button
            title={isAuthenticated ? "Sign Out" : "Go to Login"}
            variant="secondary"
            size="small"
            onPress={isAuthenticated ? handleLogout : () => navigation.navigate('Login')}
          />
        </View>
      </View>

      {/* App Preferences */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Preferences</Text>
        
        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Auto-save</Text>
            <Text style={styles.settingDescription}>
              Automatically save changes as you work
            </Text>
          </View>
          <Switch
            value={preferences.autoSave}
            onValueChange={(value) => setPreferences(prev => ({ ...prev, autoSave: value }))}
            thumbColor={preferences.autoSave ? '#FFFFFF' : '#9CA3AF'}
          />
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Notifications</Text>
            <Text style={styles.settingDescription}>
              Receive notifications about updates and tips
            </Text>
          </View>
          <Switch
            value={preferences.notifications}
            onValueChange={(value) => setPreferences(prev => ({ ...prev, notifications: value }))}
            thumbColor={preferences.notifications ? '#FFFFFF' : '#9CA3AF'}
          />
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Anonymous Analytics</Text>
            <Text style={styles.settingDescription}>
              Help improve the app by sharing anonymous usage data
            </Text>
          </View>
          <Switch
            value={preferences.analytics}
            onValueChange={(value) => setPreferences(prev => ({ ...prev, analytics: value }))}
            thumbColor={preferences.analytics ? '#FFFFFF' : '#9CA3AF'}
          />
        </View>
      </View>

      {/* Data Management */}
      <View style={styles.section}>
        <ImportExportComponent />
      </View>

      {/* Project Stats */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Your Data</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{projects.length}</Text>
            <Text style={styles.statLabel}>Projects</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>
              {projects.reduce((sum, p) => sum + (p.elements?.length || 0), 0)}
            </Text>
            <Text style={styles.statLabel}>Elements</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>
              {projects.filter(p => p.elements && p.elements.some(e => e.completionPercentage === 100)).length}
            </Text>
            <Text style={styles.statLabel}>Complete</Text>
          </View>
        </View>
      </View>

      {/* Danger Zone */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Danger Zone</Text>
        <View style={styles.dangerCard}>
          <View style={styles.dangerInfo}>
            <Text style={styles.dangerTitle}>Clear All Data</Text>
            <Text style={styles.dangerDescription}>
              Permanently delete all projects, elements, and data. This cannot be undone.
            </Text>
          </View>
          <Button
            title="Clear All"
            variant="secondary"
            size="small"
            onPress={handleClearAllData}
            style={styles.dangerButton}
          />
        </View>
      </View>

      {/* About */}
      <View style={[styles.section, styles.lastSection]}>
        <Text style={styles.sectionTitle}>About</Text>
        <View style={styles.aboutCard}>
          <Text style={styles.appName}>Fantasy Writing App</Text>
          <Text style={styles.version}>Version 1.0.0</Text>
          <Text style={styles.description}>
            A comprehensive worldbuilding tool for fiction writers, storytellers, and game masters.
          </Text>
          <View style={styles.aboutLinks}>
            <TouchableOpacity style={styles.linkButton}>
              <Text style={styles.linkText}>Help & Support</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.linkButton}>
              <Text style={styles.linkText}>Privacy Policy</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? 44 : 24,
    paddingHorizontal: 16,
    paddingBottom: 20,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 8,
    marginRight: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    flex: 1,
  },
  placeholder: {
    width: 40,
  },
  section: {
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  lastSection: {
    marginBottom: 40,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  accountCard: {
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
  },
  accountInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  accountDetails: {
    marginLeft: 16,
    flex: 1,
  },
  accountName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  accountStatus: {
    fontSize: 14,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 13,
    lineHeight: 18,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    textAlign: 'center',
  },
  dangerCard: {
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  dangerInfo: {
    flex: 1,
    marginRight: 16,
  },
  dangerTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  dangerDescription: {
    fontSize: 13,
    lineHeight: 18,
  },
  dangerButton: {
  },
  aboutCard: {
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    alignItems: 'center',
  },
  appName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  version: {
    fontSize: 14,
    marginBottom: 12,
  },
  description: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  aboutLinks: {
    flexDirection: 'row',
    gap: 24,
  },
  linkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
  },
  linkText: {
    fontSize: 14,
    fontWeight: '500',
  },
});
