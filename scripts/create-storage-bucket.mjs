#!/usr/bin/env node
/**
 * Create the organization-logos storage bucket in Supabase
 * Run with: node scripts/create-storage-bucket.mjs
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing environment variables. Make sure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function createBucket() {
  console.log('Checking if bucket exists...');

  // List buckets
  const { data: buckets, error: listError } = await supabase.storage.listBuckets();

  if (listError) {
    console.error('Error listing buckets:', listError.message);
    process.exit(1);
  }

  const bucketExists = buckets?.some(b => b.id === 'organization-logos');

  if (bucketExists) {
    console.log('✅ Bucket "organization-logos" already exists');
    return;
  }

  console.log('Creating bucket "organization-logos"...');

  const { data, error } = await supabase.storage.createBucket('organization-logos', {
    public: true,
    fileSizeLimit: 2097152, // 2MB
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'],
  });

  if (error) {
    console.error('Error creating bucket:', error.message);
    process.exit(1);
  }

  console.log('✅ Bucket created successfully:', data);
}

createBucket();
