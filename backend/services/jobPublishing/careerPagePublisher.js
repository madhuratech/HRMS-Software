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

<<<<<<< Updated upstream
  static async publish(job) {
    return new Promise((resolve) => {
      const jobTitle = job.job_title || job.title || 'job-opening';
      const slug = getSlug(jobTitle, job.id);
      const externalUrl = `https://madhuratech.com/career`;
=======
  /**
   * ==========================================
   * PUBLISH JOB
   * ==========================================
   */
  static async publish(job) {
    return new Promise((resolve) => {

      if (!job || !job.id) {
        return resolve({
          success: false,
          status: 'FAILED',
          errorMessage: 'Job ID is required'
        });
      }

      const jobTitle =
        job.job_title ||
        job.title ||
        'job-opening';

      const slug = getSlug(jobTitle, job.id);

      const externalUrl =
        `https://madhuratech.com/career/?job=${encodeURIComponent(slug)}`;
>>>>>>> Stashed changes

      const sql = `
        UPDATE requirements
        SET
          status = 'Published',
          opening_date = COALESCE(opening_date, CURRENT_DATE()),
<<<<<<< Updated upstream
          deleted_at = NULL
        WHERE id = ?
      `;
=======
          closing_date = NULL,
          deleted_at = NULL
        WHERE id = ?
      `;

      db.query(sql, [job.id], (err, result) => {
>>>>>>> Stashed changes

      db.query(sql, [job.id], (err, result) => {
        if (err) {
<<<<<<< Updated upstream
          console.error('[CareerPagePublisher.publish] Error:', err);
=======
          console.error(
            '[CareerPagePublisher.publish] DB Error:',
            err
          );

>>>>>>> Stashed changes
          return resolve({
            success: false,
            status: 'FAILED',
            errorMessage: err.message,
            externalJobId: String(job.id)
          });
        }

        if (!result || result.affectedRows === 0) {
<<<<<<< Updated upstream
          console.warn(`[CareerPagePublisher.publish] No rows found for job ID: ${job.id}`);
          return resolve({
            success: false,
            status: 'NOT_FOUND',
            externalJobId: String(job.id),
            errorMessage: `Job ID ${job.id} was not found in requirements table`
          });
        }

=======
          return resolve({
            success: false,
            status: 'FAILED',
            errorMessage: `Job ${job.id} was not found`,
            externalJobId: String(job.id)
          });
        }

        console.log(
          `[CareerPagePublisher] Job ${job.id} PUBLISHED`
        );

>>>>>>> Stashed changes
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

<<<<<<< Updated upstream
=======

  /**
   * ==========================================
   * UPDATE JOB
   * ==========================================
   */
>>>>>>> Stashed changes
  static async update(job) {
    return this.publish(job);
  }

<<<<<<< Updated upstream
  static async close(job) {
    return new Promise((resolve) => {
=======

  /**
   * ==========================================
   * CLOSE JOB
   * ==========================================
   */
  static async close(job) {
    return new Promise((resolve) => {

      if (!job || !job.id) {
        return resolve({
          success: false,
          status: 'FAILED',
          errorMessage: 'Job ID is required'
        });
      }

>>>>>>> Stashed changes
      const sql = `
        UPDATE requirements
        SET
          status = 'Closed',
<<<<<<< Updated upstream
          closing_date = COALESCE(closing_date, CURRENT_DATE())
        WHERE id = ?
      `;
=======
          closing_date = COALESCE(
            closing_date,
            CURRENT_DATE()
          )
        WHERE id = ?
      `;

      db.query(sql, [job.id], (err, result) => {
>>>>>>> Stashed changes

      db.query(sql, [job.id], (err, result) => {
        if (err) {
<<<<<<< Updated upstream
          console.error('[CareerPagePublisher.close] Error:', err);
=======
          console.error(
            '[CareerPagePublisher.close] DB Error:',
            err
          );

>>>>>>> Stashed changes
          return resolve({
            success: false,
            status: 'FAILED',
            errorMessage: err.message,
            externalJobId: String(job.id)
          });
        }

        if (!result || result.affectedRows === 0) {
          return resolve({
            success: false,
<<<<<<< Updated upstream
            status: 'NOT_FOUND',
            errorMessage: `Job ID ${job.id} not found`,
=======
            status: 'FAILED',
            errorMessage: `Job ${job.id} was not found`,
>>>>>>> Stashed changes
            externalJobId: String(job.id)
          });
        }

<<<<<<< Updated upstream
=======
        console.log(
          `[CareerPagePublisher] Job ${job.id} CLOSED`
        );

>>>>>>> Stashed changes
        return resolve({
          success: true,
          status: 'CLOSED',
          externalJobId: String(job.id),
          lastSyncedAt: new Date()
        });
      });
    });
  }

<<<<<<< Updated upstream
  static async delete(job) {
    return new Promise((resolve) => {
=======

  /**
   * ==========================================
   * DELETE JOB
   * ==========================================
   *
   * IMPORTANT:
   * This is a SOFT DELETE.
   *
   * The database row remains available for HRMS,
   * but the public API will NEVER return it.
   */
  static async delete(job) {
    return new Promise((resolve) => {

      if (!job || !job.id) {
        return resolve({
          success: false,
          status: 'FAILED',
          errorMessage: 'Job ID is required'
        });
      }

>>>>>>> Stashed changes
      const sql = `
        UPDATE requirements
        SET
          status = 'Deleted',
<<<<<<< Updated upstream
          deleted_at = NOW()
        WHERE id = ?
      `;
=======
          deleted_at = NOW(),
          closing_date = COALESCE(
            closing_date,
            CURRENT_DATE()
          )
        WHERE id = ?
      `;

      db.query(sql, [job.id], (err, result) => {
>>>>>>> Stashed changes

      db.query(sql, [job.id], (err, result) => {
        if (err) {
<<<<<<< Updated upstream
          console.error('[CareerPagePublisher.delete] Error:', err);
=======
          console.error(
            '[CareerPagePublisher.delete] DB Error:',
            err
          );

>>>>>>> Stashed changes
          return resolve({
            success: false,
            status: 'FAILED',
            errorMessage: err.message,
            externalJobId: String(job.id)
          });
        }

<<<<<<< Updated upstream
=======
        if (!result || result.affectedRows === 0) {
          return resolve({
            success: false,
            status: 'FAILED',
            errorMessage: `Job ${job.id} was not found`,
            externalJobId: String(job.id)
          });
        }

        console.log(
          `[CareerPagePublisher] Job ${job.id} DELETED FROM PUBLIC CAREERS`
        );

>>>>>>> Stashed changes
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