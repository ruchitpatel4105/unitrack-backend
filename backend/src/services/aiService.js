/**
 * AI Service for Lost & Found Matching and Fleet Analytics
 * Provides intelligent attribute similarity scoring, text token analysis,
 * and structured match explanations.
 */

function calculateItemMatch(lostItem, foundItem) {
  let score = 0;
  const reasons = [];

  // 1. Category Matching (Weight: 30%)
  if (lostItem.category && foundItem.category) {
    if (lostItem.category.toLowerCase() === foundItem.category.toLowerCase()) {
      score += 30;
      reasons.push(`Exact category match (${lostItem.category})`);
    }
  }

  // 2. Color Matching (Weight: 20%)
  if (lostItem.color && foundItem.color) {
    const lColor = lostItem.color.toLowerCase().trim();
    const fColor = foundItem.color.toLowerCase().trim();
    if (lColor === fColor) {
      score += 20;
      reasons.push(`Matching color (${lostItem.color})`);
    } else if (lColor.includes(fColor) || fColor.includes(lColor)) {
      score += 10;
      reasons.push(`Similar color tone`);
    }
  }

  // 3. Bus / Route Proximity (Weight: 25%)
  if (lostItem.bus_id && foundItem.bus_id) {
    if (Number(lostItem.bus_id) === Number(foundItem.bus_id)) {
      score += 25;
      reasons.push(`Reported on the same bus (Bus ID: ${lostItem.bus_id})`);
    }
  } else if (lostItem.location_name && foundItem.location_name) {
    const lLoc = lostItem.location_name.toLowerCase();
    const fLoc = foundItem.location_name.toLowerCase();
    if (lLoc.includes(fLoc) || fLoc.includes(lLoc)) {
      score += 15;
      reasons.push(`Reported at similar campus location`);
    }
  }

  // 4. Date Proximity (Weight: 10%)
  if (lostItem.item_date && foundItem.item_date) {
    const lDate = new Date(lostItem.item_date);
    const fDate = new Date(foundItem.item_date);
    const diffDays = Math.abs((fDate - lDate) / (1000 * 60 * 60 * 24));
    if (diffDays <= 1) {
      score += 10;
      reasons.push('Occurred within 24 hours timeframe');
    } else if (diffDays <= 3) {
      score += 5;
      reasons.push('Occurred within 3 days timeframe');
    }
  }

  // 5. Title & Description Keyword Match (Weight: 15%)
  const extractTokens = (text) => {
    if (!text) return [];
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(w => w.length > 3 && !['with', 'this', 'that', 'from', 'near', 'have'].includes(w));
  };

  const lostTokens = extractTokens((lostItem.title || '') + ' ' + (lostItem.description || ''));
  const foundTokens = extractTokens((foundItem.title || '') + ' ' + (foundItem.description || ''));
  const common = lostTokens.filter(token => foundTokens.includes(token));
  const uniqueCommon = [...new Set(common)];

  if (uniqueCommon.length > 0) {
    const tokenScore = Math.min(15, uniqueCommon.length * 5);
    score += tokenScore;
    reasons.push(`Shared descriptive keywords: "${uniqueCommon.slice(0, 4).join(', ')}"`);
  }

  return {
    score: Math.min(100, Math.max(0, score)),
    explanation: reasons.join('. ') + '.'
  };
}

/**
 * Scan all reported found items against a lost item (or vice versa)
 * and update matches with score >= 45%
 */
function findMatchesForCandidate(candidate, poolItems) {
  const matches = [];
  const isLost = candidate.type === 'lost';

  for (const item of poolItems) {
    if (item.id === candidate.id) continue;
    if (item.type === candidate.type) continue; // Compare lost with found only

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
