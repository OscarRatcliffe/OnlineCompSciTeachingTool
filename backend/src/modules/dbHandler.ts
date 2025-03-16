// Librarys
import pg from 'pg'
import cryptoRandomString from 'crypto-random-string';
import bcrypt from 'bcryptjs'
import { error } from 'console'
import { StatusCodes } from 'http-status-codes'
import task from 'node-docker-api/lib/task';

// Connect to DB
const { Client } = pg
const client = new Client({
    user: "postgres",
    password: "postgres",
    host: "db",
    port: 5432,
    database: "postgres"
})
await client.connect()

// Check user ID and generate a session ID
async function login(username:string, password:string): Promise<[number, string]> { //HTTPCode, Session ID

    let HTTPCode = StatusCodes.INTERNAL_SERVER_ERROR;
    let sessionID = "";

    let passwordRes = await client.query(`SELECT password, class FROM student WHERE username='${username}'`) //Get password field for student
    let userType: userGroup = "Student"

    if (passwordRes.rowCount == 0) { //If cant find student check teachers

        passwordRes = await client.query(`SELECT password, ID FROM teacher WHERE username='${username}'`) //Get password field for teacher
        userType = "Teacher"

    }

    // Custom error handling
    if (typeof(passwordRes.rowCount) == null) { //SQL Error

        console.log("ERROR IN SQL REQUEST")

    } else if (passwordRes.rowCount == 0) { //Cannot find in DB

        HTTPCode = StatusCodes.UNAUTHORIZED //Username not in DB - Not relayed to user for security

    } else if (passwordRes.rowCount !> 1) { //More than 1 version of username in DB

        throw error("ERROR Username duplicate - Check Sign Up method")
        
    } else {

        // Hash entered password and check against DB
        const hashedPassword = passwordRes.rows[0].password 

        //Check password using bcrypt
        await bcrypt.compare(password, hashedPassword).then (async(res: any) => { //Await so that the check can be done without a premature exit

            if (res) {

                HTTPCode = StatusCodes.OK //Password correct

                // Generate a unique session ID
                let uniqueCode: boolean = false;

                while(!uniqueCode) {
                    let pass = true;

                    sessionID = cryptoRandomString({length: 32, type: 'url-safe'}); //Generate a token

                    let studentSessionRes = await client.query("SELECT last_session_id FROM student") //Check if token is already in use
                    let teacherSessionRes = await client.query("SELECT last_session_id FROM teacher") 

                    //Check if used for student
                    for (let i = 0; i < studentSessionRes.rows.length; i++) {
                        
                        if(sessionID == studentSessionRes.rows[i].last_session_id) {

                            pass = false

                        }

                    }

                    //Check if used for teacher
                    for (let i = 0; i < teacherSessionRes.rows.length; i++) {
                        
                        if(sessionID == teacherSessionRes.rows[i].last_session_id) {

                            pass = false

                        }

                    }

                    if (pass) { // Check if item was a duplicate

                        uniqueCode = true

                    }

                }
                // Update value in DB with expiry date a week from now

                const epochTime = new Date().getTime();
                const days = Math.floor(epochTime / 86400000) //Convert from ms since 1970 to days

                const nextWeekDays = days + 7; 

                await client.query(`UPDATE ${userType.toLowerCase()} SET last_session_id = '${sessionID}', session_expires = '${nextWeekDays}' WHERE username='${username}'`) //Only 1 session ID does limit device amount but not an issue due to only being used on school computers

            } else {

                HTTPCode = StatusCodes.UNAUTHORIZED //Password incorrect

            }

            
        })
    }

    return [HTTPCode, sessionID]

}

// Check user permissions
async function authCheck(sessionID:string): Promise<authCheckFormat | null> { //Access Level, Class / Token not valid

    let classes: Array<classFormat> = []
    let validAuth:boolean = true;

    let sessionRes = await client.query(`SELECT class, session_expires, id FROM student WHERE last_session_id='${sessionID}'`) //Get password field for student
    
    let userType: userGroup = "Student"

    try { //Used so that if a class cannot be found the program does not crash
        
        const studentClassesRes = await client.query(`SELECT class.id, class.name FROM class FULL OUTER JOIN student ON class.id = student.class WHERE student.id ='${sessionRes.rows[0].id}'`)
    
         classes.push({
            "ID": studentClassesRes.rows[0].id,
            "Name": studentClassesRes.rows[0].name
        })

    } catch(err) {

        console.log(err)

    }

    if (sessionRes.rowCount == 0) { //If cant find student check teachers

        sessionRes = await client.query(`SELECT id, session_expires FROM teacher WHERE last_session_id='${sessionID}'`) //Get password field for teacher
        userType = "Teacher"

        console.log(sessionRes)

        const teacherClassesRes = await client.query(`SELECT id, name FROM class WHERE teacher='${sessionRes.rows[0].id}'`)

        classes = []

        console.log(classes)

        for (let i = 0; i < teacherClassesRes.rows.length; i++) {  //Iterate through returned rows

            classes.push({
                "ID": teacherClassesRes.rows[i].id,
                "Name": teacherClassesRes.rows[i].name
            })

        }

        console.log(classes)

    }

    // Custom error handling
    if (typeof(sessionRes.rowCount) == null) {

        throw error("SQL Response malformed") // Used in testing

    } else if (sessionRes.rowCount == 0) {

        validAuth = false
        console.log("Session ID not found", userType)

    } else if (sessionRes.rowCount !> 1) {

        throw error("Session token duplicate - Check Login method")
        
    } else {

        //Check if token is still valid
        const epochTime = new Date().getTime();
        const days = Math.floor(epochTime / 86400000)

        if (sessionRes.rows[0].session_expires < days) {
            validAuth = false
            console.log("Session ID expired")
        }
    
    }
    
    if (validAuth) {

        return {
            "userType": userType,
            "classes": classes,
            "userID": sessionRes.rows[0].id //Added for create classes func 
        }

    }
    
    return null
}

//Get task list
async function getTaskList(classID:number): Promise<Array<taskListFormat> | null> {

    let taskList = await client.query(`SELECT id, title, deadline, description FROM task WHERE class='${classID}'`)

    // Return null if no tasks found
    if(taskList.rowCount as number == 0) {  

        return null

    } else {

        let tasks: Array<taskListFormat> = []

        for (let i = 0; i < taskList.rows.length; i++) {

            tasks.push({
                "ID": taskList.rows[i].id,
                "Title": taskList.rows[i].title,
                "Deadline": taskList.rows[i].deadline,
                "Description": taskList.rows[i].description
            })

        }

        return tasks

    }

}

async function createNewTask(title: string, description: string, classID: number) {

    await client.query(`INSERT INTO task (title, description, class) VALUES ('${title}', '${description}', '${classID}')`)

}

//Teacher Signup
async function teacherSignup(username:string, password:string): Promise<number> { //HTTPCode

    //Check if already exists
    let sessionRes = await client.query(`SELECT username FROM teacher WHERE username='${username}'`)

    if(typeof(sessionRes.rowCount) == null) { //Check for SQL error

        return StatusCodes.INTERNAL_SERVER_ERROR

    } else { 

        if(sessionRes.rowCount as number > 0) { //Username found in DB

            return StatusCodes.CONFLICT
    
        } else {

                //Hash password
                const saltRounds:number = 10 //How many times to salt password

                await bcrypt.genSalt(saltRounds, async function(err, salt) { //Crate password salt
                    await bcrypt.hash(password, salt, async function(err, hash) { //Hash password

                        //Add entry to DB
                        await client.query(`INSERT INTO teacher (username,password) VALUES ('${username}','${hash}')`)  
                    });
                })
                
            return StatusCodes.CREATED
        }
    }
}

//Student sign up
async function studentSignup(username:string, password:string, classID:number): Promise<number> {

    //Check if already exists
    let sessionRes = await client.query(`SELECT username FROM student WHERE username='${username}'`)

    if(typeof(sessionRes.rowCount) == null) { //Check for SQL error

        return StatusCodes.INTERNAL_SERVER_ERROR

    } else { 

        if(sessionRes.rowCount as number > 0) { //Username found in DB

            return StatusCodes.CONFLICT
    
        } else {

                //Hash password
                const saltRounds:number = 10 //How many times to salt password

                await bcrypt.genSalt(saltRounds, async function(err, salt) { //Crate password salt
                    await bcrypt.hash(password, salt, async function(err, hash) { //Hash password

                        //Add entry to DB
                        await client.query(`INSERT INTO student (username,password, class) VALUES ('${username}','${hash}','${classID}')`)  
                    });
                })
                
            return StatusCodes.CREATED
        }
    }
    
}

//Create class
async function createClass(className:string, teacherID: number): Promise<number> {

    await client.query(`INSERT INTO class (name,teacher) VALUES ('${className}','${teacherID}')`)  

    return StatusCodes.CREATED
}

async function newCodeSave(taskID: number, studentID: number, code: string) {

    //Check if already exists
    let sessionRes = await client.query(`SELECT id FROM solutions WHERE task='${taskID}' AND student='${studentID}'`)

    if(sessionRes.rowCount as number > 0) { //Found in DB

        await client.query(`UPDATE solutions SET task='${taskID}', student='${studentID}', code='${code}' WHERE ID=${sessionRes.rows[0].id}`)

    } else {

        await client.query(`INSERT INTO solutions (task, student, code) VALUES ('${taskID}', '${studentID}', '${code}')`)
    }

}

async function getCode(taskID: number, studentID: number) {


    try {

        let sessionRes = await client.query(`SELECT code FROM solutions WHERE task='${taskID}' AND student='${studentID}'`)
        return sessionRes.rows[0].code

    } catch {

        return null

    }
    

}

export {authCheck, login, teacherSignup, getTaskList, createNewTask, studentSignup, createClass, newCodeSave, getCode};