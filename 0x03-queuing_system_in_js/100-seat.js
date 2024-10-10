const express = require('express');
const redis = require('redis');
const { promisify } = require('util');
const kue = require('kue');

const app = express();
const client = redis.createClient();
const reserveSeatAsync = promisify(client.set).bind(client);
const getCurrentAvailableSeatsAsync = promisify(client.get).bind(client);

const queue = kue.createQueue();

let reservationEnabled = true;

// Set the number of available seats to 50
reserveSeatAsync('available_seats', 50)
    .then(() => {
        console.log('Number of available seats set to 50');
    })
    .catch((error) => {
        console.error('Failed to set the number of available seats:', error);
    });

// GET /available_seats route
app.get('/available_seats', (req, res) => {
    getCurrentAvailableSeatsAsync('available_seats')
        .then((seats) => {
            res.json({ numberOfAvailableSeats: seats });
        })
        .catch((error) => {
            console.error('Failed to get the number of available seats:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        });
});

// GET /reserve_seat route
app.get('/reserve_seat', (req, res) => {
    if (!reservationEnabled) {
        res.json({ status: 'Reservation are blocked' });
        return;
    }

    const job = queue.create('reserve_seat').save((error) => {
        if (error) {
            console.error('Failed to create and save the job:', error);
            res.json({ status: 'Reservation failed' });
        } else {
            res.json({ status: 'Reservation in process' });
        }
    });

    job.on('complete', (result) => {
        console.log(`Seat reservation job ${job.id} completed`);
    });

    job.on('failed', (errorMessage) => {
        console.error(`Seat reservation job ${job.id} failed: ${errorMessage}`);
    });
});

// GET /process route
app.get('/process', (req, res) => {
    res.json({ status: 'Queue processing' });

    queue.process('reserve_seat', async (job, done) => {
        const currentAvailableSeats = await getCurrentAvailableSeatsAsync('available_seats');
        const newAvailableSeats = parseInt(currentAvailableSeats, 10) - 1;

        if (newAvailableSeats === 0) {
            reservationEnabled = false;
        }

        if (newAvailableSeats >= 0) {
            await reserveSeatAsync('available_seats', newAvailableSeats);
            done();
        } else {
            done(new Error('Not enough seats available'));
        }
    });
});

app.listen(1245, () => {
    console.log('Server listening on port 1245');
});
