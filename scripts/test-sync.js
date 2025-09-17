#!/usr/bin/env node

/**
 * Test Supabase Sync Functionality
 * Creates test data and verifies sync operations
 */

const { createClient } = require('@supabase/supabase-js');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://cbyvpuqisqmepubzrwuo.supabase.co';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNieXZwdXFpc3FtZXB1Ynpyd3VvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYzMjEyNDgsImV4cCI6MjA3MTg5NzI0OH0.aRvZRU-iU52M9N85NJc7BrmpiBF776-GcKlYblIWzF4';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testSync() {
  console.log('🧪 Testing Supabase Sync Functionality...\n');

  // Step 1: Sign in or create a test user
  console.log('1️⃣ Creating/signing in test user...');
  const testEmail = `test_${Date.now()}@example.com`;
  const testPassword = 'TestPassword123!';

  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: testEmail,
    password: testPassword,
  });

  if (authError) {
    console.error('❌ Auth error:', authError);
    return;
  }

  const userId = authData.user?.id;
  console.log(`✅ User created/signed in: ${userId}\n`);

  // Step 2: Create a test project
  console.log('2️⃣ Creating test project...');
  const projectId = uuidv4();
  const projectData = {
    id: projectId,
    user_id: userId,
    client_id: 'test-client-' + Date.now(),
    name: 'Test Fantasy World',
    description: 'A test project for sync verification',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  const { data: project, error: projectError } = await supabase
    .from('projects')
    .insert([projectData])
    .select()
    .single();

  if (projectError) {
    console.error('❌ Project creation error:', projectError);
    return;
  }

  console.log(`✅ Project created: ${project.name}\n`);

  // Step 3: Create test world elements
  console.log('3️⃣ Creating world elements...');
  const elements = [
    {
      id: uuidv4(),
      project_id: projectId,
      client_id: 'element-1-' + Date.now(),
      name: 'Aragorn',
      category: 'character',
      template_id: null,
      answers: {
        race: 'Human',
        class: 'Ranger',
        alignment: 'Lawful Good',
        description: 'The rightful king of Gondor'
      }
    },
    {
      id: uuidv4(),
      project_id: projectId,
      client_id: 'element-2-' + Date.now(),
      name: 'Rivendell',
      category: 'location',
      template_id: null,
      answers: {
        region: 'Middle-earth',
        population: '~5000',
        ruler: 'Elrond',
        description: 'Elven realm of Lord Elrond'
      }
    }
  ];

  const { data: worldElements, error: elementsError } = await supabase
    .from('world_elements')
    .insert(elements)
    .select();

  if (elementsError) {
    console.error('❌ Elements creation error:', elementsError);
    return;
  }

  console.log(`✅ Created ${worldElements.length} world elements\n`);

  // Step 4: Create a relationship
  console.log('4️⃣ Creating relationship...');
  const relationship = {
    id: uuidv4(),
    project_id: projectId,
    client_id: 'relationship-1-' + Date.now(),
    source_id: elements[0].client_id,
    target_id: elements[1].client_id,
    relationship_type: 'visited',
    description: 'Aragorn has visited Rivendell many times',
    metadata: {}
  };

  const { data: rel, error: relError } = await supabase
    .from('relationships')
    .insert([relationship])
    .select()
    .single();

  if (relError) {
    console.error('❌ Relationship creation error:', relError);
    return;
  }

  console.log(`✅ Relationship created\n`);

  // Step 5: Verify data retrieval
  console.log('5️⃣ Verifying data retrieval...');
  
  // Get projects
  const { data: projects, error: getProjectsError } = await supabase
    .from('projects')
    .select('*')
    .eq('user_id', userId);

  if (getProjectsError) {
    console.error('❌ Error fetching projects:', getProjectsError);
    return;
  }

  console.log(`✅ Retrieved ${projects.length} project(s)`);

  // Get world elements
  const { data: retrievedElements, error: getElementsError } = await supabase
    .from('world_elements')
    .select('*')
    .eq('project_id', projectId);

  if (getElementsError) {
    console.error('❌ Error fetching elements:', getElementsError);
    return;
  }

  console.log(`✅ Retrieved ${retrievedElements.length} world element(s)`);

  // Get relationships
  const { data: relationships, error: getRelError } = await supabase
    .from('relationships')
    .select('*')
    .eq('project_id', projectId);

  if (getRelError) {
    console.error('❌ Error fetching relationships:', getRelError);
    return;
  }

  console.log(`✅ Retrieved ${relationships.length} relationship(s)\n`);

  // Step 6: Test update sync
  console.log('6️⃣ Testing update sync...');
  const { data: updatedElement, error: updateError } = await supabase
    .from('world_elements')
    .update({ description: 'Updated: The rightful king of Gondor and Arnor' })
    .eq('id', elements[0].id)
    .select()
    .single();

  if (updateError) {
    console.error('❌ Update error:', updateError);
    return;
  }

  console.log(`✅ Successfully updated element\n`);

  // Step 7: Clean up test data
  console.log('7️⃣ Cleaning up test data...');
  
  // Delete relationships
  await supabase.from('relationships').delete().eq('project_id', projectId);
  
  // Delete world elements
  await supabase.from('world_elements').delete().eq('project_id', projectId);
  
  // Delete project
  await supabase.from('projects').delete().eq('id', projectId);

  console.log('✅ Test data cleaned up\n');

  console.log('🎉 All sync tests passed successfully!');
  console.log('   The Supabase sync functionality is working correctly.');
  console.log('   Your app can now save and retrieve data from the cloud.');
}

// Run the test
testSync().catch(error => {
  console.error('❌ Unexpected error:', error);
  process.exit(1);
});