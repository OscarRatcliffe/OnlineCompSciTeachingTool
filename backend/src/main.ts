// Librarys
import fs from 'fs';
import express from 'express'
import bodyParser from 'body-parser';

import cors from 'cors';
import { log } from 'console';
const app = express()

// Custom libraries
import { authCheck, login } from "./modules/dbHandler.js";
import spawnContainer from "./modules/spawner.js";

//CORS
app.use(cors());

// Get test script
const pythonScript = fs.readFileSync('test.py', 'utf8');

// Create containers
var currentContainerIDs: any = []
app.get('/testCreation', async (req: any, res:any) => { 

    if(await authCheck(req.query.session) != null) {

        try {

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
    
        } catch {
    
            res.sendStatus(500)
    
        }

    } else {

        res.sendStatus(403)

    }

})

//Login script
app.get('/login', async (req:any, res:any) => {
 
    // Get post request data
    const postData:loginFormat = {
        "Username": req.headers.username,
        "Password": req.headers.password
    }

    console.log(postData.Username, postData.Password)

    try {

        const loginCheckRes = await login(postData.Username.toLowerCase(), postData.Password) //Check if username and password is correct

        const auth:number = loginCheckRes[0]
        const sessionID: string = loginCheckRes[1]

        // Only return information if username and password is correct
        if (auth == 200) {

            res.status(200) //Set HTTP code

            res.send(sessionID) 

        } else {

            res.sendStatus(auth)

        }

    } catch {

        res.sendStatus(500)

    }


})

// Start webserver
app.listen(3000, () => {
    console.log(`App running on port 3000`)
  })