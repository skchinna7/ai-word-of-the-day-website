// ===== TRENDING WORDS =====

async function loadTrendingWords() {
    await loadWeeklyTrending();
    await loadMonthlyTrending();
}

async function loadWeeklyTrending() {
    try {
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        
        const { data: words } = await supabase
            .from('words')
            .select('*')
            .gte('scheduled_for', weekAgo.toISOString().split('T')[0])
            .order('views', { ascending: false })
            .limit(5);
        
        const container = document.getElementById('weeklyTrending');
        if (!container) return;
        
        if (words && words.length > 0) {
            container.innerHTML = renderTrendingList(words);
        } else {
            container.innerHTML = '<p style="text-align: center; opacity: 0.6;">No data yet</p>';
        }
    } catch (error) {
        console.error('Error loading weekly trending:', error);
    }
}

async function loadMonthlyTrending() {
    try {
        const monthAgo = new Date();
        monthAgo.setDate(monthAgo.getDate() - 30);
        
        const { data: words } = await supabase
            .from('words')
            .select('*')
            .gte('scheduled_for', monthAgo.toISOString().split('T')[0])
            .order('views', { ascending: false })
            .limit(5);
        
        const container = document.getElementById('monthlyTrending');
        if (!container) return;
        
        if (words && words.length > 0) {
            container.innerHTML = renderTrendingList(words);
        } else {
            container.innerHTML = '<p style="text-align: center; opacity: 0.6;">No data yet</p>';
        }
    } catch (error) {
        console.error('Error loading monthly trending:', error);
    }
}

function renderTrendingList(words) {
    return words.map((w, i) => `
        <div class="trending-item">
            <div class="trending-rank">#${i + 1}</div>
            <div class="trending-content">
                <div class="trending-word">${w.word}</div>
                <div class="trending-stats">👁️ ${w.views || 0} views</div>
            </div>
        </div>
    `).join('');
}
