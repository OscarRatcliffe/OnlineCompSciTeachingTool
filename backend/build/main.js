// Librarys
import fs from 'fs';
import express from 'express';
const app = express();
// Custom libraries
import { authCheck, login } from "./modules/dbHandler.js";
import spawnContainer from "./modules/spawner.js";
// Get test script
const pythonScript = fs.readFileSync('test.py', 'utf8');
// Create containers
var currentContainerIDs = [];
app.get('/testCreation', async (req, res) => {
    if (await authCheck(req.query.session) != null) {
        try {
            let createdValidID = false;
            let containerID = 0;
            while (!createdValidID) { //Loop until unique ID is created
                containerID = Math.floor(Math.random() * 999) + 8000;
                if (!currentContainerIDs.includes(containerID)) {
                    createdValidID = true;
                    currentContainerIDs.push(containerID);
                }
            }
            console.log(containerID);
            res.send({
                "State": `Created container ${containerID}`
            });
            spawnContainer(pythonScript, containerID, currentContainerIDs);
        }
        catch {
            res.sendStatus(500);
        }
    }
    else {
        res.sendStatus(403);
    }
});
//Login script
app.post('/login', async (req, res) => {
    // Get post request data
    const postData = {
        "Username": req.query.Username,
        "Password": req.query.Password
    };
    try {
        const loginCheckRes = await login(postData.Username, postData.Password); //Check if username and password is correct
        const auth = loginCheckRes[0];
        const sessionID = loginCheckRes[1];
        // Only return information if username and password is correct
        if (auth == 200) {
            res.status(200); //Set HTTP code
            res.send(sessionID);
        }
        else {
            res.sendStatus(auth);
        }
    }
    catch {
        res.sendStatus(500);
    }
});
// Start webserver
app.listen(3000, () => {
    console.log(`App running on port 3000`);
});
