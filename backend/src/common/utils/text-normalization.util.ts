/**
 * Utility functions for Portuguese text normalization
 */

/**
 * Normalizes Portuguese text by removing accents and special characters
 * This helps improve search quality and embedding consistency
 * 
 * @param text - The text to normalize
 * @returns - Normalized text with Portuguese characters converted to ASCII equivalents
 */
export function normalizePortugueseText(text: string): string {
  return text
    // Normalize Portuguese characters (case insensitive)
    .replace(/[àáâãäåÀÁÂÃÄÅ]/g, (match) => match === match.toLowerCase() ? 'a' : 'A')
    .replace(/[èéêëÈÉÊË]/g, (match) => match === match.toLowerCase() ? 'e' : 'E')
    .replace(/[ìíîïÌÍÎÏ]/g, (match) => match === match.toLowerCase() ? 'i' : 'I')
    .replace(/[òóôõöÒÓÔÕÖ]/g, (match) => match === match.toLowerCase() ? 'o' : 'O')
    .replace(/[ùúûüÙÚÛÜ]/g, (match) => match === match.toLowerCase() ? 'u' : 'U')
    .replace(/[çÇ]/g, (match) => match === match.toLowerCase() ? 'c' : 'C')
    .replace(/[ñÑ]/g, (match) => match === match.toLowerCase() ? 'n' : 'N')
    // Remove other special characters but keep basic punctuation and spaces
    .replace(/[^\w\s\-.,!?]/g, '')
    // Clean up extra whitespace
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Creates a search-friendly version of text by normalizing and lowercasing
 * 
 * @param text - The text to prepare for search
 * @returns - Search-ready normalized text
 */
export function prepareTextForSearch(text: string): string {
  return normalizePortugueseText(text).toLowerCase();
}
