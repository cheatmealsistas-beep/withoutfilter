#!/usr/bin/env node

/**
 * Script to fix missing home content for existing organizations
 *
 * This script:
 * 1. Finds all organizations that have app_modules with empty content
 * 2. Gets the professional_type from the owner's profile
 * 3. Sets the default home content based on professional type
 *
 * Usage: node scripts/fix-home-content.mjs
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Load .env.local manually
const envPath = join(__dirname, '..', '.env.local');
try {
  const envContent = readFileSync(envPath, 'utf-8');
  envContent.split('\n').forEach(line => {
    const [key, ...valueParts] = line.split('=');
    if (key && valueParts.length > 0) {
      const value = valueParts.join('=').trim();
      process.env[key.trim()] = value;
    }
  });
} catch (e) {
  console.error('Could not load .env.local:', e.message);
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables: NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// Default home content based on professional type
const defaultHomeContent = {
  coach: {
    headline: 'Transforma tu vida con coaching personalizado',
    description: 'Te acompaño en tu proceso de cambio para alcanzar tus metas personales y profesionales.',
    ctaText: 'Reservar sesión',
  },
  therapist: {
    headline: 'Tu bienestar emocional es mi prioridad',
    description: 'Un espacio seguro para trabajar tu salud mental y encontrar equilibrio.',
    ctaText: 'Pedir cita',
  },
  trainer: {
    headline: 'Aprende con metodología práctica y efectiva',
    description: 'Formación diseñada para que apliques lo aprendido desde el primer día.',
    ctaText: 'Ver cursos',
  },
  content_creator: {
    headline: 'Contenido que inspira y transforma',
    description: 'Recursos exclusivos para tu crecimiento personal y profesional.',
    ctaText: 'Explorar contenido',
  },
  mentor: {
    headline: 'Guía experta para alcanzar tus metas',
    description: 'Mentoring personalizado basado en experiencia real y resultados probados.',
    ctaText: 'Empezar ahora',
  },
  other: {
    headline: 'Bienvenido a mi espacio',
    description: 'Descubre todo lo que tengo preparado para ti.',
    ctaText: 'Comenzar',
  },
};

async function fixHomeContent() {
  console.log('🔍 Finding organizations with missing/empty home content...\n');

  // Get all non-personal organizations
  const { data: organizations, error: orgError } = await supabase
    .from('organizations')
    .select('id, name, slug, created_by')
    .or('is_personal.eq.false,is_personal.is.null');

  if (orgError) {
    console.error('❌ Error fetching organizations:', orgError.message);
    process.exit(1);
  }

  console.log(`📋 Found ${organizations.length} organization(s)\n`);

  let fixed = 0;
  let skipped = 0;
  let errors = 0;

  for (const org of organizations) {
    console.log(`\n📦 Processing: ${org.name} (${org.slug})`);

    // Check if home module exists and has content
    const { data: module } = await supabase
      .from('app_modules')
      .select('id, content')
      .eq('organization_id', org.id)
      .eq('type', 'home')
      .maybeSingle();

    // Check if content is empty or has default empty structure
    const hasContent = module?.content &&
      Object.keys(module.content).length > 0 &&
      (module.content.headline || module.content.description);

    if (hasContent) {
      console.log(`  ✓ Already has content, skipping`);
      skipped++;
      continue;
    }

    // Get owner's professional type
    let professionalType = 'other';
    if (org.created_by) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('professional_type')
        .eq('id', org.created_by)
        .single();

      if (profile?.professional_type) {
        professionalType = profile.professional_type;
      }
    }

    const content = defaultHomeContent[professionalType] || defaultHomeContent.other;
    console.log(`  → Professional type: ${professionalType}`);
    console.log(`  → Setting content: "${content.headline}"`);

    if (module) {
      // Update existing module
      const { error: updateError } = await supabase
        .from('app_modules')
        .update({
          content,
          is_enabled: true,
        })
        .eq('id', module.id);

      if (updateError) {
        console.log(`  ❌ Error updating: ${updateError.message}`);
        errors++;
      } else {
        console.log(`  ✅ Updated successfully`);
        fixed++;
      }
    } else {
      // Create home module
      const { error: insertError } = await supabase
        .from('app_modules')
        .insert({
          organization_id: org.id,
          type: 'home',
          is_enabled: true,
          is_public: true,
          display_order: 0,
          content,
        });

      if (insertError) {
        console.log(`  ❌ Error creating: ${insertError.message}`);
        errors++;
      } else {
        console.log(`  ✅ Created successfully`);
        fixed++;
      }
    }
  }

  console.log('\n' + '='.repeat(50));
  console.log('📊 Summary:');
  console.log(`   ✅ Fixed: ${fixed}`);
  console.log(`   ⏭️  Skipped (already has content): ${skipped}`);
  console.log(`   ❌ Errors: ${errors}`);
  console.log('='.repeat(50) + '\n');
}

fixHomeContent().catch(console.error);
