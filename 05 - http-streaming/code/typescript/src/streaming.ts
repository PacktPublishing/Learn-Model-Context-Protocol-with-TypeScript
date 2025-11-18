import express from 'express';

const app = express();

app.get('/stream', (_, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Transfer-Encoding', 'chunked');

    const data = { message: 'Hello, world!' };
    
    let messageCount = 0;
    const noOfMessages = 5;

    // Simulate streaming data
    const id = setInterval(() => {
        res.write(JSON.stringify(data) + '\n');
        messageCount++;
        if (messageCount >= noOfMessages) {
            clearInterval(id); // Clear the interval to stop sending messages
            res.end(); // Close the connection after sending the desired number of messages
            console.log('Streaming complete');
        }
    }, 1000);
});
app.listen(8000, () => {
    console.log('HTTP streaming server running on port 8000');
});