const db = require('../../config/database');

function getSlug(title, id) {
  const cleanTitle = String(title || 'job')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-');
  return `${cleanTitle}-${id}`;
}

class CareerPagePublisher {
  static async publish(job) {
    return new Promise((resolve) => {
      const slug = getSlug(job.job_title || job.title, job.id);
      const externalUrl = `https://madhuratech.com/career/job/${slug}`;

      db.query(
        "UPDATE requirements SET status = 'Published', opening_date = COALESCE(opening_date, CURRENT_DATE()) WHERE id = ?",
        [job.id],
        (err) => {
          if (err) {
            console.error('[CareerPagePublisher.publish] Error:', err);
            return resolve({
              success: false,
              status: 'FAILED',
              errorMessage: err.message
            });
          }

          return resolve({
            success: true,
            status: 'PUBLISHED',
            externalUrl,
            externalJobId: String(job.id),
            lastSyncedAt: new Date()
          });
        }
      );
    });
  }

  static async update(job) {
    return this.publish(job);
  }

  static async close(job) {
    return new Promise((resolve) => {
      db.query(
        "UPDATE requirements SET status = 'Closed', closing_date = CURRENT_DATE() WHERE id = ?",
        [job.id],
        (err) => {
          if (err) {
            return resolve({
              success: false,
              status: 'FAILED',
              errorMessage: err.message
            });
          }

          return resolve({
            success: true,
            status: 'CLOSED',
            lastSyncedAt: new Date()
          });
        }
      );
    });
  }

  static async delete(job) {
    return new Promise((resolve) => {
      db.query(
        "UPDATE requirements SET status = 'Deleted', deleted_at = NOW() WHERE id = ?",
        [job.id],
        (err) => {
          if (err) {
            return resolve({
              success: false,
              status: 'FAILED',
              errorMessage: err.message
            });
          }

          return resolve({
            success: true,
            status: 'REMOVED',
            lastSyncedAt: new Date()
          });
        }
      );
    });
  }
}

module.exports = CareerPagePublisher;
