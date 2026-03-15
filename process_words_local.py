#!/usr/bin/env python3
"""
COMPREHENSIVE WORD PROCESSOR - LOCAL VERSION
Fetches word data from multiple dictionary APIs
Processes large CSV files with rate limiting
"""

import csv
import requests
import time
import json
import os
import sys
import argparse
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
    
    @staticmethod
    def is_valid_word(word: str) -> bool:
        """Check if word is likely a common English word"""
        
        # Must be alphabetic
        if not word.isalpha():
            return False
        
        # Must be 3+ characters
        if len(word) < 3:
            return False
        
        # Must be 20 or fewer characters
        if len(word) > 20:
            return False
        
        # Skip proper nouns (capitalized)
        if word[0].isupper() and word[1:].islower():
            return False
        
        # Skip abbreviations (all caps, short)
        if word.isupper() and len(word) < 6:
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
        
        # Convert sets to semicolon-separated strings
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
        
        # Check if input file exists
        if not os.path.exists(input_file):
            print(f"❌ ERROR: Input file not found: {input_file}")
            print(f"Current directory: {os.getcwd()}")
            print(f"Files in current directory:")
            for f in os.listdir('.'):
                print(f"  - {f}")
            sys.exit(1)
        
        # Read input CSV
        words_to_process = []
        try:
            with open(input_file, 'r', encoding='utf-8-sig') as f:
                reader = csv.DictReader(f)
                
                # Get the first column name dynamically
                fieldnames = reader.fieldnames
                if not fieldnames:
                    print("❌ ERROR: CSV file is empty or has no headers")
                    sys.exit(1)
                
                first_col = fieldnames[0]
                print(f"📋 Reading column: '{first_col}'")
                
                for row in reader:
                    word = row.get(first_col, '').strip()
                    if word and WordFilter.is_valid_word(word):
                        words_to_process.append(word.lower())
        
        except Exception as e:
            print(f"❌ ERROR reading CSV: {e}")
            sys.exit(1)
        
        # Remove duplicates and sort
        words_to_process = sorted(set(words_to_process))
        
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
            if (i + 1) % 10 == 0 or (i + 1) == 1:
                elapsed = time.time() - self.start_time
                rate = self.processed_count / elapsed if elapsed > 0 else 0
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
    parser = argparse.ArgumentParser(description='Process words and fetch meanings from dictionary APIs')
    parser.add_argument('--input', '-i', default='words.csv', help='Input CSV file (default: words.csv)')
    parser.add_argument('--output', '-o', default='words_enriched.csv', help='Output CSV file (default: words_enriched.csv)')
    parser.add_argument('--start-date', '-d', default='2026-05-02', help='Start date for scheduling (default: 2026-05-02)')
    parser.add_argument('--max-words', '-m', type=int, default=100, help='Max words to process (default: 100, use 0 for all)')
    parser.add_argument('--merriam-key', '-k', default=None, help='Merriam-Webster API key (optional)')
    
    args = parser.parse_args()
    
    # Handle max_words = 0 meaning all words
    max_words = None if args.max_words == 0 else args.max_words
    
    print("=" * 70)
    print("COMPREHENSIVE WORD PROCESSOR")
    print("=" * 70)
    print()
    print(f"Current directory: {os.getcwd()}")
    print(f"Looking for input file: {args.input}")
    print()
    
    processor = WordProcessor(merriam_key=args.merriam_key)
    processor.process_csv(args.input, args.output, args.start_date, max_words)
    
    print()
    print("=" * 70)
    print("PROCESSING COMPLETE")
    print("=" * 70)