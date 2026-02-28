// Global configuration - loaded first
const SUPABASE_CONFIG = {
    url: "https://qzatavslhtkioivemwlk.supabase.co",
    key: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF6YXRhdnNsaHRraW9pdmVtd2xrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA1MzIyMTYsImV4cCI6MjA4NjEwODIxNn0.LaNyj8T6VYGMMbuyX-Fg_6Fm6yIhPLTW0enYd6sNdGE"
};

// Initialize Supabase - make it GLOBAL
let supabase;

(function() {
    const { createClient } = window.supabase;
    supabase = createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.key, {
        auth: {
            persistSession: true,
            autoRefreshToken: true,
            detectSessionInUrl: true
        }
    });
    
    // Make it globally accessible
    window.supabase = supabase;
})();

// Global state
window.appState = {
    currentWord: null,
    currentUser: null
};