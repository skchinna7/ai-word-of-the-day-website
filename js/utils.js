// Utility functions - loaded SECOND
console.log('📦 Loading utils.js...');

window.AppUtils = {
    getLocalDate() {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    },

    getMillisecondsUntilMidnight() {
        const now = new Date();
        const midnight = new Date(now);
        midnight.setHours(24, 0, 0, 0);
        return midnight - now;
    },

    scheduleRefreshAtMidnight() {
        const msUntilMidnight = this.getMillisecondsUntilMidnight();
        const minutesUntil = Math.floor(msUntilMidnight / 1000 / 60);
        console.log(`⏰ Next refresh in ${minutesUntil} minutes`);
        setTimeout(() => window.location.reload(), msUntilMidnight);
    },

    displayTimezone() {
        const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        const offset = new Date().getTimezoneOffset();
        const offsetHours = Math.abs(Math.floor(offset / 60));
        const offsetMins = Math.abs(offset % 60);
        const offsetSign = offset <= 0 ? '+' : '-';
        
        const elem = document.getElementById('timezoneInfo');
        if (elem) {
            elem.textContent = `🌍 ${timezone} (UTC${offsetSign}${offsetHours}:${String(offsetMins).padStart(2, '0')})`;
        }
    },

    animateCount(element, start, end, duration) {
        if (!element) return;
        
        const startTime = Date.now();
        const range = end - start;
        
        function update() {
            const now = Date.now();
            const progress = Math.min((now - startTime) / duration, 1);
            const easeOut = progress * (2 - progress);
            const current = Math.floor(easeOut * range + start);
            
            element.textContent = current.toLocaleString();
            
            if (progress < 1) {
                requestAnimationFrame(update);
            } else {
                element.textContent = end.toLocaleString();
            }
        }
        
        update();
    }
};

// Global function for HTML onclick
window.switchTrending = function(period) {
    document.querySelectorAll('.trending-tab').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.trending-list').forEach(list => list.classList.remove('active'));
    event.target.classList.add('active');
    document.getElementById(period === 'week' ? 'trendingWeek' : 'trendingMonth').classList.add('active');
};

console.log('✅ utils.js loaded');