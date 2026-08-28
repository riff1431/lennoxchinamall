import { Product } from "@/types/database";
import { MOCK_PRODUCTS } from "./mockData";

export interface RelatedProductOptions {
  limit?: number;
  catalog?: Product[];
}

/**
 * Common English stop words to ignore when tokenizing product titles
 */
const STOP_WORDS = new Set([
  "a", "an", "the", "and", "or", "but", "in", "on", "at", "to", "for", "of", "with",
  "by", "from", "up", "about", "into", "over", "after", "is", "are", "was", "were",
  "be", "been", "being", "have", "has", "had", "do", "does", "did", "pro", "plus",
  "mini", "max", "set", "kit", "new", "direct", "factory", "high", "speed"
]);

/**
 * Tokenize a title string into meaningful keywords (min 3 characters, lowercase, non-stopword)
 */
function extractKeywords(text: string): string[] {
  if (!text) return [];
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, " ")
    .split(/\s+/)
    .map((word) => word.trim())
    .filter((word) => word.length >= 3 && !STOP_WORDS.has(word));
}

/**
 * Calculates a dynamic similarity score between the current product and candidate product
 * Factors:
 * 1. Category match (Weight: 35)
 * 2. Brand match (Weight: 15)
 * 3. Overlapping tags (Weight: 12 per tag)
 * 4. Title keywords match (Weight: 10 per matching keyword)
 * 5. Description keywords match (Weight: 3 per keyword)
 * 6. Price tier proximity (Weight: 5 if within +/- 40%)
 * 7. Rating / Social proof bonus (Weight: up to 5)
 */
export function calculateRelevanceScore(current: Product, candidate: Product): number {
  if (candidate.id === current.id || candidate.slug === current.slug) {
    return -1; // Exclude self
  }

  let score = 0;

  // 1. Same Category
  if (candidate.category_id && current.category_id && candidate.category_id === current.category_id) {
    score += 35;
  }

  // 2. Same Brand
  if (candidate.brand_id && current.brand_id && candidate.brand_id === current.brand_id) {
    score += 15;
  }

  // 3. Tag Matches
  const currentTags = (current.tags || []).map((t) => t.toLowerCase().trim());
  const candidateTags = (candidate.tags || []).map((t) => t.toLowerCase().trim());
  if (currentTags.length > 0 && candidateTags.length > 0) {
    let matchingTagsCount = 0;
    for (const tag of currentTags) {
      if (candidateTags.includes(tag)) {
        matchingTagsCount++;
      }
    }
    score += matchingTagsCount * 12;
  }

  // 4. Title Keyword Overlap
  const currentTitleWords = extractKeywords(current.title);
  const candidateTitleWords = extractKeywords(candidate.title);
  const candidateDesc = (candidate.description || candidate.short_description || "").toLowerCase();

  for (const word of currentTitleWords) {
    if (candidateTitleWords.includes(word)) {
      score += 10;
    } else if (candidateDesc.includes(word)) {
      score += 3;
    }
  }

  // 5. Price Proximity (within +/- 40% of base price)
  if (current.base_price > 0 && candidate.base_price > 0) {
    const priceRatio = candidate.base_price / current.base_price;
    if (priceRatio >= 0.6 && priceRatio <= 1.4) {
      score += 5;
    }
  }

  // 6. Social proof & high rating bonus
  if (candidate.is_best_seller) score += 4;
  if (candidate.is_featured) score += 2;
  if ((candidate.avg_rating || 0) >= 4.8) score += 3;

  return score;
}

/**
 * Returns a ranked list of related products for a given product
 */
export function getRelatedProducts(
  currentProduct: Product,
  options: RelatedProductOptions = {}
): Product[] {
  const limit = options.limit || 10;
  const catalog = options.catalog && options.catalog.length > 0 ? options.catalog : MOCK_PRODUCTS;

  // Filter out the current product and published check
  const candidates = catalog.filter(
    (p) => p.id !== currentProduct.id && p.slug !== currentProduct.slug && (p.status === "published" || !p.status)
  );

  // Score each candidate
  const scored = candidates.map((candidate) => ({
    product: candidate,
    score: calculateRelevanceScore(currentProduct, candidate),
  }));

  // Sort by score descending
  scored.sort((a, b) => b.score - a.score);

  // Take top scored products
  const topMatches = scored.filter((item) => item.score > 0).map((item) => item.product);

  // If we have enough, return top limit
  if (topMatches.length >= limit) {
    return topMatches.slice(0, limit);
  }

  // If catalog has fewer exact matches, backfill with remaining products
  // (preferring same category, then best sellers, then any others) to ensure a rich carousel
  const existingIds = new Set([currentProduct.id, ...topMatches.map((p) => p.id)]);
  const backfillPool = candidates
    .filter((p) => !existingIds.has(p.id))
    .sort((a, b) => {
      // Prioritize same category first
      if (a.category_id === currentProduct.category_id && b.category_id !== currentProduct.category_id) return -1;
      if (b.category_id === currentProduct.category_id && a.category_id !== currentProduct.category_id) return 1;
      // Then best sellers
      if (a.is_best_seller && !b.is_best_seller) return -1;
      if (b.is_best_seller && !a.is_best_seller) return 1;
      // Then higher ratings
      return (b.avg_rating || 0) - (a.avg_rating || 0);
    });

  const combined = [...topMatches, ...backfillPool];
  return combined.slice(0, Math.max(limit, combined.length));
}
