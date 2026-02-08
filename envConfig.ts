// Environment Configuration Validator
// This file helps debug environment variable issues

export const getEnvConfig = () => {
  const config = {
    supabaseUrl: import.meta.env.VITE_SUPABASE_URL,
    supabaseAnonKey: import.meta.env.VITE_SUPABASE_ANON_KEY,
    openaiApiKey: import.meta.env.VITE_OPENAI_API_KEY,
  };

  // Log configuration status (without exposing sensitive data)
  console.log('🔧 Environment Configuration Check:');
  console.log('  Supabase URL:', config.supabaseUrl ? '✅ Set' : '❌ Missing');
  console.log('  Supabase Key:', config.supabaseAnonKey ? '✅ Set' : '❌ Missing');
  console.log('  OpenAI Key:', config.openaiApiKey ? '✅ Set' : '❌ Missing');

  // Validate Supabase URL format
  if (config.supabaseUrl && !config.supabaseUrl.startsWith('https://')) {
    console.error('❌ Invalid Supabase URL format. Should start with https://');
  }

  // Validate Supabase Key format
  if (config.supabaseAnonKey && !config.supabaseAnonKey.startsWith('eyJ')) {
    console.error('❌ Invalid Supabase Key format. Should start with eyJ');
  }

  return config;
};

export const validateEnvironment = (): {
  isValid: boolean;
  errors: string[];
} => {
  const errors: string[] = [];
  const config = getEnvConfig();

  if (!config.supabaseUrl) {
    errors.push('VITE_SUPABASE_URL is not set');
  } else if (!config.supabaseUrl.startsWith('https://')) {
    errors.push('VITE_SUPABASE_URL must start with https://');
  }

  if (!config.supabaseAnonKey) {
    errors.push('VITE_SUPABASE_ANON_KEY is not set');
  } else if (!config.supabaseAnonKey.startsWith('eyJ')) {
    errors.push('VITE_SUPABASE_ANON_KEY appears to be invalid (should start with eyJ)');
  }

  if (errors.length > 0) {
    console.error('❌ Environment Validation Failed:');
    errors.forEach((error) => console.error(`   - ${error}`));
  } else {
    console.log('✅ Environment validation passed');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};
