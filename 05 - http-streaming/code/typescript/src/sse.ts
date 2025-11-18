// SSE Example
import express from 'express';
const app = express();

app.get('/sse', (_, res) => {
    console.log('SSE connection established');

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const noOfMessages = 5;
    let messageCount = 0

    const id = setInterval(() => {
        console.log('Sending SSE data');
        res.write(`data: ${new Date().toISOString()}\n\n`);
        messageCount++;
        if (messageCount >= noOfMessages) {
            console.log('Closing SSE connection after sending messages');
            clearInterval(id); // Clear the interval to stop sending messages
            res.end(); // Close the connection after sending the desired number of messages
        }

    }, 1000);

});

app.listen(8000, () => {
    console.log('SSE server running on port 8000');
});
