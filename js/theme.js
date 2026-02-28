// ===== THEME MANAGEMENT =====

function initTheme() {
    const themeToggle = document.getElementById('themeToggle');
    if (!themeToggle) return;
    
    const savedTheme = localStorage.getItem('theme') || 'dark';
    document.body.className = savedTheme;
    if (savedTheme === 'dark') themeToggle.classList.add('active');

    themeToggle.addEventListener('click', toggleTheme);
}

function toggleTheme() {
    const isDark = document.body.classList.contains('dark');
    document.body.className = isDark ? 'light' : 'dark';
    
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        themeToggle.classList.toggle('active');
    }
    
    localStorage.setItem('theme', isDark ? 'light' : 'dark');
}

// Initialize theme on page load
initTheme();