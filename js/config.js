// Configuration - loaded FIRST
console.log('📦 Loading config.js...');

const SUPABASE_CONFIG = {
    url: "https://qzatavslhtkioivemwlk.supabase.co",
    key: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF6YXRhdnNsaHRraW9pdmVtd2xrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA1MzIyMTYsImV4cCI6MjA4NjEwODIxNn0.LaNyj8T6VYGMMbuyX-Fg_6Fm6yIhPLTW0enYd6sNdGE"
};

// Wait for Supabase SDK to load, then initialize
window.addEventListener('DOMContentLoaded', function() {
    if (typeof window.supabase === 'undefined') {
        console.error('❌ Supabase SDK not loaded!');
        return;
    }
    
    const { createClient } = window.supabase;
    window.supabaseClient = createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.key, {
        auth: {
            persistSession: true,
            autoRefreshToken: true,
            detectSessionInUrl: true
        }
    });
    
    console.log('✅ Supabase initialized:', window.supabaseClient ? 'Success' : 'Failed');
});

// Global state
window.appState = {
    currentWord: null,
    currentUser: null
};

console.log('✅ config.js loaded');