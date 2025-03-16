// Librarys
import fs from 'fs';
import express from 'express'
import Docker from 'dockerode';
import { spawn } from 'child_process';

const app = express()

//CORS
import cors from 'cors';
app.use(cors());

// Custom libraries
import { authCheck, login, teacherSignup, getTaskList, createNewTask, studentSignup, createClass } from "./modules/dbHandler.js";
import { title } from 'process';

// Get test script
const pythonScript = fs.readFileSync('test.py', 'utf8');

//Login script
app.get('/login', async (req:any, res:any) => {
 
    // Get post request data
    const reqData:loginFormat = {
        "Username": req.headers.username, //TODO: Encryption on data transmission
        "Password": req.headers.password
    }

    try {

        const loginCheckRes = await login(reqData.Username.toLowerCase(), reqData.Password) //Check if username and password is correct

        const auth:number = loginCheckRes[0]
        const sessionID: string = loginCheckRes[1]

        // Only return information if username and password is correct
        if (auth == 200) { //User found

            res.status(200) //Set HTTP code

            res.send(sessionID) 

        } else { //Error occured 

            res.sendStatus(auth)

        }

    } catch { //Internal error

        res.sendStatus(500)

    }


})

//Teacher sign up
app.get('/teacherSignUp', async (req:any, res:any) => {
 
    // Get post request data
    const reqData:loginFormat = {
        "Username": req.headers.username,
        "Password": req.headers.password
    }

    const loginCheckRes = await teacherSignup(reqData.Username.toLowerCase(), reqData.Password) //Check if username and password is correct
    res.sendStatus(loginCheckRes)

})

//Teacher sign up
app.get('/createClass', async (req:any, res:any) => {
 
    // Get post request data
    const reqData = {
        "className": req.headers.classname,
        "sessionID": req.headers.sessionid
    }

    let checkAuth: authCheckFormat | null = await authCheck(reqData.sessionID) 

    console.log(checkAuth)

    if(checkAuth != null) {

        createClass(reqData.className, checkAuth.userID)
        res.status(201) //Created

    } else {

        res.sendStatus(403)

    }

})

//Student sign up
app.get('/studentSignUp', async (req:any, res:any) => {
 
    // Get post request data
    const reqData = {
        "Username": req.headers.username,
        "Password": req.headers.password,
        "classID": req.headers.classid,
        "sessionID": req.headers.sessionid
    }

    console.log(reqData)

    let checkAuth: authCheckFormat | null = await authCheck(reqData.sessionID) 

    console.log(checkAuth)

    if(checkAuth != null) {

        let authFail = true

        for(let i = 0; i < checkAuth.classes.length; i++) {
            if(checkAuth.classes[i].ID == reqData.classID) {
                authFail = false
            }
        }

        if(authFail) {

            res.sendStatus(403)

        } else {

            const loginCheckRes = await studentSignup(reqData.Username.toLowerCase(), reqData.Password, reqData.classID) //Check if username and password is correct
            res.sendStatus(loginCheckRes)

        }
        

    } else {

        res.sendStatus(403)

    }

})

//Get task list
app.get('/getTaskList', async (req:any, res:any) => {
 
    // Get post request data
    const reqData = {
        "classID": req.headers.classid,
        "sessionID": req.headers.sessionid
    }

    let checkAuth: authCheckFormat | null = await authCheck(reqData.sessionID) 

    console.log("Auth result: " + await checkAuth)

    let validAuth = false

    if (checkAuth != null) {

        // Check if user is in class
        for (let i = 0; i < checkAuth.classes.length; i++) {
        
            if (checkAuth.classes[i].ID == reqData.classID) {

                validAuth = true

                res.status(200)

                let tasks = await getTaskList(reqData.classID)

                res.send(tasks)

            }

        }

    }

    if (!validAuth) {

        res.sendStatus(403)

    }

})

app.get('/createNewTask', async (req:any, res:any) => {

    const reqData = {
        "title": req.headers.title,
        "description": req.headers.description,
        "classID": req.headers.classid,
        "sessionID": req.headers.sessionid
    }

    console.log(reqData)

    let checkAuth: authCheckFormat | null = await authCheck(reqData.sessionID) 

    if (checkAuth != null) {

        createNewTask(reqData.title, reqData.description, reqData.classID)

    } else {

        res.sendStatus(403)

    }

})

//Auth check
app.get('/AuthCheck', async (req:any, res:any) => {
 
    // Get post request data
    const reqData = {
        "sessionID": req.headers.sessionid
    }

    let checkAuth:authCheckFormat | null = await authCheck(reqData.sessionID)

    if (checkAuth != null) {

        res.status(200)

        res.send({
            "userType": checkAuth.userType,
            "classes": checkAuth.classes
        })

    } else {
        // If invalid token error
        res.sendStatus(403)
    }

})

var currentContainerIDs: any = []
app.get('/runCode', async (req:any, res:any) => {

    const reqData = {
        "code": req.headers.code,
        "sessionID": req.headers.sessionid
    }

    let checkAuth: authCheckFormat | null = await authCheck(reqData.sessionID) 

    if (checkAuth != null) {

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
        
            const docker = new Docker();

            docker.createContainer({
                Image: 'python',
                AttachStdout: true,
                AttachStderr: true,
                AttachStdin: true,
                name: containerID.toString(),
                Cmd: ['python', '-c', reqData.code]

            }, async function(err: any, container: any) {

                // Run container
                await container.start();

                // Wait for container to finish running
                await container.wait();

                //Record container output
                const logs = await container.logs({ stdout: true, stderr: true });

                // Delete container once code has run
                await container.remove();
                currentContainerIDs = currentContainerIDs.filter((item: number )=> item !== containerID); //Remove ID from current running containers

                res.send({
                    "State": `Created container ${containerID}`,
                    "terminalRes": `${logs.toString()}`
                })

            });
    
        } catch {
    
            res.sendStatus(500)
    
        }

    } else {

        res.sendStatus(403)

    }

})


//Test endpoint
app.get('/test', async (req: any, res: any) => {

    res.status(200)
    res.send({
        "Working": "Yep",
        "Favourite number": 11
    })

})

// Start webserver
app.listen(3000, () => {
    console.log(`App running on port 3000`)
})
