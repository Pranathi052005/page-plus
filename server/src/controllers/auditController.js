import { validateAndNormalizeUrl } from '../utils/urlValidator.js';
import { analyzeUrl } from '../services/analyzer.js';

/**
 * Controller to handle web page audits.
 * POST /api/audit
 */
export async function auditPage(req, res) {
  try {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({
        success: false,
        errorType: 'MISSING_URL',
        errorMessage: 'A target URL is required to run the diagnostics.'
      });
    }

    const normalizedUrl = validateAndNormalizeUrl(url);
    if (!normalizedUrl) {
      return res.status(400).json({
        success: false,
        errorType: 'INVALID_URL',
        errorMessage: 'Malformed URL: Please provide a valid web address starting with http:// or https://'
      });
    }

    // Trigger analysis
    const report = await analyzeUrl(normalizedUrl);

    // Return audit report
    return res.status(200).json(report);
  } catch (error) {
    console.error('Audit controller exception:', error);
    return res.status(500).json({
      success: false,
      errorType: 'SERVER_EXCEPTION',
      errorMessage: 'Diagnostics failed: The audit engine encountered an internal server error.'
    });
  }
}
