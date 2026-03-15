console.log('🚀 Admin Dashboard Loading...');

// Initialize Supabase
const sb = window.supabase.createClient(
    "https://qzatavslhtkioivemwlk.supabase.co",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF6YXRhdnNsaHRraW9pdmVtd2xrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA1MzIyMTYsImV4cCI6MjA4NjEwODIxNn0.LaNyj8T6VYGMMbuyX-Fg_6Fm6yIhPLTW0enYd6sNdGE"
);

let isEditing = false;
let currentFilter = 'all';
let currentSort = 'date-desc';
let selectedMonth = '';
let selectedYear = '';

// ============================================
// AUTHENTICATION
// ============================================

async function checkAuth() {
    const { data: { session } } = await sb.auth.getSession();
    
    if (!session) {
        document.getElementById('notLoggedIn').style.display = 'block';
        document.getElementById('adminPanel').style.display = 'none';
        return false;
    }
    
    document.getElementById('notLoggedIn').style.display = 'none';
    document.getElementById('adminPanel').style.display = 'block';
    document.getElementById('userEmail').textContent = session.user.email;
    return true;
}

// Logout
document.getElementById('logoutBtn').addEventListener('click', async function() {
    await sb.auth.signOut();
    window.location.href = 'login.html';
});

// ============================================
// NAVIGATION
// ============================================

document.querySelectorAll('.sidebar .nav-link').forEach(link => {
    link.addEventListener('click', function(e) {
        e.preventDefault();
        
        // Remove active class from all links
        document.querySelectorAll('.sidebar .nav-link').forEach(l => l.classList.remove('active'));
        this.classList.add('active');
        
        // Hide all sections
        document.querySelectorAll('.content-section').forEach(s => s.style.display = 'none');
        
        // Show selected section
        const section = this.dataset.section;
        document.getElementById(section + 'Section').style.display = 'block';
        
        // Load data for section
        if (section === 'dashboard') {
            loadDashboard();
        } else if (section === 'words') {
            loadWords();
        }
    });
});

// ============================================
// POPULATE YEAR FILTER
// ============================================

function populateYearFilter() {
    const yearSelect = document.getElementById('yearFilter');
    const currentYear = new Date().getFullYear();
    
    const allOption = document.createElement('option');
    allOption.value = '';
    allOption.textContent = 'All Years';
    yearSelect.appendChild(allOption);
    
    for (let year = currentYear - 2; year <= currentYear + 2; year++) {
        const option = document.createElement('option');
        option.value = year;
        option.textContent = year;
        yearSelect.appendChild(option);
    }
}

// ============================================
// LOAD STATISTICS
// ============================================

async function loadStats() {
    try {
        const { data: words } = await sb.from('words').select('id, views');
        const wordCount = words ? words.length : 0;
        const totalViews = words ? words.reduce((sum, w) => sum + (w.views || 0), 0) : 0;
        
        document.getElementById('totalWords').textContent = wordCount;
        document.getElementById('totalViews').textContent = totalViews;
        
        const { data: subs } = await sb.from('subscribers').select('id');
        document.getElementById('totalSubscribers').textContent = subs ? subs.length : 0;
        
    } catch (error) {
        console.error('Stats error:', error);
    }
}

// ============================================
// DASHBOARD
// ============================================

async function loadDashboard() {
    await loadStats();
    
    // Load recent 5 words
    try {
        const { data: words } = await sb
            .from('words')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(5);
        
        const container = document.getElementById('recentWords');
        
        if (!words || words.length === 0) {
            container.innerHTML = '<p class="text-muted">No words yet</p>';
            return;
        }
        
        container.innerHTML = `
            <div class="list-group">
                ${words.map(w => `
                    <div class="list-group-item">
                        <div class="d-flex justify-content-between align-items-start">
                            <div>
                                <h6 class="mb-1">${w.word}</h6>
                                <p class="mb-1 text-muted small">${w.meaning.substring(0, 80)}...</p>
                                <small class="text-muted">
                                    <i class="bi bi-calendar"></i> ${new Date(w.scheduled_for).toLocaleDateString()}
                                </small>
                            </div>
                            <span class="badge bg-primary">${w.views || 0} views</span>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    } catch (error) {
        console.error('Recent words error:', error);
    }
}

// ============================================
// DICTIONARY APIs - MULTIPLE SOURCES
// ============================================

const DICTIONARY_APIS = [
    {
        name: 'Free Dictionary API',
        url: (word) => `https://api.dictionaryapi.dev/api/v2/entries/en/${word}`,
        parse: parseFreeDict
    },
    {
        name: 'Merriam-Webster (Free)',
        url: (word) => `https://www.dictionaryapi.com/api/v3/references/collegiate/json/${word}?key=YOUR_KEY_HERE`,
        parse: parseMerriamWebster
    },
    {
        name: 'WordsAPI',
        url: (word) => `https://wordsapiv1.p.rapidapi.com/words/${word}`,
        headers: { 'X-RapidAPI-Key': 'YOUR_KEY_HERE' },
        parse: parseWordsAPI
    }
];

function parseFreeDict(data) {
    if (!data || !data[0]) return null;
    
    const entry = data[0];
    const result = {
        phonetic: '',
        pronunciation: '',
        part_of_speech: '',
        meaning: '',
        synonyms: new Set(),
        antonyms: new Set()
    };
    
    // Phonetic
    if (entry.phonetic) {
        result.phonetic = entry.phonetic;
    } else if (entry.phonetics && entry.phonetics[0]) {
        result.phonetic = entry.phonetics[0].text || '';
    }
    
    // Pronunciation
    if (result.phonetic) {
        result.pronunciation = result.phonetic
            .replace(/[/[\]]/g, '')
            .replace(/ˈ/g, '-')
            .replace(/ˌ/g, '')
            .replace(/ː/g, '')
            .replace(/ə/g, 'uh')
            .replace(/θ/g, 'th')
            .replace(/ð/g, 'th')
            .replace(/ʃ/g, 'sh')
            .replace(/ʒ/g, 'zh')
            .replace(/ŋ/g, 'ng')
            .trim();
    }
    
    // Meanings
    if (entry.meanings && entry.meanings[0]) {
        const firstMeaning = entry.meanings[0];
        result.part_of_speech = firstMeaning.partOfSpeech || '';
        
        if (firstMeaning.definitions && firstMeaning.definitions[0]) {
            result.meaning = firstMeaning.definitions[0].definition;
        }
        
        // Collect synonyms/antonyms
        entry.meanings.forEach(meaning => {
            if (meaning.synonyms) meaning.synonyms.forEach(s => result.synonyms.add(s));
            if (meaning.antonyms) meaning.antonyms.forEach(a => result.antonyms.add(a));
            
            if (meaning.definitions) {
                meaning.definitions.forEach(def => {
                    if (def.synonyms) def.synonyms.forEach(s => result.synonyms.add(s));
                    if (def.antonyms) def.antonyms.forEach(a => result.antonyms.add(a));
                });
            }
        });
    }
    
    return result;
}

function parseMerriamWebster(data) {
    // Merriam-Webster Collegiate Dictionary API response format
    if (!data || !data[0]) return null;
    
    const entry = data[0];
    const result = {
        phonetic: '',
        pronunciation: '',
        part_of_speech: '',
        meaning: '',
        synonyms: new Set(),
        antonyms: new Set()
    };
    
    // Get phonetic information
    if (entry.hw) {
        result.phonetic = entry.hw;
    }
    
    // Get pronunciation
    if (entry.prs && entry.prs[0]) {
        const pr = entry.prs[0];
        if (pr.mw) {
            result.pronunciation = pr.mw;
        }
        if (pr.sound && pr.sound.audio) {
            result.pronunciation += ` (${pr.sound.audio})`;
        }
    }
    
    // Get first definition
    if (entry.def && entry.def[0] && entry.def[0].sseq) {
        const sseq = entry.def[0].sseq;
        for (const senseGroup of sseq) {
            for (const sense of senseGroup) {
                if (sense[0] === 'sense' && sense[1]) {
                    const senseData = sense[1];
                    if (senseData.dt) {
                        for (const dt of senseData.dt) {
                            if (dt[0] === 'text') {
                                result.meaning = dt[1];
                                break;
                            }
                        }
                    }
                    if (senseData.syns) {
                        for (const synGroup of senseData.syns) {
                            for (const syn of synGroup) {
                                if (syn[0] === 'syn') {
                                    result.synonyms.add(syn[1]);
                                }
                            }
                        }
                    }
                    if (senseData.ant) {
                        for (const antGroup of senseData.ant) {
                            for (const ant of antGroup) {
                                if (ant[0] === 'ant') {
                                    result.antonyms.add(ant[1]);
                                }
                            }
                        }
                    }
                    if (senseData.fl) {
                        result.part_of_speech = senseData.fl;
                    }
                    break;
                }
            }
            if (result.meaning) break;
        }
    }
    
    return result;
}

function parseWordsAPI(data) {
    // WordsAPI response format
    if (!data || !data.word) return null;
    
    const result = {
        phonetic: data.phonetic || '',
        pronunciation: '',
        part_of_speech: '',
        meaning: '',
        synonyms: new Set(),
        antonyms: new Set()
    };
    
    // Get pronunciation from phonetics array
    if (data.phonetics && data.phonetics.length > 0) {
        for (const ph of data.phonetics) {
            if (ph.text) {
                result.pronunciation = ph.text;
                break;
            }
        }
    }
    
    // Get meanings
    if (data.meanings && data.meanings.length > 0) {
        const firstMeaning = data.meanings[0];
        result.part_of_speech = firstMeaning.partOfSpeech || '';
        
        // Get first definition
        if (firstMeaning.definitions && firstMeaning.definitions.length > 0) {
            result.meaning = firstMeaning.definitions[0].definition || '';
            
            // Get synonyms from definition
            if (firstMeaning.definitions[0].synonyms) {
                firstMeaning.definitions[0].synonyms.forEach(s => result.synonyms.add(s));
            }
            
            // Get antonyms from definition
            if (firstMeaning.definitions[0].antonyms) {
                firstMeaning.definitions[0].antonyms.forEach(a => result.antonyms.add(a));
            }
        }
        
        // Get synonyms from meaning level
        if (firstMeaning.synonyms) {
            firstMeaning.synonyms.forEach(s => result.synonyms.add(s));
        }
        
        // Get antonyms from meaning level
        if (firstMeaning.antonyms) {
            firstMeaning.antonyms.forEach(a => result.antonyms.add(a));
        }
    }
    
    // Get top-level synonyms
    if (data.synonyms) {
        data.synonyms.forEach(s => result.synonyms.add(s));
    }
    
    // Get top-level antonyms
    if (data.antonyms) {
        data.antonyms.forEach(a => result.antonyms.add(a));
    }
    
    return result;
}

// DataMuse API for synonyms/antonyms
async function fetchDataMuse(word) {
    const result = { synonyms: [], antonyms: [] };
    
    try {
        const synResponse = await fetch(`https://api.datamuse.com/words?rel_syn=${word}&max=10`);
        const synData = await synResponse.json();
        result.synonyms = synData.map(s => s.word);
    } catch (e) {
        console.log('DataMuse synonyms failed');
    }
    
    try {
        const antResponse = await fetch(`https://api.datamuse.com/words?rel_ant=${word}&max=10`);
        const antData = await antResponse.json();
        result.antonyms = antData.map(a => a.word);
    } catch (e) {
        console.log('DataMuse antonyms failed');
    }
    
    return result;
}

// Enhanced auto-fetch with multiple sources
async function autoFetchWord(word) {
    let result = null;
    
    // Try Free Dictionary API first
    try {
        const response = await fetch(DICTIONARY_APIS[0].url(word));
        if (response.ok) {
            const data = await response.json();
            result = parseFreeDict(data);
        }
    } catch (e) {
        console.log('Free Dictionary failed, trying alternatives...');
    }
    
    // If no synonyms/antonyms, try DataMuse
    if (result) {
        if (result.synonyms.size === 0 || result.antonyms.size === 0) {
            const datamuse = await fetchDataMuse(word);
            if (datamuse.synonyms.length > 0) {
                datamuse.synonyms.forEach(s => result.synonyms.add(s));
            }
            if (datamuse.antonyms.length > 0) {
                datamuse.antonyms.forEach(a => result.antonyms.add(a));
            }
        }
    } else {
        // If everything failed, at least try DataMuse
        result = {
            phonetic: '',
            pronunciation: word.toLowerCase(),
            part_of_speech: '',
            meaning: '',
            synonyms: new Set(),
            antonyms: new Set()
        };
        
        const datamuse = await fetchDataMuse(word);
        datamuse.synonyms.forEach(s => result.synonyms.add(s));
        datamuse.antonyms.forEach(a => result.antonyms.add(a));
    }
    
    return result;
}

// ============================================
// WORD FORM
// ============================================

// Duplicate check
document.getElementById('word').addEventListener('blur', async function() {
    const wordInput = this.value.trim().toLowerCase();
    const editId = document.getElementById('editId').value;
    const warningDiv = document.getElementById('duplicateWarning');
    
    if (!wordInput) {
        warningDiv.style.display = 'none';
        return;
    }
    
    try {
        const { data: existing } = await sb
            .from('words')
            .select('id, word')
            .ilike('word', wordInput)
            .limit(1);
        
        if (existing && existing.length > 0 && existing[0].id !== editId) {
            warningDiv.style.display = 'block';
        } else {
            warningDiv.style.display = 'none';
        }
    } catch (error) {
        console.error('Duplicate check error:', error);
    }
});

// Auto-fetch button
document.getElementById('autoFetchBtn').addEventListener('click', async function() {
    const wordInput = document.getElementById('word').value.trim();
    const fetchStatus = document.getElementById('fetchStatus');
    
    if (!wordInput) {
        fetchStatus.innerHTML = '<div class="alert alert-danger">⚠️ Enter a word first</div>';
        return;
    }
    
    fetchStatus.innerHTML = '<div class="alert alert-info"><div class="spinner-border spinner-border-sm me-2"></div>Fetching from multiple sources...</div>';
    
    try {
        const result = await autoFetchWord(wordInput);
        
        if (result.phonetic) document.getElementById('phonetic').value = result.phonetic;
        if (result.pronunciation) document.getElementById('pronunciation').value = result.pronunciation;
        if (result.part_of_speech) document.getElementById('partOfSpeech').value = result.part_of_speech;
        if (result.meaning) document.getElementById('meaning').value = result.meaning;
        
        if (result.synonyms.size > 0) {
            document.getElementById('synonyms').value = Array.from(result.synonyms).slice(0, 10).join(', ');
        }
        
        if (result.antonyms.size > 0) {
            document.getElementById('antonyms').value = Array.from(result.antonyms).slice(0, 10).join(', ');
        }
        
        fetchStatus.innerHTML = `<div class="alert alert-success">✅ Loaded! Found: ${result.synonyms.size} synonyms, ${result.antonyms.size} antonyms</div>`;
        setTimeout(() => fetchStatus.innerHTML = '', 5000);
        
    } catch (error) {
        fetchStatus.innerHTML = '<div class="alert alert-warning">⚠️ Could not fetch. Fill manually.</div>';
    }
});

// Form submit
document.getElementById('wordForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const submitBtn = document.getElementById('submitBtn');
    const originalText = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Saving...';
    
    try {
        const wordData = {
            word: document.getElementById('word').value.trim(),
            meaning: document.getElementById('meaning').value.trim(),
            scheduled_for: document.getElementById('scheduled').value,
            phonetic: document.getElementById('phonetic').value.trim() || null,
            pronunciation: document.getElementById('pronunciation').value.trim() || null,
            part_of_speech: document.getElementById('partOfSpeech').value || null,
            synonyms: document.getElementById('synonyms').value.trim() 
                ? document.getElementById('synonyms').value.split(',').map(x => x.trim()).filter(x => x)
                : null,
            antonyms: document.getElementById('antonyms').value.trim() 
                ? document.getElementById('antonyms').value.split(',').map(x => x.trim()).filter(x => x)
                : null
        };
        
        const editId = document.getElementById('editId').value;
        let error;
        
        if (isEditing && editId) {
            ({ error } = await sb.from('words').update(wordData).eq('id', editId));
        } else {
            ({ error } = await sb.from('words').insert(wordData));
        }
        
        if (error) throw error;
        
        const msg = document.getElementById('msg');
        msg.className = 'alert alert-success';
        msg.innerHTML = `<i class="bi bi-check-circle"></i> ${isEditing ? 'Word updated!' : 'Word added!'}`;
        msg.style.display = 'block';
        
        // Reset form
        document.getElementById('word').value = '';
        document.getElementById('meaning').value = '';
        document.getElementById('phonetic').value = '';
        document.getElementById('pronunciation').value = '';
        document.getElementById('partOfSpeech').value = '';
        document.getElementById('synonyms').value = '';
        document.getElementById('antonyms').value = '';
        document.getElementById('scheduled').valueAsDate = new Date();
        document.getElementById('duplicateWarning').style.display = 'none';
        
        cancelEdit();
        loadWords();
        loadStats();
        
        setTimeout(() => msg.style.display = 'none', 3000);
        
    } catch (error) {
        const msg = document.getElementById('msg');
        msg.className = 'alert alert-danger';
        msg.innerHTML = `<i class="bi bi-x-circle"></i> ${error.message}`;
        msg.style.display = 'block';
    }
    
    submitBtn.disabled = false;
    submitBtn.innerHTML = originalText;
});

// Edit word
window.editWord = function(id) {
    sb.from('words').select('*').eq('id', id).single()
        .then(({ data }) => {
            isEditing = true;
            document.getElementById('formTitle').innerHTML = '<i class="bi bi-pencil"></i> Edit Word';
            document.getElementById('editId').value = data.id;
            document.getElementById('word').value = data.word;
            document.getElementById('meaning').value = data.meaning;
            document.getElementById('scheduled').value = data.scheduled_for;
            document.getElementById('phonetic').value = data.phonetic || '';
            document.getElementById('pronunciation').value = data.pronunciation || '';
            document.getElementById('partOfSpeech').value = data.part_of_speech || '';
            document.getElementById('synonyms').value = data.synonyms ? data.synonyms.join(', ') : '';
            document.getElementById('antonyms').value = data.antonyms ? data.antonyms.join(', ') : '';
            document.getElementById('submitBtn').innerHTML = '<i class="bi bi-check-circle"></i> Update Word';
            document.getElementById('cancelBtn').style.display = 'inline-block';
            document.getElementById('duplicateWarning').style.display = 'none';
            window.scrollTo(0, 0);
        });
};

// Cancel edit
document.getElementById('cancelBtn').addEventListener('click', cancelEdit);

function cancelEdit() {
    isEditing = false;
    document.getElementById('formTitle').innerHTML = '<i class="bi bi-plus-circle"></i> Add New Word';
    document.getElementById('editId').value = '';
    document.getElementById('word').value = '';
    document.getElementById('meaning').value = '';
    document.getElementById('phonetic').value = '';
    document.getElementById('pronunciation').value = '';
    document.getElementById('partOfSpeech').value = '';
    document.getElementById('synonyms').value = '';
    document.getElementById('antonyms').value = '';
    document.getElementById('scheduled').valueAsDate = new Date();
    document.getElementById('submitBtn').innerHTML = '<i class="bi bi-check-circle"></i> Add Word';
    document.getElementById('cancelBtn').style.display = 'none';
    document.getElementById('duplicateWarning').style.display = 'none';
}

// Delete word
window.deleteWord = async (id) => {
    if (!confirm('Delete this word?')) return;
    try {
        const {error} = await sb.from('words').delete().eq('id', id);
        if (error) throw error;
        loadWords();
        loadStats();
    } catch (error) {
        alert('Delete failed: ' + error.message);
    }
};

// ============================================
// FILTERS
// ============================================

document.getElementById('quickFilter').addEventListener('change', function() {
    currentFilter = this.value;
    if (currentFilter !== 'all') {
        document.getElementById('monthFilter').value = '';
        document.getElementById('yearFilter').value = '';
        selectedMonth = '';
        selectedYear = '';
    }
    loadWords();
});

document.getElementById('monthFilter').addEventListener('change', function() {
    selectedMonth = this.value;
    currentFilter = 'all';
    document.getElementById('quickFilter').value = 'all';
    loadWords();
});

document.getElementById('yearFilter').addEventListener('change', function() {
    selectedYear = this.value;
    currentFilter = 'all';
    document.getElementById('quickFilter').value = 'all';
    loadWords();
});

document.getElementById('sortSelect').addEventListener('change', function() {
    currentSort = this.value;
    loadWords();
});

document.getElementById('clearFilters').addEventListener('click', function() {
    currentFilter = 'all';
    selectedMonth = '';
    selectedYear = '';
    currentSort = 'date-desc';
    document.getElementById('quickFilter').value = 'all';
    document.getElementById('monthFilter').value = '';
    document.getElementById('yearFilter').value = '';
    document.getElementById('sortSelect').value = 'date-desc';
    loadWords();
});

// ============================================
// LOAD WORDS
// ============================================

async function loadWords() {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        let query = sb.from('words').select('*');
        
        // Apply filters
        if (currentFilter === 'today') {
            query = query.eq('scheduled_for', today.toISOString().split('T')[0]);
        } else if (currentFilter === 'week') {
            const weekAgo = new Date(today);
            weekAgo.setDate(today.getDate() - 7);
            const weekFromNow = new Date(today);
            weekFromNow.setDate(today.getDate() + 7);
            query = query.gte('scheduled_for', weekAgo.toISOString().split('T')[0]).lte('scheduled_for', weekFromNow.toISOString().split('T')[0]);
        } else if (currentFilter === 'month') {
            const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
            const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);
            query = query.gte('scheduled_for', monthStart.toISOString().split('T')[0]).lte('scheduled_for', monthEnd.toISOString().split('T')[0]);
        } else if (currentFilter === 'year') {
            const yearStart = new Date(today.getFullYear(), 0, 1);
            const yearEnd = new Date(today.getFullYear(), 11, 31);
            query = query.gte('scheduled_for', yearStart.toISOString().split('T')[0]).lte('scheduled_for', yearEnd.toISOString().split('T')[0]);
        }
        
        if (selectedMonth && selectedYear) {
            const monthStart = new Date(selectedYear, selectedMonth - 1, 1);
            const monthEnd = new Date(selectedYear, selectedMonth, 0);
            query = query.gte('scheduled_for', monthStart.toISOString().split('T')[0]).lte('scheduled_for', monthEnd.toISOString().split('T')[0]);
        } else if (selectedMonth) {
            const currentYear = today.getFullYear();
            const monthStart = new Date(currentYear, selectedMonth - 1, 1);
            const monthEnd = new Date(currentYear, selectedMonth, 0);
            query = query.gte('scheduled_for', monthStart.toISOString().split('T')[0]).lte('scheduled_for', monthEnd.toISOString().split('T')[0]);
        } else if (selectedYear) {
            const yearStart = new Date(selectedYear, 0, 1);
            const yearEnd = new Date(selectedYear, 11, 31);
            query = query.gte('scheduled_for', yearStart.toISOString().split('T')[0]).lte('scheduled_for', yearEnd.toISOString().split('T')[0]);
        }
        
        const {data: allWords, error} = await query;
        if (error) throw error;
        
        let data = allWords || [];
        
        // Sort
        if (currentSort === 'date-desc') {
            data.sort((a, b) => new Date(b.scheduled_for) - new Date(a.scheduled_for));
        } else if (currentSort === 'date-asc') {
            data.sort((a, b) => new Date(a.scheduled_for) - new Date(b.scheduled_for));
        } else if (currentSort === 'alpha-asc') {
            data.sort((a, b) => a.word.localeCompare(b.word));
        } else if (currentSort === 'alpha-desc') {
            data.sort((a, b) => b.word.localeCompare(a.word));
        } else if (currentSort === 'views-desc') {
            data.sort((a, b) => (b.views || 0) - (a.views || 0));
        }
        
        document.getElementById('filterCount').textContent = `${data.length} words`;
        
        const tbody = document.getElementById('wordsTableBody');
        
        if (!data || data.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" class="text-center text-muted">No words found</td></tr>';
            return;
        }
        
        const todayStr = today.toISOString().split('T')[0];
        
        tbody.innerHTML = data.map(w => {
            const isToday = w.scheduled_for === todayStr;
            return `<tr style="${isToday ? 'background: #fff3cd;' : ''}">
                <td>
                    ${w.scheduled_for || 'N/A'}
                    ${isToday ? '<br><span class="today-badge">TODAY</span>' : ''}
                </td>
                <td>
                    <strong>${w.word}</strong>
                    ${w.pronunciation ? `<br><small class="text-muted">${w.pronunciation}</small>` : ''}
                </td>
                <td>
                    ${w.part_of_speech || '-'}
                    ${w.phonetic ? `<br><small class="text-muted">${w.phonetic}</small>` : ''}
                </td>
                <td><small>${w.meaning.substring(0, 60)}...</small></td>
                <td><span class="badge bg-primary">${w.views || 0}</span></td>
                <td>
                    <button class="btn btn-sm btn-outline-primary" onclick="editWord('${w.id}')">
                        <i class="bi bi-pencil"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger" onclick="deleteWord('${w.id}')">
                        <i class="bi bi-trash"></i>
                    </button>
                </td>
            </tr>`;
        }).join('');
        
    } catch (error) {
        console.error('Load error:', error);
    }
}

// ============================================
// BULK UPLOAD - CSV
// ============================================

document.getElementById('downloadTemplate').addEventListener('click', function(e) {
    e.preventDefault();
    
    const csv = `word,meaning,scheduled_for,phonetic,pronunciation,part_of_speech,synonyms,antonyms
serendipity,Finding something good without looking for it,2026-04-01,/ˌserənˈdipədē/,ser-en-dip-i-ty,noun,"luck,fortune,chance","misfortune,bad luck"
ephemeral,Lasting for a very short time,2026-04-02,/əˈfem(ə)rəl/,uh-fem-er-al,adjective,"temporary,fleeting,transient","permanent,lasting"`;
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'word-template.csv';
    a.click();
});

document.getElementById('uploadCsvBtn').addEventListener('click', async function() {
    const fileInput = document.getElementById('csvFile');
    const statusDiv = document.getElementById('csvStatus');
    
    if (!fileInput.files || !fileInput.files[0]) {
        statusDiv.innerHTML = '<div class="alert alert-danger">Please select a CSV file</div>';
        return;
    }
    
    const file = fileInput.files[0];
    const reader = new FileReader();
    
    reader.onload = async function(e) {
        try {
            const text = e.target.result;
            const lines = text.split('\n').filter(l => l.trim());
            
            if (lines.length < 2) {
                statusDiv.innerHTML = '<div class="alert alert-danger">CSV is empty</div>';
                return;
            }
            
            const headers = lines[0].split(',').map(h => h.trim());
            const words = [];
            
            for (let i = 1; i < lines.length; i++) {
                const values = lines[i].split(',').map(v => v.trim());
                const wordData = {};
                
                headers.forEach((header, index) => {
                    if (header === 'synonyms' || header === 'antonyms') {
                        wordData[header] = values[index] ? values[index].split(';').map(s => s.trim()) : null;
                    } else {
                        wordData[header] = values[index] || null;
                    }
                });
                
                if (wordData.word && wordData.meaning && wordData.scheduled_for) {
                    words.push(wordData);
                }
            }
            
            if (words.length === 0) {
                statusDiv.innerHTML = '<div class="alert alert-danger">No valid words found in CSV</div>';
                return;
            }
            
            statusDiv.innerHTML = `<div class="alert alert-info"><div class="spinner-border spinner-border-sm me-2"></div>Uploading ${words.length} words...</div>`;
            
            const { error } = await sb.from('words').insert(words);
            
            if (error) throw error;
            
            statusDiv.innerHTML = `<div class="alert alert-success"><i class="bi bi-check-circle"></i> Successfully uploaded ${words.length} words!</div>`;
            fileInput.value = '';
            loadWords();
            loadStats();
            
        } catch (error) {
            statusDiv.innerHTML = `<div class="alert alert-danger"><i class="bi bi-x-circle"></i> Error: ${error.message}</div>`;
        }
    };
    
    reader.readAsText(file);
});

// ============================================
// BULK UPLOAD - 31 WORDS
// ============================================

document.getElementById('bulk31Words').addEventListener('input', function() {
    const lines = this.value.split('\n').filter(l => l.trim());
    document.getElementById('wordCount').textContent = lines.length;
});

document.getElementById('bulkStartDate').valueAsDate = new Date();

document.getElementById('generate31Btn').addEventListener('click', async function() {
    const textarea = document.getElementById('bulk31Words');
    const startDate = document.getElementById('bulkStartDate').value;
    const autoFetch = document.getElementById('autoFetchBulk').checked;
    const statusDiv = document.getElementById('bulk31Status');
    
    const words = textarea.value.split('\n')
        .map(w => w.trim())
        .filter(w => w);
    
    if (words.length !== 31) {
        statusDiv.innerHTML = `<div class="alert alert-danger">Please enter exactly 31 words (you have ${words.length})</div>`;
        return;
    }
    
    if (!startDate) {
        statusDiv.innerHTML = '<div class="alert alert-danger">Please select a start date</div>';
        return;
    }
    
    statusDiv.innerHTML = '<div class="alert alert-info"><div class="spinner-border spinner-border-sm me-2"></div>Processing 31 words...</div>';
    
    const wordsData = [];
    const startDateObj = new Date(startDate);
    
    for (let i = 0; i < words.length; i++) {
        const word = words[i];
        const scheduledDate = new Date(startDateObj);
        scheduledDate.setDate(startDateObj.getDate() + i);
        
        const wordData = {
            word: word,
            scheduled_for: scheduledDate.toISOString().split('T')[0],
            meaning: `Definition of ${word}`,
            phonetic: null,
            pronunciation: null,
            part_of_speech: null,
            synonyms: null,
            antonyms: null
        };
        
        if (autoFetch) {
            try {
                const result = await autoFetchWord(word);
                if (result.meaning) wordData.meaning = result.meaning;
                if (result.phonetic) wordData.phonetic = result.phonetic;
                if (result.pronunciation) wordData.pronunciation = result.pronunciation;
                if (result.part_of_speech) wordData.part_of_speech = result.part_of_speech;
                if (result.synonyms.size > 0) wordData.synonyms = Array.from(result.synonyms).slice(0, 10);
                if (result.antonyms.size > 0) wordData.antonyms = Array.from(result.antonyms).slice(0, 10);
                
                statusDiv.innerHTML = `<div class="alert alert-info"><div class="spinner-border spinner-border-sm me-2"></div>Processing ${i + 1}/31: ${word}</div>`;
            } catch (e) {
                console.log(`Failed to fetch ${word}`);
            }
        }
        
        wordsData.push(wordData);
    }
    
    try {
        const { error } = await sb.from('words').insert(wordsData);
        if (error) throw error;
        
        statusDiv.innerHTML = '<div class="alert alert-success"><i class="bi bi-check-circle"></i> Successfully uploaded 31 words!</div>';
        textarea.value = '';
        document.getElementById('wordCount').textContent = '0';
        loadWords();
        loadStats();
        
    } catch (error) {
        statusDiv.innerHTML = `<div class="alert alert-danger"><i class="bi bi-x-circle"></i> Error: ${error.message}</div>`;
    }
});

// ============================================
// INITIALIZE
// ============================================

document.getElementById('scheduled').valueAsDate = new Date();
populateYearFilter();

checkAuth().then(ok => { 
    if(ok) {
        loadDashboard();
    }
});

console.log('✅ Admin Dashboard Ready');

