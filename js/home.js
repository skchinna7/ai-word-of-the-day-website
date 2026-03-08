console.log('📦 Loading home.js...');

// Wait for config.js to load
if (!window.sb) {
    console.error('❌ Supabase not initialized! Check config.js');
}

async function loadWordCount() {
    console.log('📊 Loading word count...');
    try {
        const { data, error } = await window.sb.from('words').select('id');
        if (error) throw error;
        
        const count = data ? data.length : 0;
        console.log('Word count:', count);
        
        const elem = document.getElementById('totalWords');
        if (elem) {
            elem.textContent = count;
        }
    } catch (error) {
        console.error('Word count error:', error);
        document.getElementById('totalWords').textContent = '?';
    }
}

async function loadTodayWord() {
    console.log('📝 Loading today\'s word...');
    try {
        const today = new Date().toISOString().split('T')[0];
        console.log('Today:', today);
        
        let { data, error } = await window.sb
            .from('words')
            .select('*')
            .eq('scheduled_for', today)
            .limit(1);
        
        if (error) throw error;
        
        if (!data || !data[0]) {
            console.log('No word for today, getting latest...');
            const r = await window.sb
                .from('words')
                .select('*')
                .order('created_at', {ascending: false})
                .limit(1);
            data = r.data;
        }
        
        if (!data || !data[0]) {
            document.getElementById('word').textContent = 'No Words Yet';
            document.getElementById('meaning').textContent = 'Add words in admin panel';
            return;
        }
        
        const word = data[0];
        console.log('Displaying word:', word.word);
        
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
            synElem.innerHTML = word.synonyms.map(s => 
                `<span class="badge bg-success me-1 mb-1">${s}</span>`
            ).join('');
            synSection.style.display = 'block';
        }
        
        const antElem = document.getElementById('antonyms');
        const antSection = document.getElementById('antonymsSection');
        if (antElem && antSection && word.antonyms && word.antonyms.length > 0) {
            antElem.innerHTML = word.antonyms.map(a => 
                `<span class="badge bg-danger me-1 mb-1">${a}</span>`
            ).join('');
            antSection.style.display = 'block';
        }
        
    } catch (error) {
        console.error('Load word error:', error);
        document.getElementById('word').textContent = 'Error Loading';
        document.getElementById('meaning').textContent = error.message;
    }
}

// Timezone
const tzElem = document.getElementById('timezoneInfo');
if (tzElem) {
    tzElem.textContent = '🌍 ' + Intl.DateTimeFormat().resolvedOptions().timeZone;
}

// Initialize
async function init() {
    console.log('🚀 Initializing homepage...');
    await loadWordCount();
    await loadTodayWord();
    console.log('✅ Homepage ready!');
}

// Run when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
