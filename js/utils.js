// ===== UTILITY FUNCTIONS =====

// Get local date (not UTC)
function getLocalDate() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// Calculate time until midnight
function getMillisecondsUntilMidnight() {
    const now = new Date();
    const midnight = new Date(now);
    midnight.setHours(24, 0, 0, 0);
    return midnight - now;
}

// Schedule page refresh at midnight
function scheduleRefreshAtMidnight() {
    const msUntilMidnight = getMillisecondsUntilMidnight();
    const minutesUntil = Math.floor(msUntilMidnight / 1000 / 60);
    console.log(`⏰ Auto-refresh in ${minutesUntil} minutes`);
    
    setTimeout(() => {
        console.log('🔄 Midnight! Refreshing...');
        window.location.reload();
    }, msUntilMidnight);
}

// Display timezone
function displayTimezone() {
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const offset = new Date().getTimezoneOffset();
    const offsetHours = Math.abs(Math.floor(offset / 60));
    const offsetMins = Math.abs(offset % 60);
    const offsetSign = offset <= 0 ? '+' : '-';
    
    const elem = document.getElementById('timezoneInfo');
    if (elem) {
        elem.textContent = `🌍 ${timezone} (UTC${offsetSign}${offsetHours}:${String(offsetMins).padStart(2, '0')})`;
    }
}

// Animate number counter
function animateCount(element, start, end, duration) {
    if (!element) return;
    
    const startTime = Date.now();
    const range = end - start;
    
    function update() {
        const now = Date.now();
        const progress = Math.min((now - startTime) / duration, 1);
        const easeOutQuad = progress * (2 - progress);
        const current = Math.floor(easeOutQuad * range + start);
        
        element.textContent = current.toLocaleString();
        
        if (progress < 1) {
            requestAnimationFrame(update);
        } else {
            element.textContent = end.toLocaleString();
        }
    }
    
    update();
}

// Switch trending tabs
window.switchTrending = function(period) {
    document.querySelectorAll('.trending-tab').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.trending-list').forEach(list => list.classList.remove('active'));
    event.target.classList.add('active');
    document.getElementById(period === 'week' ? 'trendingWeek' : 'trendingMonth').classList.add('active');
};