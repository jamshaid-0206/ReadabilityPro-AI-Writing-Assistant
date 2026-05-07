import { syllable } from 'syllable';

export interface ReadabilityMetrics {
  sentences: number;
  words: number;
  syllables: number;
  complexWords: number;
}

export interface ReadabilityScores {
  fleschEase: number;
  fleschKincaid: number;
  gunningFog: number;
  interpretation: string;
}

export function analyzeText(text: string): { metrics: ReadabilityMetrics; scores: ReadabilityScores } {
  if (!text || text.trim().length === 0) {
    return {
      metrics: { sentences: 0, words: 0, syllables: 0, complexWords: 0 },
      scores: { fleschEase: 0, fleschKincaid: 0, gunningFog: 0, interpretation: 'No text provided' }
    };
  }

  // Basic cleanup
  const cleanedText = text.trim();

  // Sentence count (basic split by punctuation)
  const sentences = cleanedText.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const totalSentences = sentences.length || 1;

  // Word count
  const words = cleanedText.split(/\s+/).filter(w => w.trim().length > 0);
  const totalWords = words.length || 1;

  // Syllable count & Complex words
  let totalSyllables = 0;
  let complexWords = 0;

  words.forEach(word => {
    const sCount = syllable(word);
    totalSyllables += sCount;
    if (sCount >= 3) {
      complexWords++;
    }
  });

  // Calculations
  const fleschEase = 206.835 - 1.015 * (totalWords / totalSentences) - 84.6 * (totalSyllables / totalWords);
  const fleschKincaid = 0.39 * (totalWords / totalSentences) + 11.8 * (totalSyllables / totalWords) - 15.59;
  const gunningFog = 0.4 * ((totalWords / totalSentences) + 100 * (complexWords / totalWords));

  return {
    metrics: {
      sentences: totalSentences,
      words: totalWords,
      syllables: totalSyllables,
      complexWords
    },
    scores: {
      fleschEase: Math.max(0, Math.min(100, fleschEase)),
      fleschKincaid: Math.max(0, fleschKincaid),
      gunningFog: Math.max(0, gunningFog),
      interpretation: getInterpretation(fleschEase)
    }
  };
}

function getInterpretation(score: number): string {
  if (score >= 90) return 'Very Easy (5th grade)';
  if (score >= 80) return 'Easy (6th grade)';
  if (score >= 70) return 'Fairly Easy (7th grade)';
  if (score >= 60) return 'Standard (8th-9th grade)';
  if (score >= 50) return 'Fairly Difficult (10th-12th grade)';
  if (score >= 30) return 'Difficult (College level)';
  return 'Very Difficult (College graduate)';
}
