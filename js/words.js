// ===== WORD MANAGEMENT =====

let currentWord = null;

// Load today's word
async function loadTodayWord() {
    try {
        const today = getLocalDate();
        console.log('📅 Loading word for:', today);
        
        let { data: words } = await supabase
            .from('words')
            .select('*')
            .eq('scheduled_for', today)
            .limit(1);

        if (!words || words.length === 0) {
            const { data: latest } = await supabase
                .from('words')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(1);
            words = latest;
        }

        if (!words || words.length === 0) {
            showNoWords();
            return;
        }

        currentWord = words[0];
        displayWord(currentWord);
        incrementViewCount(currentWord.id, currentWord.views);

    } catch (error) {
        console.error('Error loading word:', error);
    }
}

// Display word on page
function displayWord(word) {
    document.getElementById('word').textContent = word.word;
    document.getElementById('phonetic').textContent = word.phonetic || '';
    document.getElementById('pronunciation').textContent = word.pronunciation || '';
    
    displayPartOfSpeech(word.part_of_speech);
    document.getElementById('meaning').textContent = word.meaning;
    displaySynonyms(word.synonyms);
    displayAntonyms(word.antonyms);
    displayStats(word);
}

function displayPartOfSpeech(partOfSpeech) {
    const elem = document.getElementById('partOfSpeech');
    if (!elem) return;
    
    if (partOfSpeech) {
        elem.textContent = partOfSpeech;
        elem.style.display = 'inline-block';
    } else {
        elem.style.display = 'none';
    }
}

function displaySynonyms(synonyms) {
    const elem = document.getElementById('synonyms');
    const section = document.getElementById('synonymsSection');
    if (!elem || !section) return;
    
    if (synonyms && synonyms.length > 0) {
        elem.innerHTML = synonyms.map(s => `<span class="syn-ant-tag">${s}</span>`).join('');
        section.style.display = 'block';
    } else {
        section.style.display = 'none';
    }
}

function displayAntonyms(antonyms) {
    const elem = document.getElementById('antonyms');
    const section = document.getElementById('antonymsSection');
    if (!elem || !section) return;
    
    if (antonyms && antonyms.length > 0) {
        elem.innerHTML = antonyms.map(a => `<span class="syn-ant-tag antonym">${a}</span>`).join('');
        section.style.display = 'block';
    } else {
        section.style.display = 'none';
    }
}

function displayStats(word) {
    document.getElementById('stats').innerHTML = `
        <div class="stat-item">👁️ ${word.views || 0} views</div>
        <div class="stat-item">❤️ ${word.favorites_count || 0} favorites</div>
        <div class="stat-item">💬 ${word.comments_count || 0} comments</div>
    `;
}

function showNoWords() {
    document.getElementById('word').textContent = 'No Words Yet';
    document.getElementById('meaning').textContent = 'Check back soon!';
}

async function incrementViewCount(wordId, currentViews) {
    try {
        await supabase
            .from('words')
            .update({ views: (currentViews || 0) + 1 })
            .eq('id', wordId);
    } catch (error) {
        console.error('Error updating views:', error);
    }
}

// Load previous words
async function loadPreviousWords() {
    try {
        const today = getLocalDate();
        const { data: words } = await supabase
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
    } catch (error) {
        console.error('Error loading previous words:', error);
    }
}