// Librarys
import pg from 'pg';
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
// Test Func
async function authCheck(username, password) {
    let HTTPCode = StatusCodes.INTERNAL_SERVER_ERROR;
    let classes = [];
    let passwordRes = await client.query(`SELECT password, class FROM students WHERE username='${username}'`); //Get password field for student
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
                    console.log(classesres.rows);
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
export { authCheck };
