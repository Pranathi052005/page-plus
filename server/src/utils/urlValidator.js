/**
 * Validates and normalizes a user-provided URL.
 * @param {string} urlString 
 * @returns {string|null} The normalized URL or null if invalid.
 */
export function validateAndNormalizeUrl(urlString) {
  if (!urlString || typeof urlString !== 'string') {
    return null;
  }

  let trimmed = urlString.trim();
  
  // If user omitted http/https, prepend https:// as default
  if (!/^https?:\/\//i.test(trimmed)) {
    trimmed = 'https://' + trimmed;
  }

  try {
    const parsed = new URL(trimmed);
    
    // Ensure protocol is valid HTTP/HTTPS
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return null;
    }

    // Ensure hostname is present and not empty, and has a TLD or valid localhost
    if (!parsed.hostname || parsed.hostname.split('.').length < 2 && parsed.hostname !== 'localhost') {
      return null;
    }

    return parsed.href;
  } catch (error) {
    return null;
  }
}
