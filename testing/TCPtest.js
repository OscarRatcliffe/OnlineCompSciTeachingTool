const http = require('http');

const containerId = '197b14a4769560687b9baf56a684d24c2b72f76e4cf968ecfdf47694636316ac'; // Replace with your container ID


const req = http.request({
    hostname: 'localhost',
    port: 2375,
    path: `/containers/${containerId}/attach?logs=1&stream=1&stdout=1&stderr=1`,
    method: 'POST',
}, (res) => {

console.log("Connected");

    res.on('data', (chunk) => {
        process.stdout.write(chunk);
    });

});

req.end();
