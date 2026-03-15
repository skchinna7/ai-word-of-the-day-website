        console.log('🔧 Admin panel starting...');
        
        const sb = window.supabase.createClient(
            "https://qzatavslhtkioivemwlk.supabase.co",
            "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF6YXRhdnNsaHRraW9pdmVtd2xrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA1MzIyMTYsImV4cCI6MjA4NjEwODIxNn0.LaNyj8T6VYGMMbuyX-Fg_6Fm6yIhPLTW0enYd6sNdGE"
        );
        
        let isEditing = false;
        
        // Check auth
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
        
        // Load stats
        async function loadStats() {
            try {
                // Word count
                const { data: words } = await sb.from('words').select('id, views');
                const wordCount = words ? words.length : 0;
                const totalViews = words ? words.reduce((sum, w) => sum + (w.views || 0), 0) : 0;
                
                document.getElementById('totalWords').textContent = wordCount;
                document.getElementById('totalViews').textContent = totalViews;
                document.getElementById('wordCountAdmin').textContent = wordCount;
                
                // Subscriber count
                const { data: subs } = await sb.from('subscribers').select('id');
                document.getElementById('totalSubscribers').textContent = subs ? subs.length : 0;
                
            } catch (error) {
                console.error('Stats error:', error);
            }
        }
        
        // Auto-fetch
        document.getElementById('autoFetchBtn').addEventListener('click', async function() {
            const wordInput = document.getElementById('word').value.trim();
            const fetchStatus = document.getElementById('fetchStatus');
            
            if (!wordInput) {
                fetchStatus.innerHTML = '<span style="color: #f44336;">⚠️ Enter a word first</span>';
                return;
            }
            
            fetchStatus.innerHTML = '<span style="color: #2196F3;">🔄 Fetching...</span>';
            
            try {
                const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${wordInput}`);
                
                if (!response.ok) throw new Error('Word not found');
                
                const data = await response.json();
                const entry = data[0];
                
                // Phonetic
                if (entry.phonetic) {
                    document.getElementById('phonetic').value = entry.phonetic;
                } else if (entry.phonetics && entry.phonetics[0]) {
                    document.getElementById('phonetic').value = entry.phonetics[0].text || '';
                }
                
                // Pronunciation
                const phoneticVal = document.getElementById('phonetic').value;
                if (phoneticVal) {
                    const simplified = phoneticVal.replace(/[\/\[\]ˈˌː]/g, '').replace(/ /g, '-');
                    document.getElementById('pronunciation').value = simplified;
                }
                
                // Process meanings
                if (entry.meanings && entry.meanings[0]) {
                    const firstMeaning = entry.meanings[0];
                    
                    // Part of speech
                    if (firstMeaning.partOfSpeech) {
                        document.getElementById('partOfSpeech').value = firstMeaning.partOfSpeech;
                    }
                    
                    // Definition
                    if (firstMeaning.definitions && firstMeaning.definitions[0]) {
                        document.getElementById('meaning').value = firstMeaning.definitions[0].definition;
                    }
                    
                    // Collect synonyms/antonyms
                    let synonyms = new Set();
                    let antonyms = new Set();
                    
                    entry.meanings.forEach(meaning => {
                        if (meaning.synonyms) meaning.synonyms.forEach(s => synonyms.add(s));
                        if (meaning.antonyms) meaning.antonyms.forEach(a => antonyms.add(a));
                        
                        if (meaning.definitions) {
                            meaning.definitions.forEach(def => {
                                if (def.synonyms) def.synonyms.forEach(s => synonyms.add(s));
                                if (def.antonyms) def.antonyms.forEach(a => antonyms.add(a));
                            });
                        }
                    });
                    
                    if (synonyms.size > 0) {
                        document.getElementById('synonyms').value = Array.from(synonyms).slice(0, 10).join(', ');
                    }
                    
                    if (antonyms.size > 0) {
                        document.getElementById('antonyms').value = Array.from(antonyms).slice(0, 10).join(', ');
                    }
                }
                
                fetchStatus.innerHTML = '<span style="color: #4CAF50;">✅ Loaded!</span>';
                setTimeout(() => fetchStatus.innerHTML = '', 3000);
                
            } catch (error) {
                fetchStatus.innerHTML = '<span style="color: #ff9800;">⚠️ Could not fetch. Enter manually.</span>';
            }
        });
        
        // Form submit
        document.getElementById('wordForm').addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const submitBtn = document.getElementById('submitBtn');
            submitBtn.disabled = true;
            submitBtn.textContent = isEditing ? 'Updating...' : 'Adding...';
            
            try {
                const wordData = {
                    word: document.getElementById('word').value.trim(),
                    meaning: document.getElementById('meaning').value.trim(),
                    scheduled_for: document.getElementById('scheduled').value,
                    phonetic: document.getElementById('phonetic').value.trim() || null,
                    pronunciation: document.getElementById('pronunciation').value.trim() || null,
                    part_of_speech: document.getElementById('partOfSpeech').value || null,
                    synonyms: document.getElementById('synonyms').value.trim() 
                        ? document.getElementById('synonyms').value.split(',').map(x => x.trim()) 
                        : null,
                    antonyms: document.getElementById('antonyms').value.trim() 
                        ? document.getElementById('antonyms').value.split(',').map(x => x.trim()) 
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
                msg.className = 'message success';
                msg.textContent = isEditing ? '✅ Updated!' : '✅ Added!';
                msg.style.display = 'block';
                
                document.getElementById('wordForm').reset();
                document.getElementById('scheduled').valueAsDate = new Date();
                cancelEdit();
                loadWords();
                loadStats();
                
                setTimeout(() => msg.style.display = 'none', 3000);
                
            } catch (error) {
                const msg = document.getElementById('msg');
                msg.className = 'message error';
                msg.textContent = '❌ ' + error.message;
                msg.style.display = 'block';
            }
            
            submitBtn.disabled = false;
            submitBtn.textContent = isEditing ? 'Update Word' : 'Add Word';
        });
        
        // Edit
        window.editWord = function(id) {
            sb.from('words').select('*').eq('id', id).single()
                .then(({ data }) => {
                    isEditing = true;
                    document.getElementById('formTitle').textContent = 'Edit Word';
                    document.getElementById('editId').value = data.id;
                    document.getElementById('word').value = data.word;
                    document.getElementById('meaning').value = data.meaning;
                    document.getElementById('scheduled').value = data.scheduled_for;
                    document.getElementById('phonetic').value = data.phonetic || '';
                    document.getElementById('pronunciation').value = data.pronunciation || '';
                    document.getElementById('partOfSpeech').value = data.part_of_speech || '';
                    document.getElementById('synonyms').value = data.synonyms ? data.synonyms.join(', ') : '';
                    document.getElementById('antonyms').value = data.antonyms ? data.antonyms.join(', ') : '';
                    document.getElementById('submitBtn').textContent = 'Update Word';
                    document.getElementById('cancelBtn').style.display = 'inline-block';
                    window.scrollTo(0, 0);
                });
        };
        
        // Cancel edit
        document.getElementById('cancelBtn').addEventListener('click', cancelEdit);
        
        function cancelEdit() {
            isEditing = false;
            document.getElementById('formTitle').textContent = 'Add New Word';
            document.getElementById('editId').value = '';
            document.getElementById('wordForm').reset();
            document.getElementById('scheduled').valueAsDate = new Date();
            document.getElementById('submitBtn').textContent = 'Add Word';
            document.getElementById('cancelBtn').style.display = 'none';
        }
        
        // Load words
        async function loadWords() {
            try {
                const {data, error} = await sb.from('words').select('*').order('scheduled_for', {ascending: false});
                if (error) throw error;
                
                const list = document.getElementById('list');
                
                if (!data || data.length === 0) {
                    list.innerHTML = '<p>No words yet</p>';
                    return;
                }
                
                const today = new Date().toISOString().split('T')[0];
                
                list.innerHTML = '<table><tr><th>Date</th><th>Word</th><th>Part of Speech</th><th>Meaning</th><th>Actions</th></tr>' +
                    data.map(w => {
                        const isToday = w.scheduled_for === today;
                        return `<tr class="${isToday ? 'today-row' : ''}">
                            <td>${w.scheduled_for || 'N/A'} ${isToday ? '<b>(TODAY)</b>' : ''}</td>
                            <td><b>${w.word}</b></td>
                            <td>${w.part_of_speech || '-'}</td>
                            <td>${w.meaning.substring(0, 60)}...</td>
                            <td>
                                <button class="btn-edit" onclick="editWord('${w.id}')">Edit</button>
                                <button class="btn-delete" onclick="deleteWord('${w.id}')">Delete</button>
                            </td>
                        </tr>`;
                    }).join('') + '</table>';
                    
            } catch (error) {
                console.error('Load error:', error);
            }
        }
        
        // Delete
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
        
        // Set default date
        document.getElementById('scheduled').valueAsDate = new Date();
        
        // Initialize
        checkAuth().then(ok => { 
            if(ok) {
                loadWords();
                loadStats();
            }
        });
        
        console.log('✅ Admin ready');