const LinkedInJobService = require('../linkedinJobService');

class LinkedInPublisher {
  static async publish(job) {
    const res = await LinkedInJobService.publishJob(job);
    return {
      success: res.success,
      status: (res.linkedinStatus || 'failed').toUpperCase(),
      externalJobId: res.linkedinJobId || null,
      errorMessage: res.error || null,
      lastSyncedAt: new Date()
    };
  }

  static async update(job) {
    return this.publish(job);
  }

  static async close(job) {
    return {
      success: true,
      status: 'CLOSED',
      externalJobId: String(job.id),
      lastSyncedAt: new Date()
    };
  }

  static async delete(job) {
    return this.close(job);
  }
}

module.exports = LinkedInPublisher;
