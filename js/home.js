async function loadWordCount() {
    const { data } = await sb.from('words').select('id');
    document.getElementById('totalWords').textContent = data ? data.length : 0;
}

async function loadTodayWord() {
    const today = new Date().toISOString().split('T')[0];
    let { data } = await sb.from('words').select('*').eq('scheduled_for', today).limit(1);
    
    if (!data || !data[0]) {
        const r = await sb.from('words').select('*').order('created_at', {ascending: false}).limit(1);
        data = r.data;
    }
    
    if (!data || !data[0]) {
        document.getElementById('word').textContent = 'No Words Yet';
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
        document.getElementById('synonyms').innerHTML = word.synonyms.map(s => 
            `<span class="badge bg-success me-1">${s}</span>`
        ).join('');
        document.getElementById('synonymsSection').style.display = 'block';
    }
    
    if (word.antonyms && word.antonyms.length > 0) {
        document.getElementById('antonyms').innerHTML = word.antonyms.map(a => 
            `<span class="badge bg-danger me-1">${a}</span>`
        ).join('');
        document.getElementById('antonymsSection').style.display = 'block';
    }
}

document.getElementById('timezoneInfo').textContent = '🌍 ' + Intl.DateTimeFormat().resolvedOptions().timeZone;

loadWordCount();
loadTodayWord();
