// server.js

import readline from 'readline';

const rl = readline.createInterface({
 input: process.stdin,
 output: process.stdout,
 terminal: false
});

rl.on('line', (line) => {
 if (line.includes('exit')) {
   console.log('EXIT received: Server closing down...');
   process.exit(0);
 } else {
   console.log("line received: (Server data):", line);
   }
});
