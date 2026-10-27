import mysql from "mysql2";

const con = mysql.createConnection({
    host: "localhost",
    user: "root",               // ✅ your MySQL user
    password: "Maryala@2004",   // ✅ your MySQL root password
    database: "employee_ms"     // ✅ the database you just created
});

con.connect((err) => {
    if (err) {
        console.error("❌ Database connection failed:", err.message);
    } else {
        console.log("✅ Connected to MySQL Database!");
    }
});

export default con;
