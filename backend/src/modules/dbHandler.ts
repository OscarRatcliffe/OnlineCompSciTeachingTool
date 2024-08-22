// Librarys
import pg from 'pg'
import bcrypt from 'bcryptjs'
import { error } from 'console'

// Connect to DB
const { Client } = pg
const client = new Client({
    user: "postgres",
    password: "postgres",
    host: "localhost",
    port: 5432,
    database: "postgres"
})

// Test Func
async function authCheck(username:string, password:string, type:userGroup): Promise<number | null> { //HTTP code for login | Broken func

    await client.connect()

    const passwordRes = await client.query(`SELECT password FROM ${type.toLowerCase()} WHERE username='${username}'`) //Get password and its salt fields for given username

    console.log(passwordRes)

    // Custom error handling
    if (typeof(passwordRes.rowCount) == null) {

        throw error("ERROR: SQL Response malformed") // Used in testing
        return 500 //Internal Server Error - Used in production

    } else if (passwordRes.rowCount == 0) {

        return 404 //Not found, username not in DB

    } else if (passwordRes.rowCount !> 1) {

        throw error("ERROR Username duplicate - Check Sign Up method")
        
    } else {

        // Hash entered password and check against DB
        const hashedPassword = passwordRes.rows[0].password 

        //Check password using bcrypt
        bcrypt.compare(password, hashedPassword.then((res: any) => {

            if (res) {

                return 200 //Ok, password correct

            } else {

                return 401 //Unauthorized, password incorrect

            }

        }))
    }

    await client.end()
    return null
}

export default authCheck;