const db = require('../../config/database');

function getSlug(title, id) {
  const cleanTitle = String(title || 'job')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');

  return `${cleanTitle}-${id}`;
}

class CareerPagePublisher {

  /**
   * PUBLISH JOB
   */
  static async publish(job) {

    return new Promise((resolve) => {

      const title = job.job_title || job.title || 'Job Opening';

      const slug = getSlug(title, job.id);

      const externalUrl =
        `https://madhuratech.com/career/job/${slug}`;

      const sql = `
        UPDATE requirements
        SET
          status = 'Published',
          opening_date = COALESCE(opening_date, CURRENT_DATE()),
          closing_date = NULL,
          deleted_at = NULL
        WHERE id = ?
      `;

      db.query(sql, [job.id], (err, result) => {

        if (err) {

          console.error(
            '[CareerPagePublisher.publish]',
            err
          );

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

      });

    });
  }


  /**
   * UPDATE JOB
   *
   * Since WordPress reads the database through
   * the public API, we don't need another sync operation.
   */
  static async update(job) {

    return this.publish(job);

  }


  /**
   * CLOSE JOB
   */
  static async close(job) {

    return new Promise((resolve) => {

      const sql = `
        UPDATE requirements
        SET
          status = 'Closed',
          closing_date = CURRENT_DATE()
        WHERE id = ?
      `;

      db.query(sql, [job.id], (err, result) => {

        if (err) {

          console.error(
            '[CareerPagePublisher.close]',
            err
          );

          return resolve({
            success: false,
            status: 'FAILED',
            errorMessage: err.message
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


  /**
   * DELETE / REMOVE JOB
   */
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

          console.error(
            '[CareerPagePublisher.delete]',
            err
          );

          return resolve({
            success: false,
            status: 'FAILED',
            errorMessage: err.message
          });
        }

        return resolve({
          success: true,
          status: 'REMOVED',
          externalJobId: String(job.id),
          lastSyncedAt: new Date()
        });

      });

    });
  }

}

module.exports = CareerPagePublisher;