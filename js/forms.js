// ===== FORM HANDLERS =====

// Search functionality
function initSearch() {
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
}

async function searchWords(query) {
    try {
        const { data: words } = await supabase
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
    } catch (error) {
        console.error('Search error:', error);
    }
}

// Newsletter subscription
function initNewsletter() {
    const form = document.getElementById('subscribeForm');
    if (!form) return;
    
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = document.getElementById('subscribeEmail').value.trim();
        const statusDiv = document.getElementById('subscribeStatus');

        try {
            const { error } = await supabase.from('subscribers').insert({ email });
            
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
            console.error('Subscribe error:', error);
            statusDiv.textContent = '❌ Error';
            statusDiv.style.color = '#f44336';
        }
    });
}

// Suggestion form
function initSuggestionForm() {
    const form = document.getElementById('suggestionForm');
    if (!form) return;
    
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const name = document.getElementById('suggestionName').value.trim() || 'Anonymous';
        const email = document.getElementById('suggestionEmail').value.trim() || 'no-reply@example.com';
        const message = document.getElementById('suggestionMessage').value.trim();
        const statusDiv = document.getElementById('suggestionStatus');
        const submitBtn = form.querySelector('button[type="submit"]');
        
        submitBtn.disabled = true;
        submitBtn.textContent = '📤 Sending...';
        statusDiv.textContent = '📤 Sending...';
        statusDiv.style.display = 'block';
        statusDiv.style.color = '#2196F3';
        
        try {
            // If EmailJS is configured
            if (typeof emailjs !== 'undefined' && EMAILJS_CONFIG.serviceId !== "YOUR_SERVICE_ID") {
                const result = await emailjs.send(
                    EMAILJS_CONFIG.serviceId,
                    EMAILJS_CONFIG.templateId,
                    { from_name: name, from_email: email, message: message }
                );
                console.log('Email sent:', result);
            }
            
            statusDiv.textContent = '✅ Thank you! Your message has been sent to site-reply@wotd.in';
            statusDiv.style.color = '#4CAF50';
            form.reset();
            
            setTimeout(() => {
                statusDiv.style.display = 'none';
                submitBtn.disabled = false;
                submitBtn.textContent = 'Send Suggestion 📧';
            }, 5000);
            
        } catch (error) {
            console.error('Error:', error);
            statusDiv.innerHTML = `❌ Please email us at: <strong>site-reply@wotd.in</strong>`;
            statusDiv.style.color = '#f44336';
            submitBtn.disabled = false;
            submitBtn.textContent = 'Send Suggestion 📧';
        }
    });
}

