import pg from 'pg'
const { Client } = pg

// Connect to DB
const client = new Client({
    user: "postgres",
    password: "postgres",
    host: "localhost",
    port: 5432,
    database: "postgres"
})

// Test Func
async function getStudents() {

    await client.connect()

    const res = await client.query("SELECT * FROM students;")
    return res

}

export default getStudents;