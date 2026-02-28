// Main application - loaded THIRD
console.log('📦 Loading app.js...');

const App = {
    // Get supabase client safely
    getSupabase() {
        if (!window.supabaseClient) {
            console.error('❌ Supabase not initialized yet!');
            return null;
        }
        return window.supabaseClient;
    },

    initTheme() {
        const themeToggle = document.getElementById('themeToggle');
        if (!themeToggle) return;
        
        const savedTheme = localStorage.getItem('theme') || 'dark';
        document.body.className = savedTheme;
        if (savedTheme === 'dark') themeToggle.classList.add('active');

        themeToggle.addEventListener('click', () => {
            const isDark = document.body.classList.contains('dark');
            document.body.className = isDark ? 'light' : 'dark';
            themeToggle.classList.toggle('active');
            localStorage.setItem('theme', isDark ? 'light' : 'dark');
        });
    },

    async checkLoginStatus() {
        const supabase = this.getSupabase();
        if (!supabase) return;
        
        try {
            const { data: { session } } = await supabase.auth.getSession();
            const controls = document.getElementById('headerControls');
            if (!controls) return;
            
            if (session && session.user) {
                window.appState.currentUser = session.user;
                const savedTheme = localStorage.getItem('theme') || 'dark';
                
                controls.innerHTML = `
                    <div class="user-badge">
                        <span>👤</span>
                        <span>${session.user.email}</span>
                    </div>
                    <a href="admin.html" class="btn">⚙️ Admin</a>
                    <button class="btn-logout" id="logoutBtn">Logout</button>
                    <div class="theme-toggle ${savedTheme === 'dark' ? 'active' : ''}" id="themeToggleNew"></div>
                    <a href="about.html" class="btn">ℹ️ About</a>
                    <a href="archive.html" class="btn">📚 Archive</a>
                `;
                
                const newThemeToggle = document.getElementById('themeToggleNew');
                if (newThemeToggle) {
                    newThemeToggle.addEventListener('click', () => {
                        const isDark = document.body.classList.contains('dark');
                        document.body.className = isDark ? 'light' : 'dark';
                        newThemeToggle.classList.toggle('active');
                        localStorage.setItem('theme', isDark ? 'light' : 'dark');
                    });
                }
                
                document.getElementById('logoutBtn')?.addEventListener('click', async () => {
                    await supabase.auth.signOut();
                    window.location.reload();
                });
            }
        } catch (err) {
            console.error('Login check error:', err);
        }
    },

    async loadSiteStats() {
        const supabase = this.getSupabase();
        if (!supabase) return;
        
        console.log('📊 Loading statistics...');
        
        try {
            const { count: wordCount } = await supabase
                .from('words')
                .select('id', { count: 'exact', head: true });
            
            const elem1 = document.getElementById('totalWords');
            if (elem1 && wordCount !== null) {
                setTimeout(() => window.AppUtils.animateCount(elem1, 0, wordCount, 1000), 100);
            }
            
            const { data: wordsData } = await supabase.from('words').select('views');
            if (wordsData) {
                const totalViews = wordsData.reduce((sum, w) => sum + (w.views || 0), 0);
                const elem2 = document.getElementById('totalViews');
                if (elem2) {
                    setTimeout(() => window.AppUtils.animateCount(elem2, 0, totalViews, 1500), 300);
                }
            }
            
            const { count: subCount } = await supabase
                .from('subscribers')
                .select('id', { count: 'exact', head: true });
            
            const elem3 = document.getElementById('totalSubscribers');
            if (elem3 && subCount !== null) {
                setTimeout(() => window.AppUtils.animateCount(elem3, 0, subCount, 1200), 500);
            }
            
        } catch (error) {
            console.error('Stats error:', error);
        }
    },

    async loadTodayWord() {
        const supabase = this.getSupabase();
        if (!supabase) return;
        
        try {
            const today = window.AppUtils.getLocalDate();
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
                document.getElementById('word').textContent = 'No Words Yet';
                document.getElementById('meaning').textContent = 'Check back soon!';
                return;
            }

            window.appState.currentWord = words[0];
            this.displayWord(words[0]);

            await supabase
                .from('words')
                .update({ views: (words[0].views || 0) + 1 })
                .eq('id', words[0].id);

        } catch (error) {
            console.error('Error loading word:', error);
        }
    },

    displayWord(word) {
        document.getElementById('word').textContent = word.word;
        document.getElementById('phonetic').textContent = word.phonetic || '';
        document.getElementById('pronunciation').textContent = word.pronunciation || '';
        
        const posElem = document.getElementById('partOfSpeech');
        if (posElem) {
            if (word.part_of_speech) {
                posElem.textContent = word.part_of_speech;
                posElem.style.display = 'inline-block';
            } else {
                posElem.style.display = 'none';
            }
        }
        
        document.getElementById('meaning').textContent = word.meaning;
        
        const synElem = document.getElementById('synonyms');
        const synSection = document.getElementById('synonymsSection');
        if (synElem && synSection) {
            if (word.synonyms && word.synonyms.length > 0) {
                synElem.innerHTML = word.synonyms.map(s => `<span class="syn-ant-tag">${s}</span>`).join('');
                synSection.style.display = 'block';
            } else {
                synSection.style.display = 'none';
            }
        }
        
        const antElem = document.getElementById('antonyms');
        const antSection = document.getElementById('antonymsSection');
        if (antElem && antSection) {
            if (word.antonyms && word.antonyms.length > 0) {
                antElem.innerHTML = word.antonyms.map(a => `<span class="syn-ant-tag antonym">${a}</span>`).join('');
                antSection.style.display = 'block';
            } else {
                antSection.style.display = 'none';
            }
        }
        
        document.getElementById('stats').innerHTML = `
            <div class="stat-item">👁️ ${word.views || 0} views</div>
            <div class="stat-item">❤️ ${word.favorites_count || 0} favorites</div>
            <div class="stat-item">💬 ${word.comments_count || 0} comments</div>
        `;
    },

    async loadPreviousWords() {
        const supabase = this.getSupabase();
        if (!supabase) return;
        
        try {
            const today = window.AppUtils.getLocalDate();
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
            console.error('Error:', error);
        }
    },

    async loadTrendingWords() {
        const supabase = this.getSupabase();
        if (!supabase) return;
        
        try {
            const weekAgo = new Date();
            weekAgo.setDate(weekAgo.getDate() - 7);
            
            const { data: weeklyWords } = await supabase
                .from('words')
                .select('*')
                .gte('scheduled_for', weekAgo.toISOString().split('T')[0])
                .order('views', { ascending: false })
                .limit(5);
            
            const weeklyContainer = document.getElementById('weeklyTrending');
            if (weeklyContainer) {
                weeklyContainer.innerHTML = weeklyWords && weeklyWords.length > 0
                    ? weeklyWords.map((w, i) => `
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
            
            const monthAgo = new Date();
            monthAgo.setDate(monthAgo.getDate() - 30);
            
            const { data: monthlyWords } = await supabase
                .from('words')
                .select('*')
                .gte('scheduled_for', monthAgo.toISOString().split('T')[0])
                .order('views', { ascending: false })
                .limit(5);
            
            const monthlyContainer = document.getElementById('monthlyTrending');
            if (monthlyContainer) {
                monthlyContainer.innerHTML = monthlyWords && monthlyWords.length > 0
                    ? monthlyWords.map((w, i) => `
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
        } catch (error) {
            console.error('Error:', error);
        }
    },

    initSearch() {
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
                
                searchTimeout = setTimeout(() => this.searchWords(query), 300);
            });
        }
    },

    async searchWords(query) {
        const supabase = this.getSupabase();
        if (!supabase) return;
        
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
    },

    initForms() {
        const supabase = this.getSupabase();
        if (!supabase) return;
        
        const subscribeForm = document.getElementById('subscribeForm');
        if (subscribeForm) {
            subscribeForm.addEventListener('submit', async (e) => {
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
                    statusDiv.textContent = '❌ Error';
                    statusDiv.style.color = '#f44336';
                }
            });
        }
        
        const suggestionForm = document.getElementById('suggestionForm');
        if (suggestionForm) {
            suggestionForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const statusDiv = document.getElementById('suggestionStatus');
                statusDiv.textContent = '✅ Thank you!';
                statusDiv.style.display = 'block';
                statusDiv.style.color = '#4CAF50';
                suggestionForm.reset();
                setTimeout(() => statusDiv.style.display = 'none', 5000);
            });
        }
    },

    async initialize() {
        console.log('🚀 Initializing...');
        
        this.initTheme();
        this.initSearch();
        this.initForms();
        
        await this.checkLoginStatus();
        await this.loadSiteStats();
        await this.loadTodayWord();
        await this.loadPreviousWords();
        await this.loadTrendingWords();
        
        window.AppUtils.displayTimezone();
        window.AppUtils.scheduleRefreshAtMidnight();
        
        console.log('✅ Ready!');
    }
};

// Wait for everything to be ready
document.addEventListener('DOMContentLoaded', () => {
    // Wait a bit for Supabase to initialize
    setTimeout(() => {
        App.initialize();
    }, 100);
});

console.log('✅ app.js loaded');