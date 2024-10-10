function createPushNotificationsJobs(jobs, queue) {
    if (!Array.isArray(jobs)) {
        throw new Error('Jobs is not an array');
    }

    jobs.forEach((job) => {
        const notificationJob = queue.create('push_notification_code_3', job)
            .on('enqueue', () => {
                console.log(`Notification job created: ${notificationJob.id}`);
            })
            .on('complete', () => {
                console.log(`Notification job ${notificationJob.id} completed`);
            })
            .on('failed', (error) => {
                console.log(`Notification job ${notificationJob.id} failed: ${error}`);
            })
            .on('progress', (progress, data) => {
                console.log(`Notification job ${notificationJob.id} ${progress}% complete`);
            });

        notificationJob.save();
    });
}
