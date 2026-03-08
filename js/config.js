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