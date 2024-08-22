// Librarys
import fs from 'fs';
import express from 'express'
const app = express()

// Custom libraries
import { authCheck } from "./modules/dbHandler.js";
import spawnContainer from "./modules/spawner.js";


// Get test script
const pythonScript = fs.readFileSync('test.py', 'utf8');

// Create containers
var currentContainerIDs: any = []
app.get('/testCreation', async (req: any, res:any) => { //Async function allows for multiple containers to be created at once

    let createdValidID = false
    let containerID: number = 0 

    while (!createdValidID) { //Loop until unique ID is created

        containerID = Math.floor(Math.random() * 999) + 8000;

        if (!currentContainerIDs.includes(containerID)) {
            createdValidID = true
            currentContainerIDs.push(containerID)
        }
    }

    console.log(containerID)

    res.send({
        "State": `Created container ${containerID}`
    })
    
    spawnContainer(pythonScript, containerID, currentContainerIDs)

})

//Login script
app.get('/login', async (req:any, res:any) => {

    //Get post request data
    const postData = res.body;

    const authCheckRes = await authCheck("testteacher", "teacher") //Check if username and password is correct

    const auth = authCheckRes[0]
    const userType: userGroup = authCheckRes[1]

    // Only return information if username and password is correct
    if (auth == 200) {

        res.status(200) //Set HTTP code

        res.send({
            "UserType": userType,
            "Data": 123
        })

    } else {

        res.sendStatus(auth)

    }
})

// Start webserver
app.listen(3000, () => {
    console.log(`App running on port 3000`)
  })