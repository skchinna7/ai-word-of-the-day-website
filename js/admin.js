const SUPABASE_URL = "https://qzatavslhtkioivemwlk.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZpa3plc2ltY2x5bmh6aGF2ZHJsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk4MTcyNDgsImV4cCI6MjA4NTM5MzI0OH0.k44Eibz2i7VD2rA-JGZu_v0s3t3ruKdxHr6qZx-U1MQ";

const supabase = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_KEY
);

console.log('🔧 Admin panel loading...');

// // Initialize Supabase ONCE
// const { createClient } = window.supabase;
// const supabase = createClient(
//     "https://qzatavslhtkioivemwlk.supabase.co",
//     "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF6YXRhdnNsaHRraW9pdmVtd2xrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA1MzIyMTYsImV4cCI6MjA4NjEwODIxNn0.LaNyj8T6VYGMMbuyX-Fg_6Fm6yIhPLTW0enYd6sNdGE"
// );

// Global state to prevent race conditions
let isInitialized = false;
let authCheckInProgress = false;

// Check authentication ONCE
async function checkAuth() {
    if (authCheckInProgress) {
        console.log('Auth check already in progress, skipping...');
        return null;
    }
    
    authCheckInProgress = true;
    
    try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) throw error;
        
        if (!session || !session.user) {
            document.body.innerHTML = `
                <div style="text-align: center; padding: 50px;">
                    <h1>🔐 Admin Panel</h1>
                    <p>You must be logged in to access this page.</p>
                    <a href="login.html" style="display: inline-block; padding: 10px 20px; background: #667eea; color: white; text-decoration: none; border-radius: 5px;">Go to Login</a>
                </div>
            `;
            return null;
        }
        
        console.log('✅ Authenticated:', session.user.email);
        return session.user;
        
    } catch (error) {
        console.error('Auth error:', error);
        return null;
    } finally {
        authCheckInProgress = false;
    }
}

// Load word count
async function loadWordCount() {
    try {
        console.log('📊 Loading word count...');
        
        const { data, error } = await supabase
            .from('words')
            .select('id', { count: 'exact', head: true });
        
        if (error) {
            console.error('Word count error:', error);
            throw error;
        }
        
        const count = data || 0;
        console.log('Word count:', count);
        
        const elem = document.getElementById('wordCount');
        if (elem) {
            elem.textContent = count;
        }
        
        return count;
        
    } catch (error) {
        console.error('Error loading word count:', error);
        const elem = document.getElementById('wordCount');
        if (elem) {
            elem.textContent = '?';
        }
    }
}

// Load all words
async function loadWords() {
    try {
        console.log('📚 Loading words...');
        
        const { data: words, error } = await supabase
            .from('words')
            .select('*')
            .order('scheduled_for', { ascending: false });
        
        if (error) throw error;
        
        console.log('Loaded words:', words ? words.length : 0);
        
        const tbody = document.getElementById('wordsTableBody');
        if (!tbody) return;
        
        if (!words || words.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" style="text-align: center;">No words yet. Add your first word!</td></tr>';
            return;
        }
        
        const today = new Date().toISOString().split('T')[0];
        
        tbody.innerHTML = words.map(word => {
            const isToday = word.scheduled_for === today;
            return `
                <tr style="${isToday ? 'background: #fff3cd;' : ''}">
                    <td><strong>${word.word}</strong></td>
                    <td>${word.scheduled_for}</td>
                    <td>${word.meaning.substring(0, 100)}...</td>
                    <td>${word.views || 0}</td>
                    <td>
                        <button class="btn-edit" onclick="editWord(${word.id})">Edit</button>
                        <button class="btn-delete" onclick="deleteWord(${word.id})">Delete</button>
                    </td>
                </tr>
            `;
        }).join('');
        
    } catch (error) {
        console.error('Error loading words:', error);
    }
}

// Delete word
window.deleteWord = async function(id) {
    if (!confirm('Delete this word?')) return;
    
    try {
        const { error } = await supabase.from('words').delete().eq('id', id);
        if (error) throw error;
        
        alert('✅ Word deleted!');
        await loadWords();
        await loadWordCount();
        
    } catch (error) {
        console.error('Delete error:', error);
        alert('❌ Error deleting word');
    }
};

// Edit word
window.editWord = async function(id) {
    try {
        const { data: word, error } = await supabase
            .from('words')
            .select('*')
            .eq('id', id)
            .single();
        
        if (error) throw error;
        
        document.getElementById('wordId').value = word.id;
        document.getElementById('wordInput').value = word.word;
        document.getElementById('dateInput').value = word.scheduled_for;
        document.getElementById('phoneticInput').value = word.phonetic || '';
        document.getElementById('pronunciationInput').value = word.pronunciation || '';
        document.getElementById('partOfSpeechInput').value = word.part_of_speech || '';
        document.getElementById('synonymsInput').value = word.synonyms ? word.synonyms.join(', ') : '';
        document.getElementById('antonymsInput').value = word.antonyms ? word.antonyms.join(', ') : '';
        document.getElementById('meaningInput').value = word.meaning;
        
        document.getElementById('submitBtn').textContent = 'Update Word';
        window.scrollTo(0, 0);
        
    } catch (error) {
        console.error('Edit error:', error);
        alert('❌ Error loading word');
    }
};

// Add/Update word form
const wordForm = document.getElementById('wordForm');
if (wordForm) {
    wordForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const id = document.getElementById('wordId').value;
        const word = document.getElementById('wordInput').value.trim();
        const scheduled_for = document.getElementById('dateInput').value;
        const phonetic = document.getElementById('phoneticInput').value.trim();
        const pronunciation = document.getElementById('pronunciationInput').value.trim();
        const part_of_speech = document.getElementById('partOfSpeechInput').value;
        const synonyms = document.getElementById('synonymsInput').value.trim().split(',').map(s => s.trim()).filter(s => s);
        const antonyms = document.getElementById('antonymsInput').value.trim().split(',').map(s => s.trim()).filter(s => s);
        const meaning = document.getElementById('meaningInput').value.trim();
        
        const wordData = {
            word,
            scheduled_for,
            phonetic,
            pronunciation,
            part_of_speech,
            synonyms,
            antonyms,
            meaning
        };
        
        try {
            if (id) {
                // Update
                const { error } = await supabase
                    .from('words')
                    .update(wordData)
                    .eq('id', id);
                
                if (error) throw error;
                alert('✅ Word updated!');
            } else {
                // Insert
                const { error } = await supabase
                    .from('words')
                    .insert(wordData);
                
                if (error) throw error;
                alert('✅ Word added!');
            }
            
            wordForm.reset();
            document.getElementById('wordId').value = '';
            document.getElementById('submitBtn').textContent = 'Add Word';
            
            await loadWords();
            await loadWordCount();
            
        } catch (error) {
            console.error('Save error:', error);
            alert('❌ Error: ' + error.message);
        }
    });
}

// Logout
const logoutBtn = document.getElementById('logoutBtn');
if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
        await supabase.auth.signOut();
        window.location.href = 'login.html';
    });
}

// Initialize page - RUN ONCE
async function initAdminPage() {
    if (isInitialized) {
        console.log('Already initialized, skipping...');
        return;
    }
    
    isInitialized = true;
    console.log('🚀 Initializing admin page...');
    
    const user = await checkAuth();
    if (!user) return;
    
    await loadWordCount();
    await loadWords();
    
    console.log('✅ Admin page ready!');
}

// Run ONCE when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAdminPage);
} else {
    initAdminPage();
}
