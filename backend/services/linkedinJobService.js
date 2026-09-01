const db = require('../config/database');
const OAuthIntegrationService = require('./OAuthIntegrationService');

function getSlug(title, id) {
  const cleanTitle = String(title || 'job')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-');
  return `${cleanTitle}-${id}`;
}

/**
 * Dedicated LinkedIn Posts Service for Automated Company/Member Posts
 * Endpoint: POST https://api.linkedin.com/rest/posts
 */
class LinkedInJobService {

  static async getExistingPublishing(jobId) {
    return new Promise((resolve) => {
      db.query(
        "SELECT * FROM job_publishings WHERE job_id = ? AND channel = 'LINKEDIN' LIMIT 1",
        [jobId],
        (err, rows) => {
          if (err || !rows || rows.length === 0) return resolve(null);
          return resolve(rows[0]);
        }
      );
    });
  }

  static async recordPublishingStatus(jobId, externalJobId, status, errorMsg, externalUrl = null) {
    return new Promise((resolve) => {
      const sql = `
        INSERT INTO job_publishings (
          job_id, channel, external_job_id, status, external_url, error_message, published_at, last_synced_at
        ) VALUES (?, 'LINKEDIN', ?, ?, ?, ?, ?, NOW())
        ON DUPLICATE KEY UPDATE
          external_job_id = COALESCE(VALUES(external_job_id), external_job_id),
          status = VALUES(status),
          external_url = COALESCE(VALUES(external_url), external_url),
          error_message = VALUES(error_message),
          published_at = COALESCE(VALUES(published_at), published_at),
          last_synced_at = NOW()
      `;

      const normalizedStatus = String(status).toUpperCase();
      const publishedAt = (normalizedStatus === 'PUBLISHED') ? new Date() : null;

      db.query(sql, [jobId, externalJobId || null, normalizedStatus, externalUrl || null, errorMsg || null, publishedAt], (err) => {
        if (err) {
          console.error('[LinkedIn DB Error] Failed to record status:', err.message);
        }
        resolve();
      });
    });
  }

  /**
   * Formats the official hiring announcement text for LinkedIn feed
   */
  static formatPostContent(job, applyUrl) {
    const title = job.job_title || job.title || 'Career Opportunity';
    const dept = job.department_name || job.department || 'Software Development';
    const loc = job.location || 'Coimbatore, Tamil Nadu';
    const empType = job.employment_type || 'Full Time';
    const vacancies = job.vacancies || 1;

    let text = `🚀 WE ARE HIRING!\n\n`;
    text += `${title}\n\n`;
    text += `📍 Location: ${loc}\n`;
    text += `🏢 Department: ${dept}\n`;
    text += `💼 Job Type: ${empType}\n`;
    text += `👥 Vacancies: ${vacancies}\n\n`;

    if (job.job_description) {
      const cleanDesc = String(job.job_description).replace(/<[^>]*>?/gm, '').trim();
      const snippet = cleanDesc.length > 200 ? cleanDesc.slice(0, 197) + '...' : cleanDesc;
      text += `${snippet}\n\n`;
    }

    text += `Join Madhura Technologies!\n\n`;
    text += `Apply now:\n${applyUrl}\n\n`;
    text += `#Hiring #Jobs #${dept.replace(/[^a-zA-Z0-9]/g, '')} #MadhuraTechnologies`;

    return text;
  }

  /**
   * Publishes an automated server-side organic post to LinkedIn feed
   */
  static async publishJob(job) {
    const jobId = job.id;
    const applyUrl = 'https://madhuratech.com/career';

    console.log('[LinkedIn] Starting automatic post publishing');

    // 1. Fetch token and account identity from database
    const integration = await OAuthIntegrationService.getLinkedInIntegration();
    const token = integration.accessToken;
    const isExpired = integration.isExpired;
    const hasToken = integration.hasToken;

    console.log(`[LinkedIn] Token found: ${token ? 'YES' : 'NO'}`);
    console.log(`[LinkedIn] Token expired: ${isExpired ? 'YES' : 'NO'}`);

    // Validate token existence
    if (!token || token.trim().length < 20) {
      const errorMsg = 'LinkedIn account is not connected. Please connect LinkedIn first.';
      console.log(`[LinkedIn] Aborting: ${errorMsg}`);
      await this.recordPublishingStatus(jobId, null, 'FAILED', errorMsg, null);
      return {
        success: false,
        status: 'FAILED',
        errorMessage: errorMsg
      };
    }

    // Validate token expiry
    if (isExpired) {
      const errorMsg = 'LinkedIn access token has expired. Please reconnect LinkedIn.';
      console.log(`[LinkedIn] Aborting: ${errorMsg}`);
      await this.recordPublishingStatus(jobId, null, 'FAILED', errorMsg, null);
      return {
        success: false,
        status: 'FAILED',
        errorMessage: errorMsg
      };
    }

    // 2. Duplicate prevention check
    const existing = await this.getExistingPublishing(jobId);
    if (existing && existing.status === 'PUBLISHED' && existing.external_job_id) {
      console.log(`[LinkedIn] Job ID: ${jobId} already published to LinkedIn (Post ID: ${existing.external_job_id}). Skipping duplicate post.`);
      return {
        success: true,
        status: 'PUBLISHED',
        externalJobId: existing.external_job_id,
        externalUrl: existing.external_url,
        alreadyPublished: true,
        lastSyncedAt: existing.published_at || new Date()
      };
    }

    // 3. Determine Author URN (Organization or Member)
    let authorUrn = integration.organizationUrn;
    if (!authorUrn && process.env.LINKEDIN_ORGANIZATION_ID) {
      authorUrn = `urn:li:organization:${process.env.LINKEDIN_ORGANIZATION_ID}`;
    }
    if (!authorUrn && integration.memberUrn) {
      authorUrn = integration.memberUrn;
    }
    if (!authorUrn) {
      authorUrn = 'urn:li:organization:109901015';
    }

    console.log(`[LinkedIn] Author URN: ${authorUrn}`);

    const endpoint = 'https://api.linkedin.com/rest/posts';
    const postContent = this.formatPostContent(job, applyUrl);

    const makePostRequest = async (author) => {
      const payload = {
        author,
        commentary: postContent,
        visibility: 'PUBLIC',
        distribution: {
          feedDistribution: 'MAIN_FEED',
          targetEntities: [],
          thirdPartyDistributionChannels: []
        },
        lifecycleState: 'PUBLISHED',
        isReshareDisabledByAuthor: false
      };

      console.log(`[LinkedIn] Sending post request as: ${author}`);

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'X-Restli-Protocol-Version': '2.0.0',
          'Linkedin-Version': '202602'
        },
        body: JSON.stringify(payload)
      });

      console.log(`[LinkedIn] Response status: ${response.status}`);
      const responseText = await response.text();
      console.log(`[LinkedIn] Response body: ${responseText.slice(0, 400)}`);

      let data = null;
      try { data = JSON.parse(responseText); } catch (e) {}

      return { response, responseText, data };
    };

    try {
      let { response, responseText, data } = await makePostRequest(authorUrn);

      // If posting as Organization failed with 403 / unauthorized scope, fallback to Member URN if available
      if (response.status === 403 && authorUrn.startsWith('urn:li:organization:') && integration.memberUrn) {
        console.log(`[LinkedIn] Organization posting not permitted. Retrying as authenticated member: ${integration.memberUrn}`);
        const memberResult = await makePostRequest(integration.memberUrn);
        response = memberResult.response;
        responseText = memberResult.responseText;
        data = memberResult.data;
        if (response.status === 201 || response.status === 200) {
          authorUrn = integration.memberUrn;
        }
      }

      // 201 Created or 200 OK -> Post successfully published!
      if (response.status === 201 || response.status === 200) {
        const postUrn = response.headers.get('x-restli-id') || data?.id;
        const postUrl = postUrn ? `https://www.linkedin.com/feed/update/${encodeURIComponent(postUrn)}` : 'https://www.linkedin.com/feed/';

        console.log(`[LinkedIn] Token expired: NO`);
        console.log(`[LinkedIn] Post ID: ${postUrn}`);
        console.log('[LinkedIn] Post published successfully');

        await this.recordPublishingStatus(jobId, postUrn, 'PUBLISHED', null, postUrl);

        return {
          success: true,
          status: 'PUBLISHED',
          externalJobId: postUrn,
          externalUrl: postUrl,
          lastSyncedAt: new Date()
        };
      }

      // 401 Unauthorized (Expired or Revoked Token)
      if (response.status === 401) {
        console.log('[LinkedIn] Token expired: YES');
        const errorMsg = 'LinkedIn access token has expired. Please reconnect LinkedIn.';
        await this.recordPublishingStatus(jobId, null, 'FAILED', errorMsg, null);
        return {
          success: false,
          status: 'FAILED',
          errorMessage: errorMsg
        };
      }

      // 403 Forbidden (Scope or Organization Posting Permission Missing)
      if (response.status === 403) {
        const errorMsg = authorUrn.startsWith('urn:li:organization:')
          ? 'LinkedIn organization posting permission is not authorized for this application.'
          : 'LinkedIn posting permission is not available for this application.';
        await this.recordPublishingStatus(jobId, null, 'FAILED', errorMsg, null);
        return {
          success: false,
          status: 'FAILED',
          errorMessage: errorMsg
        };
      }

      // Other API errors (preserve real API message)
      const errorMsg = data?.message || responseText.slice(0, 300) || `LinkedIn API error (${response.status})`;
      await this.recordPublishingStatus(jobId, null, 'FAILED', errorMsg, null);

      return {
        success: false,
        status: 'FAILED',
        errorMessage: errorMsg
      };

    } catch (netErr) {
      console.log(`[LinkedIn] Network Exception: ${netErr.message}`);
      await this.recordPublishingStatus(jobId, null, 'FAILED', netErr.message, null);
      return {
        success: false,
        status: 'FAILED',
        errorMessage: netErr.message
      };
    }
  }
}

module.exports = LinkedInJobService;
