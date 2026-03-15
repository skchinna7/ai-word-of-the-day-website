#!/usr/bin/env python3
"""
COMPREHENSIVE WORD PROCESSOR
Fetches word data from multiple dictionary APIs
Processes large CSV files with rate limiting
"""

import csv
import requests
import time
import json
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Set
import re

# ============================================
# API CONFIGURATIONS
# ============================================

class DictionaryAPIs:
    """Multiple dictionary API sources"""
    
    # FREE DICTIONARY API (No key needed)
    @staticmethod
    def free_dictionary(word: str) -> Optional[Dict]:
        """Primary source - completely free, no limits"""
        try:
            url = f"https://api.dictionaryapi.dev/api/v2/entries/en/{word}"
            response = requests.get(url, timeout=5)
            
            if response.status_code == 200:
                data = response.json()
                if data and len(data) > 0:
                    return DictionaryAPIs.parse_free_dict(data[0])
        except Exception as e:
            print(f"Free Dict error for {word}: {e}")
        
        return None
    
    @staticmethod
    def parse_free_dict(entry: Dict) -> Dict:
        """Parse Free Dictionary API response"""
        result = {
            'phonetic': '',
            'pronunciation': '',
            'part_of_speech': '',
            'meaning': '',
            'synonyms': set(),
            'antonyms': set()
        }
        
        # Phonetic
        if entry.get('phonetic'):
            result['phonetic'] = entry['phonetic']
        elif entry.get('phonetics') and len(entry['phonetics']) > 0:
            for p in entry['phonetics']:
                if p.get('text'):
                    result['phonetic'] = p['text']
                    break
        
        # Pronunciation (simplified from phonetic)
        if result['phonetic']:
            result['pronunciation'] = DictionaryAPIs.phonetic_to_pronunciation(result['phonetic'])
        
        # Meanings
        if entry.get('meanings') and len(entry['meanings']) > 0:
            first_meaning = entry['meanings'][0]
            
            # Part of speech
            if first_meaning.get('partOfSpeech'):
                result['part_of_speech'] = first_meaning['partOfSpeech']
            
            # Definition
            if first_meaning.get('definitions') and len(first_meaning['definitions']) > 0:
                result['meaning'] = first_meaning['definitions'][0].get('definition', '')
            
            # Collect all synonyms and antonyms
            for meaning in entry['meanings']:
                # Top level
                if meaning.get('synonyms'):
                    result['synonyms'].update(meaning['synonyms'])
                if meaning.get('antonyms'):
                    result['antonyms'].update(meaning['antonyms'])
                
                # Definition level
                if meaning.get('definitions'):
                    for definition in meaning['definitions']:
                        if definition.get('synonyms'):
                            result['synonyms'].update(definition['synonyms'])
                        if definition.get('antonyms'):
                            result['antonyms'].update(definition['antonyms'])
        
        return result
    
    # DATAMUSE API (Free, 100K/day)
    @staticmethod
    def datamuse_synonyms_antonyms(word: str) -> Dict:
        """Get synonyms and antonyms from DataMuse"""
        result = {'synonyms': set(), 'antonyms': set()}
        
        try:
            # Synonyms
            syn_url = f"https://api.datamuse.com/words?rel_syn={word}&max=15"
            syn_response = requests.get(syn_url, timeout=5)
            if syn_response.status_code == 200:
                syn_data = syn_response.json()
                result['synonyms'] = {item['word'] for item in syn_data}
            
            # Small delay
            time.sleep(0.1)
            
            # Antonyms
            ant_url = f"https://api.datamuse.com/words?rel_ant={word}&max=15"
            ant_response = requests.get(ant_url, timeout=5)
            if ant_response.status_code == 200:
                ant_data = ant_response.json()
                result['antonyms'] = {item['word'] for item in ant_data}
                
        except Exception as e:
            print(f"DataMuse error for {word}: {e}")
        
        return result
    
    # MERRIAM-WEBSTER API (Free with key, 1000/day)
    @staticmethod
    def merriam_webster(word: str, api_key: str = None) -> Optional[Dict]:
        """Merriam-Webster Collegiate Dictionary API"""
        if not api_key:
            return None
        
        try:
            url = f"https://www.dictionaryapi.com/api/v3/references/collegiate/json/{word}?key={api_key}"
            response = requests.get(url, timeout=5)
            
            if response.status_code == 200:
                data = response.json()
                if data and isinstance(data, list) and len(data) > 0:
                    if isinstance(data[0], dict):
                        return DictionaryAPIs.parse_merriam(data[0])
        except Exception as e:
            print(f"Merriam-Webster error for {word}: {e}")
        
        return None
    
    @staticmethod
    def parse_merriam(entry: Dict) -> Dict:
        """Parse Merriam-Webster response"""
        result = {
            'phonetic': '',
            'pronunciation': '',
            'part_of_speech': '',
            'meaning': '',
            'synonyms': set(),
            'antonyms': set()
        }
        
        # Pronunciation
        if entry.get('hwi', {}).get('prs'):
            prs = entry['hwi']['prs'][0]
            if prs.get('mw'):
                result['pronunciation'] = prs['mw'].replace('*', '-')
        
        # Part of speech
        if entry.get('fl'):
            result['part_of_speech'] = entry['fl']
        
        # Definition
        if entry.get('shortdef') and len(entry['shortdef']) > 0:
            result['meaning'] = entry['shortdef'][0]
        
        return result
    
    @staticmethod
    def phonetic_to_pronunciation(phonetic: str) -> str:
        """Convert IPA phonetic to simplified pronunciation"""
        pronunciation = phonetic
        
        # Remove brackets/slashes
        pronunciation = re.sub(r'[\/\[\]]', '', pronunciation)
        
        # IPA to simple conversions
        conversions = {
            'ˈ': '-',  # Primary stress
            'ˌ': '',   # Secondary stress
            'ː': '',   # Length mark
            'ə': 'uh', # Schwa
            'θ': 'th', # Theta
            'ð': 'th', # Eth
            'ʃ': 'sh', # Esh
            'ʒ': 'zh', # Ezh
            'ŋ': 'ng', # Eng
            'æ': 'a',  # Ash
            'ɑ': 'ah', # Alpha
            'ɔ': 'aw', # Open O
            'ɛ': 'e',  # Epsilon
            'ɪ': 'i',  # Small I
            'ʊ': 'u',  # Upsilon
        }
        
        for ipa, simple in conversions.items():
            pronunciation = pronunciation.replace(ipa, simple)
        
        return pronunciation.strip()


# ============================================
# WORD FILTER
# ============================================

class WordFilter:
    """Filter to identify valid common English words"""
    
    # Common English word patterns
    INVALID_PATTERNS = [
        r'^[A-Z][a-z]+$',  # Proper nouns (capitalized)
        r'^[A-Z]{2,}$',    # Abbreviations (all caps)
        r'^\d',            # Starts with number
        r'^.{1,2}$',       # Too short (1-2 chars)
        r'^.{20,}$',       # Too long (20+ chars)
    ]
    
    # Common word prefixes/suffixes for validation
    COMMON_AFFIXES = {
        'prefixes': ['un', 're', 'pre', 'dis', 'mis', 'over', 'under', 'sub', 'inter', 'trans'],
        'suffixes': ['ing', 'ed', 'er', 'est', 'ly', 'tion', 'ness', 'ment', 'able', 'ible', 'ful', 'less']
    }
    
    @staticmethod
    def is_valid_word(word: str) -> bool:
        """Check if word is likely a common English word"""
        
        # Must be alphabetic
        if not word.isalpha():
            return False
        
        # Check invalid patterns
        for pattern in WordFilter.INVALID_PATTERNS:
            if re.match(pattern, word):
                return False
        
        # Must be lowercase or have common affixes
        if word[0].isupper() and word[1:].islower():
            # Might be proper noun
            return False
        
        return True


# ============================================
# WORD PROCESSOR
# ============================================

class WordProcessor:
    """Main processor for fetching word data"""
    
    def __init__(self, merriam_key: str = None):
        self.merriam_key = merriam_key
        self.processed_count = 0
        self.success_count = 0
        self.failed_count = 0
        self.start_time = None
    
    def fetch_word_data(self, word: str) -> Optional[Dict]:
        """Fetch complete word data from multiple sources"""
        
        word = word.strip().lower()
        
        if not WordFilter.is_valid_word(word):
            return None
        
        result = {
            'word': word,
            'phonetic': '',
            'pronunciation': '',
            'part_of_speech': '',
            'meaning': '',
            'synonyms': '',
            'antonyms': ''
        }
        
        # Try Free Dictionary API first
        free_dict_data = DictionaryAPIs.free_dictionary(word)
        
        if free_dict_data:
            result['phonetic'] = free_dict_data.get('phonetic', '')
            result['pronunciation'] = free_dict_data.get('pronunciation', '')
            result['part_of_speech'] = free_dict_data.get('part_of_speech', '')
            result['meaning'] = free_dict_data.get('meaning', '')
            
            synonyms = free_dict_data.get('synonyms', set())
            antonyms = free_dict_data.get('antonyms', set())
        else:
            synonyms = set()
            antonyms = set()
        
        # If no synonyms/antonyms, try DataMuse
        if len(synonyms) < 3 or len(antonyms) < 3:
            datamuse_data = DictionaryAPIs.datamuse_synonyms_antonyms(word)
            synonyms.update(datamuse_data.get('synonyms', set()))
            antonyms.update(datamuse_data.get('antonyms', set()))
        
        # Try Merriam-Webster if we still don't have data
        if not result['meaning'] and self.merriam_key:
            merriam_data = DictionaryAPIs.merriam_webster(word, self.merriam_key)
            if merriam_data:
                if not result['pronunciation']:
                    result['pronunciation'] = merriam_data.get('pronunciation', '')
                if not result['part_of_speech']:
                    result['part_of_speech'] = merriam_data.get('part_of_speech', '')
                if not result['meaning']:
                    result['meaning'] = merriam_data.get('meaning', '')
        
        # Convert sets to comma-separated strings
        result['synonyms'] = '; '.join(list(synonyms)[:10]) if synonyms else ''
        result['antonyms'] = '; '.join(list(antonyms)[:10]) if antonyms else ''
        
        # Only return if we have at least a meaning
        if result['meaning']:
            self.success_count += 1
            return result
        else:
            self.failed_count += 1
            return None
    
    def process_csv(self, input_file: str, output_file: str, start_date: str, max_words: int = None):
        """Process CSV file and generate enriched output"""
        
        self.start_time = time.time()
        
        print(f"🚀 Starting word processing...")
        print(f"📁 Input: {input_file}")
        print(f"📁 Output: {output_file}")
        print(f"📅 Start date: {start_date}")
        if max_words:
            print(f"🔢 Max words: {max_words}")
        print()
        
        # Read input CSV
        words_to_process = []
        with open(input_file, 'r', encoding='utf-8-sig') as f:
            reader = csv.DictReader(f)
            for row in reader:
                word = row.get('Column1', '').strip()
                if word and WordFilter.is_valid_word(word):
                    words_to_process.append(word)
        
        print(f"📊 Filtered to {len(words_to_process)} valid words from original file")
        
        if max_words and len(words_to_process) > max_words:
            words_to_process = words_to_process[:max_words]
            print(f"🎯 Processing first {max_words} words")
        
        print()
        
        # Process words
        results = []
        current_date = datetime.strptime(start_date, '%Y-%m-%d')
        
        for i, word in enumerate(words_to_process):
            self.processed_count += 1
            
            # Progress update every 10 words
            if (i + 1) % 10 == 0:
                elapsed = time.time() - self.start_time
                rate = self.processed_count / elapsed
                eta = (len(words_to_process) - self.processed_count) / rate if rate > 0 else 0
                
                print(f"Progress: {i+1}/{len(words_to_process)} | "
                    f"Success: {self.success_count} | "
                    f"Failed: {self.failed_count} | "
                    f"Rate: {rate:.1f}/sec | "
                    f"ETA: {eta/60:.1f}min")
            
            # Fetch data
            word_data = self.fetch_word_data(word)
            
            if word_data:
                # Add scheduled date
                word_data['scheduled_for'] = current_date.strftime('%Y-%m-%d')
                results.append(word_data)
                current_date += timedelta(days=1)
            
            # Rate limiting (be nice to free APIs)
            time.sleep(0.5)  # 2 requests per second
        
        # Write output CSV
        if results:
            fieldnames = ['word', 'meaning', 'scheduled_for', 'phonetic', 'pronunciation', 
                        'part_of_speech', 'synonyms', 'antonyms']
            
            with open(output_file, 'w', newline='', encoding='utf-8') as f:
                writer = csv.DictWriter(f, fieldnames=fieldnames)
                writer.writeheader()
                writer.writerows(results)
            
            print(f"\n✅ SUCCESS!")
            print(f"📊 Processed: {self.processed_count} words")
            print(f"✅ Success: {self.success_count} words")
            print(f"❌ Failed: {self.failed_count} words")
            print(f"⏱️  Time: {(time.time() - self.start_time)/60:.1f} minutes")
            print(f"📁 Output saved to: {output_file}")
        else:
            print("\n❌ No words were successfully processed!")


# ============================================
# MAIN EXECUTION
# ============================================

if __name__ == "__main__":
    import sys
    
    # Configuration
    INPUT_FILE = "/mnt/user-data/uploads/words.csv"
    OUTPUT_FILE = "/mnt/user-data/outputs/words_enriched.csv"
    START_DATE = "2026-05-02"  # Start from May 2, 2026
    MAX_WORDS = 100  # Process first 100 words (change this as needed)
    
    # Optional: Add your Merriam-Webster API key
    # Get free key at: https://dictionaryapi.com/
    MERRIAM_KEY = None  # e.g., "your-api-key-here"
    
    print("=" * 60)
    print("COMPREHENSIVE WORD PROCESSOR")
    print("=" * 60)
    print()
    
    processor = WordProcessor(merriam_key=MERRIAM_KEY)
    processor.process_csv(INPUT_FILE, OUTPUT_FILE, START_DATE, MAX_WORDS)
    
    print()
    print("=" * 60)
    print("PROCESSING COMPLETE")
    print("=" * 60)