import axios from 'axios';
import * as cheerio from 'cheerio';
import https from 'https';

/**
 * Checks if the request error is due to SSL/TLS handshake or certificate failures.
 * @param {Error} error 
 * @returns {boolean}
 */
function isSslError(error) {
  const code = error.code || '';
  const message = error.message || '';
  return (
    code.includes('CERT') ||
    code.includes('TLS') ||
    code.includes('SSL') ||
    message.toLowerCase().includes('certificate') ||
    message.toLowerCase().includes('ssl') ||
    message.toLowerCase().includes('tls')
  );
}

/**
 * Analyzes a URL and returns a structured audit report.
 * @param {string} url 
 * @returns {Promise<object>}
 */
export async function analyzeUrl(url) {
  const startTime = Date.now();
  
  // Custom agent to allow connection verification or SSL check
  // We keep standard verification enabled first
  const client = axios.create({
    timeout: 10000, // 10s timeout
    maxRedirects: 5,
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) PagePulseAnalyzer/1.0',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    }
  });

  try {
    // 1. Perform request
    const response = await client.get(url);
    const responseTimeMs = Date.now() - startTime;
    
    const contentType = response.headers['content-type'] || '';
    const finalUrl = response.request?.res?.responseUrl || response.config?.url || url;

    // 2. Validate content type (strictly HTML)
    if (!contentType.toLowerCase().includes('text/html')) {
      return {
        url,
        finalUrl,
        success: false,
        errorType: 'INVALID_CONTENT',
        errorMessage: `Not an HTML page (detected Content-Type: ${contentType.split(';')[0]})`,
        responseTimeMs,
        healthScore: 0
      };
    }

    const html = response.data;
    if (typeof html !== 'string') {
      return {
        url,
        finalUrl,
        success: false,
        errorType: 'EMPTY_CONTENT',
        errorMessage: 'The response did not return a valid HTML text body.',
        responseTimeMs,
        healthScore: 0
      };
    }

    // 3. Parse HTML using Cheerio
    const $ = cheerio.load(html);

    // Title
    const titleText = $('title').first().text().trim();
    const hasTitle = titleText.length > 0;

    // Meta description (look for meta name="description" case-insensitive)
    let metaDescriptionText = '';
    $('meta').each((i, el) => {
      const name = $(el).attr('name');
      const content = $(el).attr('content');
      if (name && name.toLowerCase() === 'description' && content) {
        metaDescriptionText = content.trim();
      }
    });
    const hasMetaDescription = metaDescriptionText.length > 0;

    // H1 tags
    const h1Count = $('h1').length;

    // Images alt analysis
    const imgTags = $('img');
    const totalImages = imgTags.length;
    let missingAltCount = 0;
    
    imgTags.each((i, el) => {
      const alt = $(el).attr('alt');
      // If alt attribute is absent, or consists only of spaces (which is technically sometimes decorative, but for general audits we count empty/missing alt as missing if it's not explicitly marked empty or we can flag all missing/empty)
      if (alt === undefined || alt === null || alt.trim() === '') {
        missingAltCount++;
      }
    });
    
    const missingAltPercent = totalImages > 0 ? Math.round((missingAltCount / totalImages) * 100) : 0;
    const altScore = totalImages > 0 ? 100 - missingAltPercent : 100;

    // Word Count (approximate visible text)
    const bodyCopy = $('body').clone();
    bodyCopy.find('script, style, noscript, iframe, svg, head, header, footer, nav, aside').remove();
    const visibleText = bodyCopy.text();
    const words = visibleText.trim().split(/\s+/).filter(w => w.length > 0);
    const wordCount = words.length;

    // 4. Compute Health Score (out of 100)
    let healthScore = 100;
    const deductions = [];

    // Reachability is true if we are here
    
    // Title deduction (-15)
    if (!hasTitle) {
      healthScore -= 15;
      deductions.push({ metric: 'title', value: 15, reason: 'Missing page title' });
    }

    // Meta description deduction (-10)
    if (!hasMetaDescription) {
      healthScore -= 10;
      deductions.push({ metric: 'metaDescription', value: 10, reason: 'Missing meta description' });
    }

    // H1 deduction (-10) if 0 or > 1
    if (h1Count === 0) {
      healthScore -= 10;
      deductions.push({ metric: 'h1', value: 10, reason: 'No H1 tags found (exactly one is recommended)' });
    } else if (h1Count > 1) {
      healthScore -= 10;
      deductions.push({ metric: 'h1', value: 10, reason: `Multiple H1 tags (${h1Count}) found (exactly one is recommended)` });
    }

    // Missing image alts deduction (-1 per image, cap at -15)
    if (missingAltCount > 0) {
      const deductionVal = Math.min(15, missingAltCount);
      healthScore -= deductionVal;
      deductions.push({ 
        metric: 'images', 
        value: deductionVal, 
        reason: `${missingAltCount} image${missingAltCount > 1 ? 's' : ''} missing alt text (-${deductionVal} pts)` 
      });
    }

    // Slow response deduction (-10 if > 3000ms)
    if (responseTimeMs > 3000) {
      healthScore -= 10;
      deductions.push({ metric: 'responseTime', value: 10, reason: `Slow response time: ${(responseTimeMs / 1000).toFixed(2)}s (>3s)` });
    }

    // Clamp score
    healthScore = Math.max(0, healthScore);

    return {
      url,
      finalUrl,
      success: true,
      responseTimeMs,
      contentType,
      healthScore,
      deductions,
      metrics: {
        reachability: {
          success: true,
          status: response.status,
          message: `Site returned status code ${response.status} (OK)`
        },
        responseTime: {
          value: responseTimeMs,
          passed: responseTimeMs <= 3000,
          message: responseTimeMs <= 3000 
            ? `Fast response time (${responseTimeMs}ms)`
            : `Slow response time (${responseTimeMs}ms, exceeded 3.0s threshold)`
        },
        title: {
          exists: hasTitle,
          text: titleText || null,
          message: hasTitle ? 'Page title is defined' : 'Title element (<title>) is missing or empty'
        },
        metaDescription: {
          exists: hasMetaDescription,
          text: metaDescriptionText || null,
          message: hasMetaDescription ? 'Meta description is defined' : 'Meta description tag is missing or empty'
        },
        h1: {
          count: h1Count,
          passed: h1Count === 1,
          message: h1Count === 1 
            ? 'Exactly 1 H1 tag found' 
            : h1Count === 0 
              ? 'No H1 tags found on the page' 
              : `Found ${h1Count} H1 tags (only 1 is recommended)`
        },
        images: {
          total: totalImages,
          missingAlt: missingAltCount,
          missingAltPercent,
          score: altScore,
          passed: missingAltCount === 0,
          message: totalImages === 0 
            ? 'No images found on page' 
            : `${totalImages - missingAltCount} of ${totalImages} images have alt attributes (${100 - missingAltPercent}% score)`
        },
        wordCount: {
          value: wordCount,
          message: `Found approximately ${wordCount.toLocaleString()} words of visible text`
        }
      }
    };
  } catch (error) {
    const responseTimeMs = Date.now() - startTime;
    
    // Check if it's an SSL error
    if (isSslError(error)) {
      return {
        url,
        success: false,
        errorType: 'SSL_ERROR',
        errorMessage: 'SSL Handshake Failed: The site has an invalid, expired, or self-signed certificate.',
        responseTimeMs,
        healthScore: 0
      };
    }

    // Check if it's a timeout error
    if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
      return {
        url,
        success: false,
        errorType: 'TIMEOUT',
        errorMessage: 'Request timed out: The site took longer than 10 seconds to respond.',
        responseTimeMs,
        healthScore: 0
      };
    }

    // Check DNS/Connection errors
    if (error.code === 'ENOTFOUND' || error.code === 'EAI_AGAIN') {
      return {
        url,
        success: false,
        errorType: 'UNREACHABLE',
        errorMessage: 'Site unreachable: DNS resolution failed or the domain does not exist.',
        responseTimeMs,
        healthScore: 0
      };
    }

    // Connect refused or similar network failures
    if (error.code === 'ECONNREFUSED' || error.code === 'ECONNRESET') {
      return {
        url,
        success: false,
        errorType: 'CONN_REFUSED',
        errorMessage: 'Site unreachable: Connection refused or reset by the target host.',
        responseTimeMs,
        healthScore: 0
      };
    }

    // If HTTP status is outside 2xx, Axios throws error with a response. Let's capture it.
    if (error.response) {
      const contentType = error.response.headers['content-type'] || '';
      return {
        url,
        finalUrl: error.response.request?.res?.responseUrl || error.response.config?.url || url,
        success: false,
        errorType: 'HTTP_STATUS_ERROR',
        errorMessage: `Target server returned an error status code: ${error.response.status}`,
        responseTimeMs,
        healthScore: 0,
        metrics: {
          reachability: {
            success: false,
            status: error.response.status,
            message: `Server responded with status code ${error.response.status}`
          }
        }
      };
    }

    // Default error fallback
    return {
      url,
      success: false,
      errorType: 'UNKNOWN',
      errorMessage: error.message || 'An unknown network error occurred while auditing the page.',
      responseTimeMs,
      healthScore: 0
    };
  }
}
