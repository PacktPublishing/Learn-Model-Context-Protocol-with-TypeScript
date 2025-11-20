
// client.js

import { spawn } from 'child_process';

const child = spawn('node', ['server.js']);

const listTools = {
    "jsonrpc": "2.0",
    "id": 1,
    "method": "tools/list",
    "params": {}
};

// Listen for data from the child
child.stdout.on('data', (data) => {
  console.log(`Client::ondata> (FROM SERVER): ${data}`);
});

// Send data to the child
// child.stdin.write('PARENT: Hello, child process!\n');

// sending data to the server
console.log("Client sending data to server...");
child.stdin.write("data 1\n");
child.stdin.write("exit\n");

// Optionally handle errors
child.stderr.on('data', (data) => {
  console.error(`Client::onerror> (FROM SERVER): ${data}`);
});

// Handle child process exit
child.on('exit', (code) => {
  console.log(`Client::onexit> (FROM SERVER): SERVER exited with code ${code}`);
});
