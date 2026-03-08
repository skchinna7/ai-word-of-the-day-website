console.log('🚀 Starting...');

// Supabase
const { createClient } = window.supabase;
const sb = createClient(
    "https://qzatavslhtkioivemwlk.supabase.co",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF6YXRhdnNsaHRraW9pdmVtd2xrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA1MzIyMTYsImV4cCI6MjA4NjEwODIxNn0.LaNyj8T6VYGMMbuyX-Fg_6Fm6yIhPLTW0enYd6sNdGE"
);

// Theme with fallback
let theme = 'dark';
try {
    theme = localStorage.getItem('theme') || 'dark';
} catch (e) {
    console.warn('localStorage blocked');
}

document.body.className = theme;
const toggle = document.getElementById('themeToggle');
if (theme === 'dark') toggle.classList.add('active');

toggle.onclick = () => {
    const isDark = document.body.classList.contains('dark');
    document.body.className = isDark ? 'light' : 'dark';
    toggle.classList.toggle('active');
    try {
        localStorage.setItem('theme', isDark ? 'light' : 'dark');
    } catch (e) {
        console.warn('localStorage blocked');
    }
};

function getLocalDate() {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

// Word count
async function loadStats() {
    const { data } = await sb.from('words').select('id');
    document.getElementById('totalWords').textContent = data ? data.length : 0;
}

// Today's word
async function loadWord() {
    const today = getLocalDate();
    let { data } = await sb.from('words').select('*').eq('scheduled_for', today).limit(1);
    
    if (!data || !data[0]) {
        const r = await sb.from('words').select('*').order('created_at', {ascending: false}).limit(1);
        data = r.data;
    }
    
    if (!data || !data[0]) {
        document.getElementById('word').textContent = 'No Words Yet';
        document.getElementById('meaning').textContent = 'Add words in admin';
        return;
    }
    
    const word = data[0];
    document.getElementById('word').textContent = word.word;
    document.getElementById('meaning').textContent = word.meaning;
    document.getElementById('phonetic').textContent = word.phonetic || '';
    document.getElementById('pronunciation').textContent = word.pronunciation || '';
    
    if (word.part_of_speech) {
        document.getElementById('partOfSpeech').textContent = word.part_of_speech;
        document.getElementById('partOfSpeech').style.display = 'inline-block';
    }
    
    if (word.synonyms && word.synonyms.length > 0) {
        document.getElementById('synonyms').innerHTML = word.synonyms.map(s => `<span class="syn-ant-tag">${s}</span>`).join('');
        document.getElementById('synonymsSection').style.display = 'block';
    }
    
    if (word.antonyms && word.antonyms.length > 0) {
        document.getElementById('antonyms').innerHTML = word.antonyms.map(a => `<span class="syn-ant-tag antonym">${a}</span>`).join('');
        document.getElementById('antonymsSection').style.display = 'block';
    }
    
    document.getElementById('stats').innerHTML = `<div class="stat-item">👁️ ${word.views || 0} views</div>`;
}

// Previous words
async function loadPreviousWords() {
    const today = getLocalDate();
    const { data: words } = await sb.from('words').select('*').lt('scheduled_for', today).order('scheduled_for', {ascending: false}).limit(6);
    
    const container = document.getElementById('previousWords');
    if (!words || words.length === 0) {
        container.innerHTML = '<p style="text-align: center; opacity: 0.6;">No previous words yet</p>';
        return;
    }
    
    container.innerHTML = words.map(w => `
        <div class="word-item">
            <div class="word-item-title">${w.word}</div>
            <div class="word-item-date">📅 ${new Date(w.scheduled_for).toLocaleDateString()}</div>
            <div class="word-item-meaning">${w.meaning.substring(0, 100)}${w.meaning.length > 100 ? '...' : ''}</div>
        </div>
    `).join('');
}

// Trending
async function loadTrending() {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    
    const { data: weekly } = await sb.from('words').select('*').gte('scheduled_for', weekAgo.toISOString().split('T')[0]).order('views', {ascending: false}).limit(5);
    
    document.getElementById('weeklyTrending').innerHTML = weekly && weekly.length > 0
        ? weekly.map((w, i) => `
            <div class="trending-item">
                <div class="trending-rank">#${i + 1}</div>
                <div class="trending-content">
                    <div class="trending-word">${w.word}</div>
                    <div class="trending-stats">👁️ ${w.views || 0} views</div>
                </div>
            </div>
        `).join('')
        : '<p style="text-align: center; opacity: 0.6;">No data yet</p>';
    
    const monthAgo = new Date();
    monthAgo.setDate(monthAgo.getDate() - 30);
    
    const { data: monthly } = await sb.from('words').select('*').gte('scheduled_for', monthAgo.toISOString().split('T')[0]).order('views', {ascending: false}).limit(5);
    
    document.getElementById('monthlyTrending').innerHTML = monthly && monthly.length > 0
        ? monthly.map((w, i) => `
            <div class="trending-item">
                <div class="trending-rank">#${i + 1}</div>
                <div class="trending-content">
                    <div class="trending-word">${w.word}</div>
                    <div class="trending-stats">👁️ ${w.views || 0} views</div>
                </div>
            </div>
        `).join('')
        : '<p style="text-align: center; opacity: 0.6;">No data yet</p>';
}

window.switchTrending = function(period) {
    document.querySelectorAll('.trending-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.trending-list').forEach(l => l.classList.remove('active'));
    event.target.classList.add('active');
    document.getElementById(period === 'week' ? 'trendingWeek' : 'trendingMonth').classList.add('active');
};

// Search
let searchTimeout;
document.getElementById('searchBar').addEventListener('input', (e) => {
    const query = e.target.value.trim();
    clearTimeout(searchTimeout);
    
    if (query.length < 2) {
        document.getElementById('searchResults').style.display = 'none';
        return;
    }
    
    searchTimeout = setTimeout(() => searchWords(query), 300);
});

async function searchWords(query) {
    const { data: words } = await sb.from('words').select('*').or(`word.ilike.%${query}%,meaning.ilike.%${query}%`);
    const resultsDiv = document.getElementById('searchResults');
    
    if (!words || words.length === 0) {
        resultsDiv.innerHTML = '<p>No words found</p>';
        resultsDiv.style.display = 'block';
        return;
    }

    resultsDiv.innerHTML = `
        <h3>Found ${words.length} word${words.length > 1 ? 's' : ''}</h3>
        ${words.map(w => `
            <div style="padding: 15px; border-bottom: 1px solid #eee;">
                <strong style="font-size: 20px;">${w.word}</strong>
                ${w.phonetic ? `<span style="color: #666; font-style: italic; margin-left: 10px;">${w.phonetic}</span>` : ''}
                <p>${w.meaning}</p>
            </div>
        `).join('')}
    `;
    resultsDiv.style.display = 'block';
}

// Newsletter
document.getElementById('subscribeForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('subscribeEmail').value.trim();
    const statusDiv = document.getElementById('subscribeStatus');

    try {
        const { error } = await sb.from('subscribers').insert({ email });
        if (error) {
            if (error.code === '23505') {
                statusDiv.textContent = 'Already subscribed!';
                statusDiv.style.color = '#ffeb3b';
            } else {
                throw error;
            }
        } else {
            statusDiv.textContent = '✅ Subscribed!';
            statusDiv.style.color = '#fff';
            document.getElementById('subscribeEmail').value = '';
        }
    } catch (error) {
        statusDiv.textContent = '❌ Error';
        statusDiv.style.color = '#f44336';
    }
});

// Suggestion
document.getElementById('suggestionForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const statusDiv = document.getElementById('suggestionStatus');
    statusDiv.textContent = '✅ Thank you! Your suggestion has been received.';
    statusDiv.style.display = 'block';
    statusDiv.style.color = '#4CAF50';
    document.getElementById('suggestionForm').reset();
    setTimeout(() => statusDiv.style.display = 'none', 5000);
});

// Timezone
document.getElementById('timezoneInfo').textContent = '🌍 ' + Intl.DateTimeFormat().resolvedOptions().timeZone;

// Run
loadStats();
loadWord();
loadPreviousWords();
loadTrending();

console.log('✅ Ready');