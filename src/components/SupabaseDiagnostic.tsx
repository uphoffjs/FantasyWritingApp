/* eslint-disable @typescript-eslint/no-explicit-any */
// * Supabase diagnostic tool requires 'any' for flexible database query results and API responses
// * Diagnostic results contain dynamic Supabase metadata that varies by test type

import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';

export const SupabaseDiagnostic: React.FC = () => {
  const [diagnosticResults, setDiagnosticResults] = useState<any>({});
  const [isRunning, setIsRunning] = useState(false);
  const [showRawData, setShowRawData] = useState(false);
  const { user } = useAuthStore();

  const runDiagnostics = async () => {
    setIsRunning(true);
    const results: any = {};

    try {
      // * Test 1: Check current auth session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      results.authSession = {
        success: !!session,
        userId: session?.user?.id,
        email: session?.user?.email,
        error: sessionError?.message
      };

      // * Test 2: Check auth.uid() function
      const { data: authUidData, error: authUidError } = await supabase
        .rpc('auth.uid');
      results.authUid = {
        success: !authUidError,
        value: authUidData,
        error: authUidError?.message
      };

      // * Test 3: Test direct SQL query to check RLS
      const { data: rlsTestData, error: rlsTestError } = await supabase
        .from('projects')
        .select('id, user_id, name')
        .limit(1);
      results.rlsTest = {
        success: !rlsTestError,
        data: rlsTestData,
        error: rlsTestError?.message,
        errorCode: (rlsTestError as any)?.code
      };

      // * Test 4: Try to insert a test project
      const testProjectId = `test-${Date.now()}`;
      const { error: insertError } = await supabase
        .from('projects')
        .insert({
          user_id: session?.user?.id,
          client_id: testProjectId,
          name: 'Test Project for Diagnostics',
          description: 'This is a test project'
        });
      results.insertTest = {
        success: !insertError,
        error: insertError?.message,
        errorCode: (insertError as any)?.code
      };

      // * Test 5: If insert succeeded, try to select it
      if (!insertError) {
        const { data: selectData, error: selectError } = await supabase
          .from('projects')
          .select('*')
          .eq('client_id', testProjectId)
          .single();
        results.selectTest = {
          success: !selectError,
          data: selectData,
          error: selectError?.message
        };

        // * Clean up test project
        await supabase
          .from('projects')
          .delete()
          .eq('client_id', testProjectId);
      }

      // * Test 6: Check if RLS is enabled
      const { data: rlsStatusData, error: rlsStatusError } = await supabase
        .rpc('check_rls_status', { table_name: 'projects' })
        .single();
      results.rlsEnabled = {
        success: !rlsStatusError,
        enabled: rlsStatusData?.rls_enabled,
        error: rlsStatusError?.message
      };

      // * Test 7: Check existing policies
      const { data: policiesData, error: policiesError } = await supabase
        .from('pg_policies')
        .select('*')
        .eq('tablename', 'projects');
      results.policies = {
        success: !policiesError,
        count: policiesData?.length || 0,
        policies: policiesData,
        error: policiesError?.message
      };

    } catch (error) {
      results.generalError = error;
    }

    setDiagnosticResults(results);
    setIsRunning(false);
  };

  useEffect(() => {
    // * Auto-run diagnostics on mount if user is authenticated
    if (user?.id) {
      runDiagnostics();
    }
  }, [user]);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>🔍 Supabase Connection Diagnostic</Text>

        <View style={styles.userInfo}>
          <Text style={styles.infoText}>
            <Text style={styles.bold}>Local User ID:</Text> {user?.id || 'Not authenticated'}
          </Text>
          <Text style={styles.infoText}>
            <Text style={styles.bold}>Local Email:</Text> {user?.email || 'Not authenticated'}
          </Text>
        </View>

        <TouchableOpacity
          onPress={runDiagnostics}
          disabled={isRunning}
          style={[styles.button, isRunning && styles.buttonDisabled]}
        >
          {isRunning ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.buttonText}>
              {isRunning ? 'Running Diagnostics...' : 'Run Diagnostics'}
            </Text>
          )}
        </TouchableOpacity>

        {Object.keys(diagnosticResults).length > 0 && (
          <View style={styles.resultsContainer}>
            <Text style={styles.sectionTitle}>Diagnostic Results:</Text>

            {/* Auth Session Test */}
            {diagnosticResults.authSession && (
              <View style={[
                styles.resultCard,
                diagnosticResults.authSession.success ? styles.successCard : styles.errorCard
              ]}>
                <Text style={styles.resultTitle}>✅ Auth Session</Text>
                <Text style={styles.resultText}>
                  Status: {diagnosticResults.authSession.success ? '✅ Active' : '❌ No Session'}
                </Text>
                {diagnosticResults.authSession.userId && (
                  <Text style={styles.resultText}>User ID: {diagnosticResults.authSession.userId}</Text>
                )}
                {diagnosticResults.authSession.error && (
                  <Text style={styles.errorText}>Error: {diagnosticResults.authSession.error}</Text>
                )}
              </View>
            )}

            {/* RLS Test */}
            {diagnosticResults.rlsTest && (
              <View style={[
                styles.resultCard,
                diagnosticResults.rlsTest.success ? styles.successCard : styles.errorCard
              ]}>
                <Text style={styles.resultTitle}>🔒 RLS Test (SELECT)</Text>
                <Text style={styles.resultText}>
                  Status: {diagnosticResults.rlsTest.success ? '✅ Success' : '❌ Failed'}
                </Text>
                {diagnosticResults.rlsTest.error && (
                  <>
                    <Text style={styles.errorText}>Error: {diagnosticResults.rlsTest.error}</Text>
                    <Text style={styles.errorText}>Code: {diagnosticResults.rlsTest.errorCode}</Text>
                  </>
                )}
                {diagnosticResults.rlsTest.data && (
                  <Text style={styles.resultText}>Retrieved {diagnosticResults.rlsTest.data.length} projects</Text>
                )}
              </View>
            )}

            {/* Insert Test */}
            {diagnosticResults.insertTest && (
              <View style={[
                styles.resultCard,
                diagnosticResults.insertTest.success ? styles.successCard : styles.errorCard
              ]}>
                <Text style={styles.resultTitle}>📝 Insert Test</Text>
                <Text style={styles.resultText}>
                  Status: {diagnosticResults.insertTest.success ? '✅ Success' : '❌ Failed'}
                </Text>
                {diagnosticResults.insertTest.error && (
                  <>
                    <Text style={styles.errorText}>Error: {diagnosticResults.insertTest.error}</Text>
                    <Text style={styles.errorText}>Code: {diagnosticResults.insertTest.errorCode}</Text>
                  </>
                )}
              </View>
            )}

            {/* Raw JSON output for debugging */}
            <TouchableOpacity
              style={styles.rawDataToggle}
              onPress={() => setShowRawData(!showRawData)}
            >
              <Text style={styles.rawDataToggleText}>
                📋 Raw Diagnostic Data (Tap to {showRawData ? 'hide' : 'expand'})
              </Text>
            </TouchableOpacity>

            {showRawData && (
              <View style={styles.rawDataContainer}>
                <ScrollView horizontal>
                  <Text style={styles.rawDataText}>
                    {JSON.stringify(diagnosticResults, null, 2)}
                  </Text>
                </ScrollView>
              </View>
            )}
          </View>
        )}

        <View style={styles.helpCard}>
          <Text style={styles.helpTitle}>🛠️ How to Fix 403 Forbidden Error:</Text>
          <View style={styles.helpList}>
            <View style={styles.helpItem}>
              <Text style={styles.helpNumber}>1.</Text>
              <View style={styles.helpTextContainer}>
                <Text style={styles.helpBold}>Apply RLS Policies:</Text>
                <Text style={styles.helpText}>
                  Go to your Supabase dashboard → SQL Editor →
                  Run the SQL script in /scripts/fix-supabase-rls.sql
                </Text>
              </View>
            </View>
            <View style={styles.helpItem}>
              <Text style={styles.helpNumber}>2.</Text>
              <View style={styles.helpTextContainer}>
                <Text style={styles.helpBold}>Verify Authentication:</Text>
                <Text style={styles.helpText}>
                  Make sure you're logged in with a valid Supabase user
                </Text>
              </View>
            </View>
            <View style={styles.helpItem}>
              <Text style={styles.helpNumber}>3.</Text>
              <View style={styles.helpTextContainer}>
                <Text style={styles.helpBold}>Check User ID Match:</Text>
                <Text style={styles.helpText}>
                  Ensure the user_id in projects table matches auth.uid()
                </Text>
              </View>
            </View>
            <View style={styles.helpItem}>
              <Text style={styles.helpNumber}>4.</Text>
              <View style={styles.helpTextContainer}>
                <Text style={styles.helpBold}>Test with Service Role Key:</Text>
                <Text style={styles.helpText}>
                  If needed for debugging, temporarily use service role key (not for production!)
                </Text>
              </View>
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  card: {
    padding: 20,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    maxWidth: 800,
    marginHorizontal: 20,
    marginVertical: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333333',
  },
  userInfo: {
    marginBottom: 20,
  },
  infoText: {
    fontSize: 14,
    color: '#333333',
    marginBottom: 5,
  },
  bold: {
    fontWeight: 'bold',
  },
  button: {
    padding: 12,
    backgroundColor: '#4CAF50',
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
  resultsContainer: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333333',
  },
  resultCard: {
    marginBottom: 15,
    padding: 10,
    borderRadius: 4,
  },
  successCard: {
    backgroundColor: '#E8F5E9',
  },
  errorCard: {
    backgroundColor: '#FFEBEE',
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#333333',
  },
  resultText: {
    fontSize: 14,
    color: '#333333',
    marginBottom: 3,
  },
  errorText: {
    fontSize: 14,
    color: '#D32F2F',
    marginBottom: 3,
  },
  rawDataToggle: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
  },
  rawDataToggleText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333333',
  },
  rawDataContainer: {
    marginTop: 10,
    padding: 10,
    backgroundColor: '#F0F0F0',
    borderRadius: 4,
  },
  rawDataText: {
    fontSize: 12,
    fontFamily: 'monospace',
    color: '#333333',
  },
  helpCard: {
    marginTop: 30,
    padding: 15,
    backgroundColor: '#FFF3CD',
    borderRadius: 4,
  },
  helpTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333333',
  },
  helpList: {
    marginLeft: 10,
  },
  helpItem: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  helpNumber: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333333',
    marginRight: 10,
  },
  helpTextContainer: {
    flex: 1,
  },
  helpBold: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 2,
  },
  helpText: {
    fontSize: 14,
    color: '#333333',
  },
});