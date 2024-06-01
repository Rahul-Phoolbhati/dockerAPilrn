const express = require('express');
const axios = require('axios');
const app = express();
const port = 3000;

// Axios instance configured for Unix socket
const docker = axios.create({
    socketPath: '/var/run/docker.sock',
    baseURL: 'http://localhost'
});



app.use(express.json());
// Endpoint to start a container
app.post('/start-container', async (req, res) => {
    try {
        const containerName = `user-container-${Date.now()}`;
        // Create container
        const createResponse = await docker.post('/containers/create', {
            Image: 'alpine',  // Use a different Docker image for testing
            Tty: true,
            Cmd: ['sh', '-c', 'while true; do sleep 1000; done'] // Keeps the container running
        }, {
            params: {
            name: `${containerName}`,
            }
        });
        const containerId = createResponse.data.Id;

        // Start container
        await docker.post(`/containers/${containerId}/start`);

        res.send(`Container started with ID: ${containerId}`);
    } catch (error) {
        console.error(error);
        res.status(500).send('Failed to start container');
    }
});

// Endpoint to stop the container
app.post('/stop-container', async (req, res) => {
    try {
        const { containerId } = req.body;
        if (!containerId) {
            return res.status(400).send('Container ID is required');
        }

        // Stop container
        await docker.post(`/containers/${containerId}/stop`);

        // Remove container
        await docker.delete(`/containers/${containerId}`);

        res.send('Container stopped and removed');
    } catch (error) {
        console.error(error);
        res.status(500).send('Failed to stop container');
    }
});



app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
