const axios = require('axios');

const containerId = '8425';

async function handleStream() {
    
    const res = await axios.post(`http://localhost:2375/containers/${containerId}/attach?logs=1&stream=1&stdout=1&stderr=1`,"Test", {

        responseType: 'stream'

    });

    
    const stream = res.data

    console.log("Connected")

    stream.write("Test data");
    
    stream.on("data", data => {
        console.log(data.toString())
    })

}

handleStream();