// ===== MAIN INITIALIZATION =====

async function initializePage() {
    console.log('🚀 Initializing...');
    
    // Initialize forms
    initSearch();
    initNewsletter();
    initSuggestionForm();
    
    // Load data
    await checkLoginStatus();
    await loadSiteStats();
    await loadTodayWord();
    await loadPreviousWords();
    await loadTrendingWords();
    
    // Setup utilities
    displayTimezone();
    scheduleRefreshAtMidnight();
    
    console.log('✅ Ready!');
}

// Start when page loads
initializePage();