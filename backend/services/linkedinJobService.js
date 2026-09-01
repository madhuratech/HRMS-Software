const db = require('../config/database');

function getSlug(title, id) {
  const cleanTitle = String(title || 'job')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-');
  return `${cleanTitle}-${id}`;
}

/**
 * Dedicated LinkedIn Company Page Posts Service
 * Handles server-side automated organic posts to the Madhura Technologies LinkedIn Company Page
 * Endpoint: POST https://api.linkedin.com/rest/posts
 */
class LinkedInJobService {

  static getDiagnostics() {
    const clientId = process.env.LINKEDIN_CLIENT_ID;
    const clientSecret = process.env.LINKEDIN_CLIENT_SECRET;
    const accessToken = process.env.LINKEDIN_ACCESS_TOKEN;
    const orgId = process.env.LINKEDIN_ORGANIZATION_ID || '109901015';

    return {
      hasClientId: !!clientId,
      hasClientSecret: !!clientSecret,
      hasAccessToken: !!(accessToken && accessToken.length > 20),
      orgId
    };
  }

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
   * Formats the official hiring announcement text for the LinkedIn company feed
   */
  static formatPostContent(job, applyUrl) {
    const title = job.job_title || job.title || 'Career Opportunity';
    const dept = job.department_name || job.department || 'Software Development';
    const loc = job.location || 'Coimbatore';
    const empType = job.employment_type || 'Full Time';
    const tagTitle = title.replace(/[^a-zA-Z0-9]/g, '');

    let text = `🚀 WE ARE HIRING!\n\n`;
    text += `${title}\n\n`;
    text += `📍 Location: ${loc}\n`;
    text += `💼 Type: ${empType}\n`;
    text += `🏢 Department: ${dept}\n\n`;

    if (job.job_description) {
      const cleanDesc = String(job.job_description).replace(/<[^>]*>?/gm, '').trim();
      const snippet = cleanDesc.length > 200 ? cleanDesc.slice(0, 197) + '...' : cleanDesc;
      text += `${snippet}\n\n`;
    } else {
      text += `Join Madhura Technologies and build amazing products with our team.\n\n`;
    }

    text += `Apply now:\n${applyUrl}\n\n`;
    text += `#Hiring #JobOpening #${tagTitle} #MadhuraTechnologies`;

    return text;
  }

  /**
   * Publishes an automated server-side organic post to the LinkedIn Company Page
   */
  static async publishJob(job) {
    const jobId = job.id;
    const jobTitle = job.job_title || job.title || 'Untitled Job';
    const slug = getSlug(jobTitle, jobId);
    const applyUrl = `https://madhuratech.com/career/job/${slug}`;

    const diag = this.getDiagnostics();
    const orgId = diag.orgId;

    console.log('[LinkedIn] Starting organization post');
    console.log(`[LinkedIn] Organization ID: ${orgId}`);
    console.log(`[LinkedIn] Job ID: ${jobId}`);

    // Prevent duplicate publishing if already successfully posted to LinkedIn
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

    // Check if token exists
    if (!diag.hasAccessToken) {
      const errorMsg = 'LinkedIn organization posting permission is not authorized for this application. Access token is missing.';
      console.log(`[LinkedIn] Post failed: ${errorMsg}`);
      await this.recordPublishingStatus(jobId, null, 'FAILED', errorMsg, null);
      return {
        success: false,
        status: 'FAILED',
        errorMessage: errorMsg
      };
    }

    const token = process.env.LINKEDIN_ACCESS_TOKEN;
    const endpoint = 'https://api.linkedin.com/rest/posts';
    const postContent = this.formatPostContent(job, applyUrl);

    const payload = {
      author: `urn:li:organization:${orgId}`,
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

    console.log('[LinkedIn] Calling Posts API');

    try {
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
      let data = null;
      try { data = JSON.parse(responseText); } catch (e) {}

      // 201 Created or 200 OK -> Post successfully published!
      if (response.status === 201 || response.status === 200) {
        const postUrn = response.headers.get('x-restli-id') || data?.id;
        const postUrl = postUrn ? `https://www.linkedin.com/feed/update/${encodeURIComponent(postUrn)}` : `https://www.linkedin.com/company/${orgId}/`;

        console.log(`[LinkedIn] Post ID: ${postUrn}`);
        console.log('[LinkedIn] Post successful');

        await this.recordPublishingStatus(jobId, postUrn, 'PUBLISHED', null, postUrl);

        return {
          success: true,
          status: 'PUBLISHED',
          externalJobId: postUrn,
          externalUrl: postUrl,
          lastSyncedAt: new Date()
        };
      }

      // 401 / 403 / 400 Error Handling
      let errorMsg = data?.message || responseText.slice(0, 300) || `LinkedIn API error (${response.status})`;
      if (response.status === 403) {
        errorMsg = 'LinkedIn organization posting permission (w_organization_social) is not authorized or administrator role is missing for this company page.';
      } else if (response.status === 401) {
        errorMsg = 'LinkedIn access token is expired or invalid. Please re-authenticate via OAuth.';
      }

      console.log(`[LinkedIn] Post failed with error: ${errorMsg}`);
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

  static async closeJob(job) {
    const jobId = job.id;
    await this.recordPublishingStatus(jobId, null, 'CLOSED', null, null);
    return { success: true, status: 'CLOSED', jobId };
  }

  static async deleteJob(job) {
    const jobId = job.id;
    await this.recordPublishingStatus(jobId, null, 'DELETED', null, null);
    return { success: true, status: 'DELETED', jobId };
  }
}

module.exports = LinkedInJobService;
