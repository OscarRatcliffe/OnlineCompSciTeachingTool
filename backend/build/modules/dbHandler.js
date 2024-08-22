// Librarys
import pg from 'pg';
import cryptoRandomString from 'crypto-random-string';
import bcrypt from 'bcryptjs';
import { error } from 'console';
import { StatusCodes } from 'http-status-codes';
// Connect to DB
const { Client } = pg;
const client = new Client({
    user: "postgres",
    password: "postgres",
    host: "localhost",
    port: 5432,
    database: "postgres"
});
await client.connect();
// Check user ID and generate a session ID
async function login(username, password) {
    let HTTPCode = StatusCodes.INTERNAL_SERVER_ERROR;
    let sessionID = "";
    let passwordRes = await client.query(`SELECT password, class FROM student WHERE username='${username}'`); //Get password field for student
    let userType = "Student";
    if (passwordRes.rowCount == 0) { //If cant find student check teachers
        passwordRes = await client.query(`SELECT password, ID FROM teacher WHERE username='${username}'`); //Get password field for teacher
        userType = "Teacher";
    }
    // Custom error handling
    if (typeof (passwordRes.rowCount) == null) {
        throw error("ERROR: SQL Response malformed"); // Used in testing
        HTTPCode = StatusCodes.INTERNAL_SERVER_ERROR; //Used in production
    }
    else if (passwordRes.rowCount == 0) {
        HTTPCode = StatusCodes.NOT_FOUND; //Username not in DB
    }
    else if (passwordRes.rowCount > 1) {
        throw error("ERROR Username duplicate - Check Sign Up method");
    }
    else {
        // Hash entered password and check against DB
        const hashedPassword = passwordRes.rows[0].password;
        //Check password using bcrypt
        await bcrypt.compare(password, hashedPassword).then(async (res) => {
            if (res) {
                HTTPCode = StatusCodes.OK; //Password correct
                // Generate a unique session ID
                let uniqueCode = false;
                while (!uniqueCode) {
                    let pass = true;
                    sessionID = cryptoRandomString({ length: 32, type: 'url-safe' }); //Generate a token
                    let studentSessionRes = await client.query("SELECT last_session_id FROM student"); //Check if token is already in use
                    let teacherSessionRes = await client.query("SELECT last_session_id FROM teacher"); //Check if token is already in use
                    //Check if used for student
                    for (let i = 0; i < studentSessionRes.rows.length; i++) {
                        if (sessionID == studentSessionRes.rows[i].last_session_id) {
                            pass = false;
                        }
                    }
                    //Check if used for teacher
                    for (let i = 0; i < teacherSessionRes.rows.length; i++) {
                        if (sessionID == teacherSessionRes.rows[i].last_session_id) {
                            pass = false;
                        }
                    }
                    if (pass) { // Check if item was a duplicate
                        uniqueCode = true;
                    }
                }
                // Update value in DB with expiry date a week from now
                const epochTime = new Date().getTime();
                const days = Math.floor(epochTime / 86400000); //Convert from ms since 1970 to days
                const nextWeekDays = days + 7;
                await client.query(`UPDATE ${userType.toLowerCase()} SET last_session_id = '${sessionID}', session_expires = '${nextWeekDays}' WHERE username='${username}'`);
            }
            else {
                HTTPCode = StatusCodes.UNAUTHORIZED; //Password incorrect
            }
        });
    }
    return [HTTPCode, sessionID];
}
// Check user permissions
async function authCheck(username, password) {
    let HTTPCode = StatusCodes.INTERNAL_SERVER_ERROR;
    let classes = [];
    let passwordRes = await client.query(`SELECT password, class FROM student WHERE username='${username}'`); //Get password field for student
    let userType = "Student";
    if (passwordRes.rowCount == 0) { //If cant find student check teachers
        passwordRes = await client.query(`SELECT password, ID FROM teacher WHERE username='${username}'`); //Get password field for teacher
        userType = "Teacher";
    }
    // Custom error handling
    if (typeof (passwordRes.rowCount) == null) {
        throw error("ERROR: SQL Response malformed"); // Used in testing
        HTTPCode = StatusCodes.INTERNAL_SERVER_ERROR; //Used in production
    }
    else if (passwordRes.rowCount == 0) {
        HTTPCode = StatusCodes.NOT_FOUND; //Username not in DB
    }
    else if (passwordRes.rowCount > 1) {
        throw error("ERROR Username duplicate - Check Sign Up method");
    }
    else {
        // Hash entered password and check against DB
        const hashedPassword = passwordRes.rows[0].password;
        //Check password using bcrypt
        await bcrypt.compare(password, hashedPassword).then(async (res) => {
            if (res) {
                HTTPCode = StatusCodes.OK; //Password correct
                // Calculate classes (Done after check to save processing time)
                if (userType == "Student") {
                    classes = [passwordRes.rows[0].class]; //Student to classes is many to one so place in an array for consistent function return
                }
                else {
                    // Look at class table to create a list of classes the teacher teaches
                    const classesres = await client.query(`SELECT id FROM class WHERE teacher='${passwordRes.rows[0].id}'`);
                    for (let i = 0; i < classesres.rows.length; i++) { //Iterate through returned rows
                        classes.push(classesres.rows[i].id);
                    }
                }
            }
            else {
                HTTPCode = StatusCodes.UNAUTHORIZED; //Password incorrect
            }
        });
    }
    return [HTTPCode, userType, classes];
}
export { authCheck, login };
