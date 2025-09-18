import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';

export const SupabaseDiagnostic: React.FC = () => {
  const [diagnosticResults, setDiagnosticResults] = useState<any>({});
  const [isRunning, setIsRunning] = useState(false);
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
    <div style={{ 
      padding: '20px', 
      backgroundColor: '#f5f5f5', 
      borderRadius: '8px',
      maxWidth: '800px',
      margin: '20px auto'
    }}>
      <h2>🔍 Supabase Connection Diagnostic</h2>
      
      <div style={{ marginBottom: '20px' }}>
        <p><strong>Local User ID:</strong> {user?.id || 'Not authenticated'}</p>
        <p><strong>Local Email:</strong> {user?.email || 'Not authenticated'}</p>
      </div>

      <button 
        onClick={runDiagnostics} 
        disabled={isRunning}
        style={{
          padding: '10px 20px',
          backgroundColor: '#4CAF50',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: isRunning ? 'not-allowed' : 'pointer',
          opacity: isRunning ? 0.6 : 1
        }}
      >
        {isRunning ? 'Running Diagnostics...' : 'Run Diagnostics'}
      </button>

      {Object.keys(diagnosticResults).length > 0 && (
        <div style={{ marginTop: '20px' }}>
          <h3>Diagnostic Results:</h3>
          
          {/* Auth Session Test */}
          {diagnosticResults.authSession && (
            <div style={{ 
              marginBottom: '15px', 
              padding: '10px', 
              backgroundColor: diagnosticResults.authSession.success ? '#e8f5e9' : '#ffebee',
              borderRadius: '4px'
            }}>
              <h4>✅ Auth Session</h4>
              <p>Status: {diagnosticResults.authSession.success ? '✅ Active' : '❌ No Session'}</p>
              {diagnosticResults.authSession.userId && (
                <p>User ID: {diagnosticResults.authSession.userId}</p>
              )}
              {diagnosticResults.authSession.error && (
                <p style={{ color: 'red' }}>Error: {diagnosticResults.authSession.error}</p>
              )}
            </div>
          )}

          {/* RLS Test */}
          {diagnosticResults.rlsTest && (
            <div style={{ 
              marginBottom: '15px', 
              padding: '10px', 
              backgroundColor: diagnosticResults.rlsTest.success ? '#e8f5e9' : '#ffebee',
              borderRadius: '4px'
            }}>
              <h4>🔒 RLS Test (SELECT)</h4>
              <p>Status: {diagnosticResults.rlsTest.success ? '✅ Success' : '❌ Failed'}</p>
              {diagnosticResults.rlsTest.error && (
                <>
                  <p style={{ color: 'red' }}>Error: {diagnosticResults.rlsTest.error}</p>
                  <p style={{ color: 'red' }}>Code: {diagnosticResults.rlsTest.errorCode}</p>
                </>
              )}
              {diagnosticResults.rlsTest.data && (
                <p>Retrieved {diagnosticResults.rlsTest.data.length} projects</p>
              )}
            </div>
          )}

          {/* Insert Test */}
          {diagnosticResults.insertTest && (
            <div style={{ 
              marginBottom: '15px', 
              padding: '10px', 
              backgroundColor: diagnosticResults.insertTest.success ? '#e8f5e9' : '#ffebee',
              borderRadius: '4px'
            }}>
              <h4>📝 Insert Test</h4>
              <p>Status: {diagnosticResults.insertTest.success ? '✅ Success' : '❌ Failed'}</p>
              {diagnosticResults.insertTest.error && (
                <>
                  <p style={{ color: 'red' }}>Error: {diagnosticResults.insertTest.error}</p>
                  <p style={{ color: 'red' }}>Code: {diagnosticResults.insertTest.errorCode}</p>
                </>
              )}
            </div>
          )}

          {/* Raw JSON output for debugging */}
          <details style={{ marginTop: '20px' }}>
            <summary style={{ cursor: 'pointer', fontWeight: 'bold' }}>
              📋 Raw Diagnostic Data (Click to expand)
            </summary>
            <pre style={{ 
              backgroundColor: '#f0f0f0', 
              padding: '10px', 
              borderRadius: '4px',
              overflow: 'auto'
            }}>
              {JSON.stringify(diagnosticResults, null, 2)}
            </pre>
          </details>
        </div>
      )}

      <div style={{ marginTop: '30px', padding: '15px', backgroundColor: '#fff3cd', borderRadius: '4px' }}>
        <h3>🛠️ How to Fix 403 Forbidden Error:</h3>
        <ol>
          <li>
            <strong>Apply RLS Policies:</strong> Go to your Supabase dashboard → SQL Editor → 
            Run the SQL script in <code>/scripts/fix-supabase-rls.sql</code>
          </li>
          <li>
            <strong>Verify Authentication:</strong> Make sure you're logged in with a valid Supabase user
          </li>
          <li>
            <strong>Check User ID Match:</strong> Ensure the user_id in projects table matches auth.uid()
          </li>
          <li>
            <strong>Test with Service Role Key:</strong> If needed for debugging, temporarily use service role key (not for production!)
          </li>
        </ol>
      </div>
    </div>
  );
};