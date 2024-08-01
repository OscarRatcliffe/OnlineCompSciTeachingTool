const fs = require('fs');
import spawnContainer from "./spawner";
const express = require('express')
const app = express()

const pythonScript = fs.readFileSync('test.py', 'utf8');

var currentContainerIDs: any = []

app.get('/', (req: any, res:any) => {

    var containerID:number = Math.floor(Math.random() * 999) + 8000;
    currentContainerIDs.push(containerID)

    res.send({
        "State": `Created container ${containerID}`
    })
    
    spawnContainer(pythonScript, containerID, currentContainerIDs)

})

app.listen(3000, () => {
    console.log(`App running on port 3000`)
  })