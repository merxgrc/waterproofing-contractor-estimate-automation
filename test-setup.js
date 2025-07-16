// test-setup.js - Simple test to verify environment setup
import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
config({ path: join(__dirname, '.env') });

console.log('🔍 Testing Environment Setup...\n');

// Test environment variables
const requiredEnvVars = [
  'VITE_OPENAI_API_KEY',
  'VITE_SUPABASE_URL', 
  'VITE_SUPABASE_ANON_KEY'
];

let allGood = true;

console.log('📋 Environment Variables:');
requiredEnvVars.forEach(varName => {
  const value = process.env[varName];
  if (value) {
    console.log(`✅ ${varName}: ${value.substring(0, 10)}...`);
  } else {
    console.log(`❌ ${varName}: NOT SET`);
    allGood = false;
  }
});

// Test OpenAI API key format
const openaiKey = process.env.VITE_OPENAI_API_KEY;
if (openaiKey && !openaiKey.startsWith('sk-')) {
  console.log('⚠️  VITE_OPENAI_API_KEY format looks incorrect (should start with "sk-")');
  allGood = false;
}

// Test Supabase URL format
const supabaseUrl = process.env.VITE_SUPABASE_URL;
if (supabaseUrl && !supabaseUrl.includes('supabase.co')) {
  console.log('⚠️  VITE_SUPABASE_URL format looks incorrect (should contain "supabase.co")');
  allGood = false;
}

console.log('\n📦 Dependencies:');
try {
  const packageJson = JSON.parse(await import('fs').then(fs => fs.readFileSync('package.json', 'utf8')));
  const requiredDeps = ['@supabase/supabase-js', 'react', 'react-dom'];
  
  requiredDeps.forEach(dep => {
    if (packageJson.dependencies[dep]) {
      console.log(`✅ ${dep}: ${packageJson.dependencies[dep]}`);
    } else {
      console.log(`❌ ${dep}: NOT FOUND`);
      allGood = false;
    }
  });
} catch (error) {
  console.log('❌ Could not read package.json');
  allGood = false;
}

console.log('\n🎯 Summary:');
if (allGood) {
  console.log('✅ All checks passed! Your environment is ready.');
  console.log('\n🚀 Next steps:');
  console.log('1. Run: npm run dev');
  console.log('2. Open: http://localhost:5173');
  console.log('3. Navigate to "New Estimate" page');
  console.log('4. Test the 4-step estimate creation flow');
} else {
  console.log('❌ Some issues found. Please fix them before running the application.');
  console.log('\n📖 See SETUP.md for detailed setup instructions.');
}

console.log('\n📚 For more help, check SETUP.md'); 