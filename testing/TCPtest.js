const axios = require('axios');
const readline = require('readline')

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

const containerId = '8143';

async function handleStream() {
    
    const res = await axios.post(`http://localhost:2375/containers/${containerId}/attach?logs=1&stream=1&stdout=1&stderr=1`,"Test", {

        responseType: 'stream'

    });

    console.log("Connected")
    res.data.pipe(process.stdout);

}

handleStream();