const kue = require('kue');

const queue = kue.createQueue();

const jobData = {
    phoneNumber: '1234567890',
    message: 'Hello, world!'
};

const pushNotificationQueue = queue.create('push_notification_code', jobData);

pushNotificationQueue.save((err, job) => {
    if (err) {
        console.error('Notification job failed:', err);
    } else {
        console.log('Notification job created:', job.id);
    }
});

pushNotificationQueue.on('complete', () => {
    console.log('Notification job completed');
});

pushNotificationQueue.on('failed', () => {
    console.log('Notification job failed');
});
