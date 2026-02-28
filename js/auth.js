// ===== AUTHENTICATION =====

let currentUser = null;

async function checkLoginStatus() {
    try {
        const { data: { session } } = await supabase.auth.getSession();
        const controls = document.getElementById('headerControls');
        if (!controls) return;
        
        if (session && session.user) {
            currentUser = session.user;
            renderLoggedInHeader(controls);
        }
    } catch (err) {
        console.error('Login check error:', err);
    }
}

function renderLoggedInHeader(controls) {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    
    controls.innerHTML = `
        <div class="user-badge">
            <span>👤</span>
            <span>${currentUser.email}</span>
        </div>
        <a href="admin.html" class="btn">⚙️ Admin</a>
        <button class="btn-logout" id="logoutBtn">Logout</button>
        <div class="theme-toggle ${savedTheme === 'dark' ? 'active' : ''}" id="themeToggleNew"></div>
        <a href="about.html" class="btn">ℹ️ About</a>
        <a href="archive.html" class="btn">📚 Archive</a>
    `;
    
    setupLoggedInControls();
}

function setupLoggedInControls() {
    // Re-attach theme toggle
    const newThemeToggle = document.getElementById('themeToggleNew');
    if (newThemeToggle) {
        newThemeToggle.addEventListener('click', toggleTheme);
    }
    
    // Attach logout
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }
}

async function handleLogout() {
    try {
        await supabase.auth.signOut();
        window.location.reload();
    } catch (error) {
        console.error('Logout error:', error);
    }
}