console.log('📦 Loading config...');

// Initialize Supabase - MAKE IT GLOBAL
const { createClient } = window.supabase;
window.sb = createClient(
    "https://qzatavslhtkioivemwlk.supabase.co",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF6YXRhdnNsaHRraW9pdmVtd2xrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA1MzIyMTYsImV4cCI6MjA4NjEwODIxNn0.LaNyj8T6VYGMMbuyX-Fg_6Fm6yIhPLTW0enYd6sNdGE"
);

console.log('✅ Supabase initialized:', window.sb ? 'Success' : 'Failed');

// Theme management with fallback for tracking prevention
function initTheme() {
    let theme = 'dark';
    
    // Try to get from localStorage with fallback
    try {
        theme = localStorage.getItem('theme') || 'dark';
    } catch (e) {
        console.warn('localStorage blocked, using default theme');
    }
    
    document.body.className = theme === 'dark' ? 'bg-dark text-light' : 'bg-light text-dark';
    
    const toggle = document.getElementById('themeToggle');
    if (toggle) {
        toggle.innerHTML = theme === 'dark' ? '<i class="bi bi-sun-fill"></i>' : '<i class="bi bi-moon-fill"></i>';
        toggle.onclick = () => {
            const newTheme = theme === 'dark' ? 'light' : 'dark';
            try {
                localStorage.setItem('theme', newTheme);
            } catch (e) {
                console.warn('Cannot save theme preference');
            }
            location.reload();
        };
    }
}

// Wait for DOM, then init theme
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initTheme);
} else {
    initTheme();
}
