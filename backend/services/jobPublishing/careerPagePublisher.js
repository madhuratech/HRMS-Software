const db = require('../../config/database');

function getSlug(title, id) {
  const cleanTitle = String(title || 'job-opening')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, ' ')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

  return `${cleanTitle}-${id}`;
}

class CareerPagePublisher {

  static async publish(job) {
    return new Promise((resolve) => {
      const jobTitle = job.job_title || job.title || 'job-opening';
      const slug = getSlug(jobTitle, job.id);
      const externalUrl = `https://madhuratech.com/career`;

      const sql = `
        UPDATE requirements
        SET
          status = 'Published',
          opening_date = COALESCE(opening_date, CURRENT_DATE()),
          deleted_at = NULL
        WHERE id = ?
      `;

      db.query(sql, [job.id], (err, result) => {
        if (err) {
          console.error('[CareerPagePublisher.publish] Error:', err);
          return resolve({
            success: false,
            status: 'FAILED',
            errorMessage: err.message
          });
        }

        if (!result || result.affectedRows === 0) {
          console.warn(`[CareerPagePublisher.publish] No rows found for job ID: ${job.id}`);
          return resolve({
            success: false,
            status: 'NOT_FOUND',
            externalJobId: String(job.id),
            errorMessage: `Job ID ${job.id} was not found in requirements table`
          });
        }

        return resolve({
          success: true,
          status: 'PUBLISHED',
          externalJobId: String(job.id),
          externalUrl: externalUrl,
          lastSyncedAt: new Date()
        });
      });
    });
  }

  static async update(job) {
    return this.publish(job);
  }

  static async close(job) {
    return new Promise((resolve) => {
      const sql = `
        UPDATE requirements
        SET
          status = 'Closed',
          closing_date = COALESCE(closing_date, CURRENT_DATE())
        WHERE id = ?
      `;

      db.query(sql, [job.id], (err, result) => {
        if (err) {
          console.error('[CareerPagePublisher.close] Error:', err);
          return resolve({
            success: false,
            status: 'FAILED',
            errorMessage: err.message
          });
        }

        if (!result || result.affectedRows === 0) {
          return resolve({
            success: false,
            status: 'NOT_FOUND',
            errorMessage: `Job ID ${job.id} not found`,
            externalJobId: String(job.id)
          });
        }

        return resolve({
          success: true,
          status: 'CLOSED',
          externalJobId: String(job.id),
          lastSyncedAt: new Date()
        });
      });
    });
  }

  static async delete(job) {
    return new Promise((resolve) => {
      const sql = `
        UPDATE requirements
        SET
          status = 'Deleted',
          deleted_at = NOW()
        WHERE id = ?
      `;

      db.query(sql, [job.id], (err, result) => {
        if (err) {
          console.error('[CareerPagePublisher.delete] Error:', err);
          return resolve({
            success: false,
            status: 'FAILED',
            errorMessage: err.message
          });
        }

        return resolve({
          success: true,
          status: 'DELETED',
          externalJobId: String(job.id),
          lastSyncedAt: new Date()
        });
      });
    });
  }
}

module.exports = CareerPagePublisher;