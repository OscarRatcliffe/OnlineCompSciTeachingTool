// Librarys
import fs from 'fs';
import express from 'express'
const app = express()

// Custom libraries
import getStudents from "./modules/dbHandler.js";
import spawnContainer from "./modules/spawner.js";

// Get test script
const pythonScript = fs.readFileSync('test.py', 'utf8');

// Create containers
var currentContainerIDs: any = []
app.get('/testCreation', (req: any, res:any) => {

    var containerID:number = Math.floor(Math.random() * 999) + 8000;
    currentContainerIDs.push(containerID)

    res.send({
        "State": `Created container ${containerID}`
    })
    
    spawnContainer(pythonScript, containerID, currentContainerIDs)

})

//Login script
app.get('/login', (req:any, res:any) => {

    console.log(getStudents())

})

// Start webserver
app.listen(3000, () => {
    console.log(`App running on port 3000`)
  })