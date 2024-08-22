// Librarys
import pg from 'pg';
// Custom libraries
// Connect to DB
const { Client } = pg;
const client = new Client({
    user: "postgres",
    password: "postgres",
    host: "localhost",
    port: 5432,
    database: "postgres"
});
// Test Func
async function authCheck(username, password, type) {
    await client.connect();
    const passwordRes = await client.query(`SELECT password FROM ${type.toLowerCase()} WHERE username='${username}'`); //Get password and its salt fields for given username
    console.log(passwordRes);
    // if (passwordRes.rowCount != 1) {
    //     throw error("ERROR: Repeated username") //Throw repeated user error to help with debugging
    // } else {
    //     const hashedPassword = passwordRes.rows[0].password 
    //     //Check password using bcrypt
    //     bcrypt.compare(password, hashedPassword.then((res: any) => {
    //         return res;
    //     }))
    // }
    await client.end();
    return null;
}
export default authCheck;
