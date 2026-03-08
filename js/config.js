const { createClient } = window.supabase;
const sb = createClient(
    "https://qzatavslhtkioivemwlk.supabase.co",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF6YXRhdnNsaHRraW9pdmVtd2xrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA1MzIyMTYsImV4cCI6MjA4NjEwODIxNn0.LaNyj8T6VYGMMbuyX-Fg_6Fm6yIhPLTW0enYd6sNdGE"
);

// Theme management
function initTheme() {
    const theme = localStorage.getItem('theme') || 'dark';
    document.body.className = theme === 'dark' ? 'bg-dark text-light' : 'bg-light text-dark';
    
    const toggle = document.getElementById('themeToggle');
    if (toggle) {
        toggle.innerHTML = theme === 'dark' ? '<i class="bi bi-sun-fill"></i>' : '<i class="bi bi-moon-fill"></i>';
        toggle.onclick = () => {
            const newTheme = theme === 'dark' ? 'light' : 'dark';
            localStorage.setItem('theme', newTheme);
            location.reload();
        };
    }
}

initTheme();