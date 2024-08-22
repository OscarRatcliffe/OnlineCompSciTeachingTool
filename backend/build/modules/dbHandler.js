// Librarys
import pg from 'pg';
import bcrypt from 'bcryptjs';
import { error } from 'console';
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
async function authCheck(username, password, type) {
    let HTTPCode = 500;
    const passwordRes = await client.query(`SELECT password FROM ${type.toLowerCase()} WHERE username='${username}'`); //Get password and its salt fields for given username
    // Custom error handling
    if (typeof (passwordRes.rowCount) == null) {
        throw error("ERROR: SQL Response malformed"); // Used in testing
        HTTPCode = 500; //Internal Server Error - Used in production
    }
    else if (passwordRes.rowCount == 0) {
        HTTPCode = 404; //Not found, username not in DB
    }
    else if (passwordRes.rowCount > 1) {
        throw error("ERROR Username duplicate - Check Sign Up method");
    }
    else {
        // Hash entered password and check against DB
        const hashedPassword = passwordRes.rows[0].password;
        //Check password using bcrypt
        await bcrypt.compare(password, hashedPassword).then((res) => {
            if (res) {
                HTTPCode = 200; //Ok, password correct
            }
            else {
                HTTPCode = 401; //Unauthorized, password incorrect
            }
        });
    }
    return HTTPCode;
}
export { authCheck };
