/**
 * Uni-Track AI Service — Smart Lost & Found Matching Engine
 * 
 * Scoring breakdown (total capped at 100):
 *   Title similarity       : 0–35 pts
 *   Description similarity : 0–20 pts
 *   Brand/model match      : 0–25 pts (bonus)
 *   Category match         : 0–20 pts
 *   Color match            : 0–15 pts
 *   Same bus               : 0–20 pts
 *   Date proximity         : 0–10 pts
 *   Location keyword       : 0–10 pts
 */

// Known brands/models to detect for strong matching signal
const KNOWN_BRANDS = [
  'apple', 'samsung', 'lenovo', 'thinkpad', 'dell', 'hp', 'asus', 'acer', 'oppo', 'vivo',
  'realme', 'oneplus', 'xiaomi', 'redmi', 'nokia', 'motorola', 'huawei', 'sony', 'lg',
  'casio', 'titan', 'fastrack', 'fossil', 'boat', 'jbl', 'bose', 'sennheiser', 'skullcandy',
  'nike', 'adidas', 'puma', 'reebok', 'woodland', 'bata', 'campus',
  'american tourister', 'wildcraft', 'skybags', 'aristocrat', 'safari',
  'parker', 'reynolds', 'pilot', 'cello', 'natraj',
  'iphone', 'ipad', 'macbook', 'airpods',
  'galaxy', 'pixel', 'surface', 'ideapad', 'inspiron', 'pavilion',
  'wallet', 'purse', 'backpack', 'satchel', 'tote',
  'calculator', 'scientific', 'graphing',
  'umbrella', 'specs', 'spectacles', 'glasses', 'sunglasses', 'goggles',
  'headphones', 'earphones', 'earbuds', 'charger', 'powerbank', 'cable'
];

// Fuzzy color synonyms
const COLOR_SYNONYMS = {
  'navy': ['navy blue', 'dark blue', 'navy'],
  'maroon': ['maroon', 'dark red', 'wine', 'burgundy'],
  'olive': ['olive', 'dark green', 'olive green'],
  'teal': ['teal', 'cyan', 'dark cyan'],
  'cream': ['cream', 'off white', 'ivory', 'beige'],
  'grey': ['grey', 'gray', 'charcoal', 'ash'],
  'golden': ['golden', 'gold', 'yellow gold'],
  'skin': ['skin', 'peach', 'flesh']
};

/**
 * Stop words to filter during tokenization
 */
const STOP_WORDS = new Set([
  'with', 'this', 'that', 'from', 'near', 'have', 'been', 'some', 'they',
  'were', 'will', 'your', 'when', 'what', 'which', 'where', 'there', 'their',
  'than', 'then', 'also', 'into', 'just', 'over', 'such', 'very', 'each',
  'about', 'after', 'before', 'found', 'lost', 'item', 'seat', 'bus', 'inside',
  'color', 'left', 'back', 'front', 'side', 'during', 'while', 'around', 'upon'
]);

/**
 * Tokenize a string into meaningful words
 */
function tokenize(text) {
  if (!text) return [];
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length >= 3 && !STOP_WORDS.has(w));
}

/**
 * Jaccard similarity between two token sets
 */
function jaccardSimilarity(tokensA, tokensB) {
  if (!tokensA.length || !tokensB.length) return 0;
  const setA = new Set(tokensA);
  const setB = new Set(tokensB);
  const intersection = [...setA].filter(t => setB.has(t));
  const union = new Set([...setA, ...setB]);
  return intersection.length / union.size;
}

/**
 * Get shared tokens between two token lists
 */
function sharedTokens(tokensA, tokensB) {
  const setB = new Set(tokensB);
  return [...new Set(tokensA.filter(t => setB.has(t)))];
}

/**
 * Extract brand/model mentions from text
 */
function extractBrands(text) {
  if (!text) return [];
  const lower = text.toLowerCase();
  return KNOWN_BRANDS.filter(brand => lower.includes(brand));
}

/**
 * Normalize color string to canonical form
 */
function normalizeColor(color) {
  if (!color) return null;
  const lower = color.toLowerCase().trim();
  for (const [canonical, synonyms] of Object.entries(COLOR_SYNONYMS)) {
    if (synonyms.some(s => lower.includes(s) || s.includes(lower))) {
      return canonical;
    }
  }
  return lower;
}

/**
 * Core AI matching function — compares a lost item against a found item
 * Returns { score (0-100), explanation (string) }
 */
function calculateItemMatch(lostItem, foundItem) {
  let score = 0;
  const reasons = [];

  // ──────────────────────────────────────────────
  // 1. Brand/Model Detection Bonus (+25 pts max)
  // ──────────────────────────────────────────────
  const lostText = ((lostItem.title || '') + ' ' + (lostItem.description || '')).toLowerCase();
  const foundText = ((foundItem.title || '') + ' ' + (foundItem.description || '')).toLowerCase();

  const lostBrands = extractBrands(lostText);
  const foundBrands = extractBrands(foundText);
  const commonBrands = lostBrands.filter(b => foundBrands.includes(b));

  if (commonBrands.length > 0) {
    const brandBonus = Math.min(25, commonBrands.length * 15);
    score += brandBonus;
    reasons.push(`Matching brand/model: "${commonBrands.slice(0, 2).join(', ')}"`);
  }

  // ──────────────────────────────────────────────
  // 2. Title Similarity (0–35 pts)
  // ──────────────────────────────────────────────
  const lostTitleTokens = tokenize(lostItem.title || '');
  const foundTitleTokens = tokenize(foundItem.title || '');

  if (lostTitleTokens.length > 0 && foundTitleTokens.length > 0) {
    const titleJaccard = jaccardSimilarity(lostTitleTokens, foundTitleTokens);
    const shared = sharedTokens(lostTitleTokens, foundTitleTokens);
    const titleScore = Math.round(titleJaccard * 35);

    if (titleScore > 0) {
      score += titleScore;
      if (shared.length > 0) {
        reasons.push(`Title keywords match: "${shared.slice(0, 4).join(', ')}"`);
      } else {
        reasons.push(`Title similarity detected`);
      }
    }
  }

  // ──────────────────────────────────────────────
  // 3. Description Similarity (0–20 pts)
  // ──────────────────────────────────────────────
  const lostDescTokens = tokenize(lostItem.description || '');
  const foundDescTokens = tokenize(foundItem.description || '');

  if (lostDescTokens.length > 0 && foundDescTokens.length > 0) {
    const descJaccard = jaccardSimilarity(lostDescTokens, foundDescTokens);
    const sharedDesc = sharedTokens(lostDescTokens, foundDescTokens);
    const descScore = Math.round(descJaccard * 20);

    if (descScore > 0) {
      score += descScore;
      if (sharedDesc.length > 0) {
        reasons.push(`Description details match: "${sharedDesc.slice(0, 3).join(', ')}"`);
      }
    }
  }

  // ──────────────────────────────────────────────
  // 4. Category Match (0–20 pts)
  // ──────────────────────────────────────────────
  if (lostItem.category && foundItem.category) {
    if (lostItem.category.toLowerCase() === foundItem.category.toLowerCase()) {
      score += 20;
      reasons.push(`Same category (${lostItem.category})`);
    }
  }

  // ──────────────────────────────────────────────
  // 5. Color Match (0–15 pts)
  // ──────────────────────────────────────────────
  const lostColor = normalizeColor(lostItem.color);
  const foundColor = normalizeColor(foundItem.color);

  if (lostColor && foundColor) {
    if (lostColor === foundColor) {
      score += 15;
      reasons.push(`Identical color (${lostItem.color})`);
    } else if (lostColor.includes(foundColor) || foundColor.includes(lostColor)) {
      score += 8;
      reasons.push(`Similar color (${lostItem.color} ≈ ${foundItem.color})`);
    }
  }

  // ──────────────────────────────────────────────
  // 6. Same Bus (0–20 pts)
  // ──────────────────────────────────────────────
  if (lostItem.bus_id && foundItem.bus_id) {
    if (Number(lostItem.bus_id) === Number(foundItem.bus_id)) {
      score += 20;
      reasons.push(`Reported on the same bus (Bus ID: ${lostItem.bus_id})`);
    }
  }

  // ──────────────────────────────────────────────
  // 7. Location Keyword Match (0–10 pts)
  // ──────────────────────────────────────────────
  if (lostItem.location_name && foundItem.location_name) {
    const lLoc = tokenize(lostItem.location_name);
    const fLoc = tokenize(foundItem.location_name);
    const locShared = sharedTokens(lLoc, fLoc);
    if (locShared.length >= 2) {
      score += 10;
      reasons.push(`Matching location details: "${locShared.slice(0, 2).join(', ')}"`);
    } else if (locShared.length === 1) {
      score += 5;
      reasons.push(`Nearby location: "${locShared[0]}"`);
    }
  }

  // ──────────────────────────────────────────────
  // 8. Date Proximity (0–10 pts)
  // ──────────────────────────────────────────────
  if (lostItem.item_date && foundItem.item_date) {
    const lDate = new Date(lostItem.item_date);
    const fDate = new Date(foundItem.item_date);
    const diffDays = Math.abs((fDate - lDate) / (1000 * 60 * 60 * 24));
    if (diffDays <= 1) {
      score += 10;
      reasons.push('Reported within 24 hours of each other');
    } else if (diffDays <= 3) {
      score += 5;
      reasons.push('Reported within 3 days of each other');
    } else if (diffDays <= 7) {
      score += 2;
      reasons.push('Reported within same week');
    }
  }

  const finalScore = Math.min(100, Math.max(0, score));
  const explanation = reasons.length > 0
    ? reasons.join('. ') + '.'
    : 'Low similarity — insufficient matching attributes.';

  return { score: finalScore, explanation };
}

/**
 * Scan all opposite-type items and return sorted match list for threshold ≥ 45
 */
function findMatchesForCandidate(candidate, poolItems) {
  const matches = [];
  const isLost = candidate.type === 'lost';

  for (const item of poolItems) {
    if (item.id === candidate.id) continue;
    if (item.type === candidate.type) continue;

    const lost = isLost ? candidate : item;
    const found = isLost ? item : candidate;

    const result = calculateItemMatch(lost, found);
    if (result.score >= 45) {
      matches.push({
        lost_item_id: lost.id,
        found_item_id: found.id,
        match_score: result.score,
        match_reasons: result.explanation,
        matched_item: item,
        status: 'suggested'
      });
    }
  }

  return matches.sort((a, b) => b.match_score - a.match_score);
}

module.exports = {
  calculateItemMatch,
  findMatchesForCandidate
};

