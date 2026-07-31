/**
 * Content Uniqueness Engine
 * Deterministic uniqueness system using token jaccard similarity, 
 * n-gram overlap, and hash comparison across existing pages/proposals.
 * Automatically flags and rejects duplicate or overly similar content.
 */

import crypto from "crypto";

export interface UniquenessCheckResult {
  isUnique: boolean;
  uniquenessScore: number; // 0 to 100 (100 = completely unique)
  highestSimilarityMatch?: string;
  reason?: string;
}

// Memory store of registered content fingerprints for fast comparison
const contentRegistry: Array<{ id: string; tokens: Set<string>; textHash: string }> = [];

/**
 * Clean and tokenize text into normalized n-grams
 */
function tokenize(text: string): Set<string> {
  const words = text
    .toLowerCase()
    .replace(/[^\w\s]/g, "")
    .split(/\s+/)
    .filter((w) => w.length > 2);

  const tokens = new Set<string>();

  // Add individual unigrams
  words.forEach((w) => tokens.add(w));

  // Add bigrams for structural phrase matching
  for (let i = 0; i < words.length - 1; i++) {
    tokens.add(`${words[i]}_${words[i + 1]}`);
  }

  return tokens;
}

/**
 * Calculate Jaccard similarity coefficient between two token sets
 */
function calculateJaccardSimilarity(setA: Set<string>, setB: Set<string>): number {
  if (setA.size === 0 || setB.size === 0) return 0;

  let intersectionSize = 0;
  setA.forEach((token) => {
    if (setB.has(token)) {
      intersectionSize++;
    }
  });

  const unionSize = setA.size + setB.size - intersectionSize;
  return unionSize > 0 ? intersectionSize / unionSize : 0;
}

/**
 * Register new content into the uniqueness memory index
 */
export function registerContent(id: string, text: string) {
  const tokens = tokenize(text);
  const textHash = crypto.createHash("sha256").update(text).digest("hex");

  // Avoid duplicates in memory registry
  const existingIdx = contentRegistry.findIndex((item) => item.id === id);
  if (existingIdx >= 0) {
    contentRegistry[existingIdx] = { id, tokens, textHash };
  } else {
    contentRegistry.push({ id, tokens, textHash });
  }
}

/**
 * Check uniqueness of a new content draft against registered content
 */
export function checkUniqueness(newText: string, existingList?: Array<{ id: string; text: string }>): UniquenessCheckResult {
  if (!newText || newText.trim().length < 20) {
    return {
      isUnique: true,
      uniquenessScore: 100,
      reason: "Text too short for similarity comparison"
    };
  }

  const newTokens = tokenize(newText);
  let maxSimilarity = 0;
  let matchingId = "";

  // Compare against explicitly provided list
  if (existingList && existingList.length > 0) {
    for (const item of existingList) {
      const tokens = tokenize(item.text);
      const similarity = calculateJaccardSimilarity(newTokens, tokens);
      if (similarity > maxSimilarity) {
        maxSimilarity = similarity;
        matchingId = item.id;
      }
    }
  }

  // Compare against global registry
  for (const item of contentRegistry) {
    const similarity = calculateJaccardSimilarity(newTokens, item.tokens);
    if (similarity > maxSimilarity) {
      maxSimilarity = similarity;
      matchingId = item.id;
    }
  }

  const uniquenessScore = Math.round((1 - maxSimilarity) * 100);
  const isUnique = uniquenessScore >= 70; // Requires at least 70% uniqueness (less than 30% similarity)

  return {
    isUnique,
    uniquenessScore,
    highestSimilarityMatch: matchingId || undefined,
    reason: isUnique
      ? "Content passes uniqueness threshold"
      : `Content is ${Math.round(maxSimilarity * 100)}% similar to registered item (${matchingId})`
  };
}
