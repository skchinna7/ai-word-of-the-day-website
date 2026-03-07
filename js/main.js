console.log('🚀 Starting...');

// Initialize Supabase
const { createClient } = window.supabase;
const sb = createClient(
    "https://qzatavslhtkioivemwlk.supabase.co",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF6YXRhdnNsaHRraW9pdmVtd2xrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA1MzIyMTYsImV4cCI6MjA4NjEwODIxNn0.LaNyj8T6VYGMMbuyX-Fg_6Fm6yIhPLTW0enYd6sNdGE"
);

// ============================================
// THEME MANAGEMENT
// ============================================

const theme = localStorage.getItem('theme') || 'dark';
document.body.className = theme;
const toggle = document.getElementById('themeToggle');
if (toggle) {
    if (theme === 'dark') toggle.classList.add('active');
    toggle.onclick = () => {
        const isDark = document.body.classList.contains('dark');
        document.body.className = isDark ? 'light' : 'dark';
        toggle.classList.toggle('active');
        localStorage.setItem('theme', isDark ? 'light' : 'dark');
    };
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

function getLocalDate() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// ============================================
// WORD COUNT
// ============================================

async function loadStats() {
    console.log('📊 Loading word count...');
    
    const { data: w } = await sb.from('words').select('id');
    const wc = w ? w.length : 0;
    
    console.log('Total words:', wc);
    
    const elem = document.getElementById('totalWords');
    if (elem) {
        elem.textContent = wc;
    }
}

// ============================================
// TODAY'S WORD
// ============================================

async function loadWord() {
    console.log('📝 Loading word...');
    
    const today = getLocalDate();
    let { data } = await sb.from('words').select('*').eq('scheduled_for', today).limit(1);
    
    if (!data || !data[0]) {
        const r = await sb.from('words').select('*').order('created_at', {ascending: false}).limit(1);
        data = r.data;
    }
    
    if (!data || !data[0]) {
        document.getElementById('word').textContent = 'No Words';
        document.getElementById('meaning').textContent = 'Add words in admin panel';
        return;
    }
    
    const word = data[0];
    console.log('Got word:', word.word);
    
    document.getElementById('word').textContent = word.word;
    document.getElementById('meaning').textContent = word.meaning;
    document.getElementById('phonetic').textContent = word.phonetic || '';
    document.getElementById('pronunciation').textContent = word.pronunciation || '';
    
    const posElem = document.getElementById('partOfSpeech');
    if (posElem && word.part_of_speech) {
        posElem.textContent = word.part_of_speech;
        posElem.style.display = 'inline-block';
    }
    
    const synElem = document.getElementById('synonyms');
    const synSection = document.getElementById('synonymsSection');
    if (synElem && synSection && word.synonyms && word.synonyms.length > 0) {
        synElem.innerHTML = word.synonyms.map(x => `<span class="syn-ant-tag">${x}</span>`).join('');
        synSection.style.display = 'block';
    }
    
    const antElem = document.getElementById('antonyms');
    const antSection = document.getElementById('antonymsSection');
    if (antElem && antSection && word.antonyms && word.antonyms.length > 0) {
        antElem.innerHTML = word.antonyms.map(x => `<span class="syn-ant-tag antonym">${x}</span>`).join('');
        antSection.style.display = 'block';
    }
    
    const statsElem = document.getElementById('stats');
    if (statsElem) {
        statsElem.innerHTML = `<div class="stat-item">👁️ ${word.views || 0} views</div>`;
    }
    
    // Update view count
    await sb.from('words').update({ views: (word.views || 0) + 1 }).eq('id', word.id);
}

// ============================================
// PREVIOUS WORDS
// ============================================

async function loadPreviousWords() {
    console.log('📚 Loading previous words...');
    
    const today = getLocalDate();
    const { data: words } = await sb
        .from('words')
        .select('*')
        .lt('scheduled_for', today)
        .order('scheduled_for', { ascending: false })
        .limit(6);
    
    const container = document.getElementById('previousWords');
    if (!container) return;
    
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

// ============================================
// TRENDING WORDS
// ============================================

async function loadTrendingWords() {
    console.log('🔥 Loading trending words...');
    
    // Weekly trending
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    
    const { data: weeklyWords } = await sb
        .from('words')
        .select('*')
        .gte('scheduled_for', weekAgo.toISOString().split('T')[0])
        .order('views', { ascending: false })
        .limit(5);
    
    const weeklyContainer = document.getElementById('weeklyTrending');
    if (weeklyContainer) {
        if (weeklyWords && weeklyWords.length > 0) {
            weeklyContainer.innerHTML = weeklyWords.map((w, i) => `
                <div class="trending-item">
                    <div class="trending-rank">#${i + 1}</div>
                    <div class="trending-content">
                        <div class="trending-word">${w.word}</div>
                        <div class="trending-stats">👁️ ${w.views || 0} views</div>
                    </div>
                </div>
            `).join('');
        } else {
            weeklyContainer.innerHTML = '<p style="text-align: center; opacity: 0.6;">No data yet</p>';
        }
    }
    
    // Monthly trending
    const monthAgo = new Date();
    monthAgo.setDate(monthAgo.getDate() - 30);
    
    const { data: monthlyWords } = await sb
        .from('words')
        .select('*')
        .gte('scheduled_for', monthAgo.toISOString().split('T')[0])
        .order('views', { ascending: false })
        .limit(5);
    
    const monthlyContainer = document.getElementById('monthlyTrending');
    if (monthlyContainer) {
        if (monthlyWords && monthlyWords.length > 0) {
            monthlyContainer.innerHTML = monthlyWords.map((w, i) => `
                <div class="trending-item">
                    <div class="trending-rank">#${i + 1}</div>
                    <div class="trending-content">
                        <div class="trending-word">${w.word}</div>
                        <div class="trending-stats">👁️ ${w.views || 0} views</div>
                    </div>
                </div>
            `).join('');
        } else {
            monthlyContainer.innerHTML = '<p style="text-align: center; opacity: 0.6;">No data yet</p>';
        }
    }
}

// Global function for trending tabs
window.switchTrending = function(period) {
    document.querySelectorAll('.trending-tab').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.trending-list').forEach(list => list.classList.remove('active'));
    event.target.classList.add('active');
    document.getElementById(period === 'week' ? 'trendingWeek' : 'trendingMonth').classList.add('active');
};

// ============================================
// SEARCH FUNCTIONALITY
// ============================================

let searchTimeout;
const searchBar = document.getElementById('searchBar');
if (searchBar) {
    searchBar.addEventListener('input', (e) => {
        const query = e.target.value.trim();
        clearTimeout(searchTimeout);
        
        if (query.length < 2) {
            document.getElementById('searchResults').style.display = 'none';
            return;
        }
        
        searchTimeout = setTimeout(() => searchWords(query), 300);
    });
}

async function searchWords(query) {
    console.log('🔍 Searching for:', query);
    
    const { data: words } = await sb
        .from('words')
        .select('*')
        .or(`word.ilike.%${query}%,meaning.ilike.%${query}%`);

    const resultsDiv = document.getElementById('searchResults');
    if (!resultsDiv) return;
    
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

// ============================================
// NEWSLETTER SUBSCRIPTION
// ============================================

const subscribeForm = document.getElementById('subscribeForm');
if (subscribeForm) {
    subscribeForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = document.getElementById('subscribeEmail').value.trim();
        const statusDiv = document.getElementById('subscribeStatus');

        try {
            const { error } = await sb.from('subscribers').insert({ email });
            
            if (error) {
                if (error.code === '23505') {
                    statusDiv.textContent = "You're already subscribed!";
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
            console.error('Subscribe error:', error);
            statusDiv.textContent = '❌ Error';
            statusDiv.style.color = '#f44336';
        }
    });
}

// ============================================
// SUGGESTION FORM
// ============================================

const suggestionForm = document.getElementById('suggestionForm');
if (suggestionForm) {
    suggestionForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const name = document.getElementById('suggestionName').value.trim() || 'Anonymous';
        const email = document.getElementById('suggestionEmail').value.trim() || 'Not provided';
        const message = document.getElementById('suggestionMessage').value.trim();
        const statusDiv = document.getElementById('suggestionStatus');
        
        console.log('Suggestion from:', name, email);
        console.log('Message:', message);
        
        statusDiv.textContent = '✅ Thank you! Your suggestion has been received.';
        statusDiv.style.display = 'block';
        statusDiv.style.color = '#4CAF50';
        suggestionForm.reset();
        
        setTimeout(() => {
            statusDiv.style.display = 'none';
        }, 5000);
    });
}

// ============================================
// TIMEZONE DISPLAY
// ============================================

const tzElem = document.getElementById('timezoneInfo');
if (tzElem) {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    tzElem.textContent = '🌍 ' + tz;
}

// ============================================
// INITIALIZE PAGE
// ============================================

async function initializePage() {
    await loadStats();
    await loadWord();
    await loadPreviousWords();
    await loadTrendingWords();
    console.log('✅ Page loaded!');
}

initializePage();