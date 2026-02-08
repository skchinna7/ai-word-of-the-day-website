import React from 'react';
import { Word } from '../types';

interface WordCardProps {
  word: Word;
  featured?: boolean;
}

const WordCard: React.FC<WordCardProps> = ({ word, featured = false }) => {
  if (featured) {
    return (
      <div className="min-h-[600px] bg-black text-white rounded-2xl p-12 sm:p-16 flex flex-col justify-center animate-fade-in">
        {/* Word */}
        <h1 className="text-6xl sm:text-7xl md:text-8xl font-serif mb-8 tracking-tight">
          {word.word}
        </h1>

        {/* Pronunciation */}
        {word.pronunciation && (
          <p className="text-2xl sm:text-3xl text-gray-400 mb-4 font-light italic">
            /{word.pronunciation}/ {word.part_of_speech || 'noun'}
          </p>
        )}

        {/* Meaning */}
        <p className="text-xl sm:text-2xl text-gray-200 leading-relaxed font-light max-w-4xl">
          {word.meaning}
        </p>

        {/* Example sentence */}
        {word.example && (
          <div className="mt-8 pt-8 border-t border-gray-700">
            <p className="text-lg text-gray-400 italic">
              "{word.example}"
            </p>
          </div>
        )}
      </div>
    );
  }

  // Archive/list view - simpler card
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-8 hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
      <div className="mb-4">
        <h2 className="text-4xl font-serif mb-2 text-black">{word.word}</h2>
        {word.pronunciation && (
          <p className="text-lg text-gray-500 italic">
            /{word.pronunciation}/ {word.part_of_speech || 'noun'}
          </p>
        )}
      </div>
      <p className="text-lg text-gray-700 leading-relaxed">
        {word.meaning}
      </p>
      {word.example && (
        <p className="mt-4 text-gray-600 italic">
          "{word.example}"
        </p>
      )}
    </div>
  );
};

export default WordCard;
