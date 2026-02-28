// ===== SITE STATISTICS =====

async function loadSiteStats() {
    console.log('📊 Loading statistics...');
    
    await Promise.all([
        loadWordCount(),
        loadTotalViews(),
        loadSubscriberCount()
    ]);
}

async function loadWordCount() {
    try {
        const { count, error } = await supabase
            .from('words')
            .select('id', { count: 'exact', head: true });
        
        if (error) throw error;
        
        const elem = document.getElementById('totalWords');
        if (elem) {
            setTimeout(() => animateCount(elem, 0, count || 0, 1000), 100);
        }
    } catch (error) {
        console.error('Word count error:', error);
        setElementText('totalWords', '0');
    }
}

async function loadTotalViews() {
    try {
        const { data, error } = await supabase
            .from('words')
            .select('views');
        
        if (error) throw error;
        
        const totalViews = data ? data.reduce((sum, w) => sum + (w.views || 0), 0) : 0;
        
        const elem = document.getElementById('totalViews');
        if (elem) {
            setTimeout(() => animateCount(elem, 0, totalViews, 1500), 300);
        }
    } catch (error) {
        console.error('Views error:', error);
        setElementText('totalViews', '0');
    }
}

async function loadSubscriberCount() {
    try {
        const { count, error } = await supabase
            .from('subscribers')
            .select('id', { count: 'exact', head: true });
        
        if (error) throw error;
        
        const elem = document.getElementById('totalSubscribers');
        if (elem) {
            setTimeout(() => animateCount(elem, 0, count || 0, 1200), 500);
        }
    } catch (error) {
        console.error('Subscriber error:', error);
        setElementText('totalSubscribers', '0');
    }
}

function setElementText(id, text) {
    const elem = document.getElementById(id);
    if (elem) elem.textContent = text;
}