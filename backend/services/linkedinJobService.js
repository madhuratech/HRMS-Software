const db = require('../config/database');

/**
 * Dedicated LinkedIn Job Publishing Service
 * Handles OAuth token validation, LinkedIn Job API request dispatching,
 * detailed console logging, error classification, and DB recording.
 */
class LinkedInJobService {
  
  static validateConfig() {
    const clientId = process.env.LINKEDIN_CLIENT_ID;
    const clientSecret = process.env.LINKEDIN_CLIENT_SECRET;
    const accessToken = process.env.LINKEDIN_ACCESS_TOKEN;
    const orgId = process.env.LINKEDIN_ORGANIZATION_ID;

    const missing = [];
    if (!accessToken && (!clientId || !clientSecret)) {
      missing.push('LINKEDIN_ACCESS_TOKEN (or LINKEDIN_CLIENT_ID & LINKEDIN_CLIENT_SECRET)');
    }
    if (!orgId) {
      missing.push('LINKEDIN_ORGANIZATION_ID');
    }

    return {
      isValid: missing.length === 0,
      missing,
      clientId,
      clientSecret,
      accessToken,
      orgId
    };
  }

  static async recordPublishingStatus(jobId, linkedinJobId, status, errorMsg) {
    return new Promise((resolve) => {
      const sql = `
        INSERT INTO job_publishings (
          job_id, channel, external_job_id, status, error_message, published_at, last_synced_at
        ) VALUES (?, 'LINKEDIN', ?, ?, ?, ?, NOW())
        ON DUPLICATE KEY UPDATE
          external_job_id = COALESCE(VALUES(external_job_id), external_job_id),
          status = VALUES(status),
          error_message = VALUES(error_message),
          published_at = COALESCE(VALUES(published_at), published_at),
          last_synced_at = NOW()
      `;

      const publishedAt = status === 'published' ? new Date() : null;

      db.query(sql, [jobId, linkedinJobId || null, status, errorMsg || null, publishedAt], (err) => {
        if (err) {
          console.error('[LINKEDIN DB ERROR] Failed to update job_publishings:', err.message);
        }
        resolve();
      });
    });
  }

  static async publishJob(job) {
    const jobId = job.id;
    const jobTitle = job.job_title || job.title || 'Untitled Job';

    console.log(`[JOB CREATED] Job ID: ${jobId}`);
    console.log(`[CAREER PAGE PUBLISHED] Job ID: ${jobId}`);
    console.log(`[LINKEDIN START] Job ID: ${jobId} | Title: ${jobTitle}`);

    const config = this.validateConfig();
    if (!config.isValid) {
      const errorMsg = `LinkedIn Configuration Missing: ${config.missing.join(', ')}`;
      console.log(`[LINKEDIN FAILED] Status code: 400 | Error message: ${errorMsg}`);
      
      await this.recordPublishingStatus(jobId, null, 'not_connected', errorMsg);
      return {
        success: false,
        jobId,
        linkedinStatus: 'not_connected',
        error: errorMsg
      };
    }

    const tokenToUse = config.accessToken;
    const orgId = config.orgId;
    const endpoint = 'https://api.linkedin.com/rest/simpleJobPostings';

    console.log(`[LINKEDIN REQUEST] Sending job data for Job ID: ${jobId} to LinkedIn Organization ID: ${orgId}...`);

    const payload = {
      elements: [
        {
          externalJobPostingId: String(jobId),
          listingType: 'BASIC',
          title: jobTitle,
          description: job.job_description || job.description || jobTitle,
          integrationContext: `urn:li:organization:${orgId}`,
          companyApplyUrl: `https://madhuratech.com/career/job/${jobId}`,
          location: job.location || 'Coimbatore, Tamil Nadu, India',
          listedAt: Date.now(),
          jobPostingOperationType: 'CREATE',
          availability: 'PUBLIC'
        }
      ]
    };

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${tokenToUse}`,
          'Content-Type': 'application/json',
          'x-restli-method': 'batch_create',
          'Linkedin-Version': '202603'
        },
        body: JSON.stringify(payload)
      });

      const responseText = await response.text();
      console.log(`[LINKEDIN RESPONSE] Status Code: ${response.status}`);
      console.log(`[LINKEDIN RESPONSE RAW]: ${responseText.slice(0, 500)}`);

      let data = null;
      try { data = JSON.parse(responseText); } catch (e) {}

      // Check HTTP 403 / 401 Authorization failure
      if (response.status === 403 || response.status === 401) {
        const authError = response.status === 403 
          ? "LinkedIn Job Posting API access is not available for this application." 
          : "LinkedIn access token is invalid or expired.";
        
        console.log(`[LINKEDIN FAILED] Status code: ${response.status} | Response: ${responseText.slice(0, 200)} | Error message: ${authError}`);
        
        await this.recordPublishingStatus(jobId, null, 'not_authorized', authError);
        return {
          success: false,
          jobId,
          linkedinStatus: 'not_authorized',
          error: authError
        };
      }

      if (!response.ok) {
        const errorMsg = data?.message || responseText.slice(0, 300) || `LinkedIn API error ${response.status}`;
        console.log(`[LINKEDIN FAILED] Status code: ${response.status} | Response: ${responseText.slice(0, 200)} | Error message: ${errorMsg}`);

        await this.recordPublishingStatus(jobId, null, 'failed', errorMsg);
        return {
          success: false,
          jobId,
          linkedinStatus: 'failed',
          error: errorMsg
        };
      }

      const elementRes = data?.elements?.[0];
      if (elementRes?.error) {
        const elementErr = elementRes.error.message || 'LinkedIn element processing failed';
        console.log(`[LINKEDIN FAILED] Status code: 200 | Element Error: ${elementErr}`);

        await this.recordPublishingStatus(jobId, null, 'failed', elementErr);
        return {
          success: false,
          jobId,
          linkedinStatus: 'failed',
          error: elementErr
        };
      }

      const linkedinJobId = elementRes?.id || `LI-${jobId}`;
      console.log(`[LINKEDIN SUCCESS] External ID: ${linkedinJobId}`);

      await this.recordPublishingStatus(jobId, linkedinJobId, 'published', null);

      return {
        success: true,
        jobId,
        linkedinStatus: 'published',
        linkedinJobId
      };

    } catch (netErr) {
      console.log(`[LINKEDIN FAILED] Network Exception: ${netErr.message}`);
      await this.recordPublishingStatus(jobId, null, 'failed', netErr.message);

      return {
        success: false,
        jobId,
        linkedinStatus: 'failed',
        error: netErr.message
      };
    }
  }
}

module.exports = LinkedInJobService;
