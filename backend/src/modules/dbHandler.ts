// Librarys
import pg from 'pg'
import bcrypt from 'bcryptjs'
import { error } from 'console'
import { StatusCodes } from 'http-status-codes'

// Connect to DB
const { Client } = pg
const client = new Client({
    user: "postgres",
    password: "postgres",
    host: "localhost",
    port: 5432,
    database: "postgres"
})
await client.connect()

// Test Func
async function authCheck(username:string, password:string): Promise<[number, userGroup]> { //HTTP code for login

    let HTTPCode = StatusCodes.INTERNAL_SERVER_ERROR

    let passwordRes = await client.query(`SELECT password FROM students WHERE username='${username}'`) //Get password field for student
    let userType: userGroup = "Student"

    if (passwordRes.rowCount == 0) { //If cant find student check teachers

        passwordRes = await client.query(`SELECT password FROM teacher WHERE username='${username}'`) //Get password field for teacher
        userType = "Teacher"

    }

    // Custom error handling
    if (typeof(passwordRes.rowCount) == null) {

        throw error("ERROR: SQL Response malformed") // Used in testing
        HTTPCode = StatusCodes.INTERNAL_SERVER_ERROR //Used in production

    } else if (passwordRes.rowCount == 0) {

        HTTPCode = StatusCodes.NOT_FOUND //Username not in DB

    } else if (passwordRes.rowCount !> 1) {

        throw error("ERROR Username duplicate - Check Sign Up method")
        
    } else {

        // Hash entered password and check against DB
        const hashedPassword = passwordRes.rows[0].password 

        //Check password using bcrypt
        await bcrypt.compare(password, hashedPassword).then((res: any) => { //Await so that the check can be done without a premature exit

            if (res) {

                HTTPCode = StatusCodes.OK //Password correct


            } else {

                HTTPCode = StatusCodes.UNAUTHORIZED //Password incorrect

            }

            
        })
    }

    return [HTTPCode, userType]

}

export {authCheck};