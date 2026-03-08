console.log('📦 Loading search.js...');

let searchTimeout;

const searchInput = document.getElementById('searchInput');
const searchResults = document.getElementById('searchResults');
const searchStats = document.getElementById('searchStats');

searchInput.addEventListener('input', (e) => {
    const query = e.target.value.trim();
    clearTimeout(searchTimeout);
    
    if (query.length < 2) {
        searchResults.innerHTML = '';
        searchStats.textContent = '';
        return;
    }
    
    searchStats.innerHTML = '<div class="spinner-border spinner-border-sm me-2"></div>Searching...';
    
    searchTimeout = setTimeout(() => performSearch(query), 300);
});

async function performSearch(query) {
    try {
        const { data: words, error } = await window.sb
            .from('words')
            .select('*')
            .or(`word.ilike.%${query}%,meaning.ilike.%${query}%`)
            .order('scheduled_for', { ascending: false });
        
        if (error) throw error;
        
        if (!words || words.length === 0) {
            searchStats.textContent = 'No results found';
            searchResults.innerHTML = `
                <div class="alert alert-warning">
                    <i class="bi bi-exclamation-triangle"></i> No words found matching "${query}"
                </div>
            `;
            return;
        }
        
        searchStats.textContent = `Found ${words.length} word${words.length > 1 ? 's' : ''}`;
        
        searchResults.innerHTML = words.map(word => `
            <div class="card bg-secondary text-white mb-3">
                <div class="card-body">
                    <h4 class="card-title">
                        ${word.word}
                        ${word.phonetic ? `<small class="text-white-50 ms-2">${word.phonetic}</small>` : ''}
                    </h4>
                    ${word.part_of_speech ? `<span class="badge bg-info mb-2">${word.part_of_speech}</span>` : ''}
                    <p class="card-text">${word.meaning}</p>
                    <small class="text-white-50">
                        <i class="bi bi-calendar3"></i> ${new Date(word.scheduled_for).toLocaleDateString()}
                    </small>
                </div>
            </div>
        `).join('');
        
    } catch (error) {
        console.error('Search error:', error);
        searchStats.textContent = 'Search error';
        searchResults.innerHTML = `
            <div class="alert alert-danger">
                <i class="bi bi-x-circle"></i> Error: ${error.message}
            </div>
        `;
    }
}

console.log('✅ Search ready');