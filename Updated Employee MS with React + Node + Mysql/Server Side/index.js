// Server Side/index.js
import express from "express";
import mysql from "mysql2";
import cors from "cors";
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

dotenv.config();

/* -------------------- __dirname in ESM -------------------- */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/* ------------------------- App --------------------------- */
const app = express();
const PORT = process.env.PORT || 8081;

/* ---------------------- Middleware ------------------------ */
app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:5174"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  })
);
app.use(express.json());
app.use(cookieParser());

// static images
const imagesDir = path.join(__dirname, "public", "images");
fs.mkdirSync(imagesDir, { recursive: true });
app.use("/images", express.static(imagesDir));

// tiny request logger (helps when chasing 404s)
app.use((req, _res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

/* ---------------------- MySQL connect --------------------- */
const db = mysql.createConnection({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "Maryala@2004",
  database: process.env.DB_NAME || "employee_ms",
});
db.connect((err) => {
  if (err) console.error("❌ MySQL connect error:", err.message);
  else console.log("✅ Connected to MySQL");
});

/* ------------------------ Helpers ------------------------- */
const signToken = (payload) =>
  jwt.sign(payload, process.env.JWT_SECRET || "dev-secret", {
    expiresIn: "1d",
  });

/* ======================== AUTH (Admin) ======================== */

// POST /login
app.post("/login", (req, res) => {
  const { email, password } = req.body;
  const sql = "SELECT id, email FROM admin WHERE email = ? AND password = ?";
  db.query(sql, [email, password], (err, rows) => {
    if (err) return res.json({ Status: "Error", Error: "SQL error" });
    if (rows.length === 0)
      return res.json({ Status: "Error", Error: "Invalid credentials" });

    const token = signToken({ role: "admin", id: rows[0].id });
    res.cookie("token", token, { httpOnly: true });
    return res.json({ Status: "Success" });
  });
});

// GET /verify
app.get("/verify", (req, res) => {
  const token = req.cookies?.token;
  if (!token) return res.json({ Status: "Error", Error: "Not authenticated" });

  jwt.verify(token, process.env.JWT_SECRET || "dev-secret", (err, dec) => {
    if (err) return res.json({ Status: "Error", Error: "Invalid token" });
    return res.json({ Status: "Success", role: dec.role, id: dec.id });
  });
});

// GET /logout
app.get("/logout", (_req, res) => {
  res.clearCookie("token");
  return res.json({ Status: true });
});

/* =================== Dashboard metrics ==================== */

// GET /adminCount
app.get("/adminCount", (_req, res) => {
  db.query("SELECT COUNT(id) AS admin FROM admin", (err, rows) => {
    if (err)
      return res
        .status(500)
        .json({ Status: false, Error: "Query error (adminCount)" });
    res.json(rows); // [{ admin: N }]
  });
});

// GET /employeeCount
app.get("/employeeCount", (_req, res) => {
  db.query("SELECT COUNT(id) AS employee FROM employee", (err, rows) => {
    if (err)
      return res
        .status(500)
        .json({ Status: false, Error: "Query error (employeeCount)" });
    res.json(rows); // [{ employee: N }]
  });
});

// GET /salary
app.get("/salary", (_req, res) => {
  db.query(
    "SELECT IFNULL(SUM(salary),0) AS sumOfSalary FROM employee",
    (err, rows) => {
      if (err)
        return res
          .status(500)
          .json({ Status: false, Error: "Query error (salary)" });
      res.json(rows); // [{ sumOfSalary: N }]
    }
  );
});

/* ======================== Admin CRUD ======================= */

// GET /admins
app.get("/admins", (_req, res) => {
  db.query("SELECT id, email FROM admin ORDER BY id", (err, rows) => {
    if (err)
      return res
        .status(500)
        .json({ Status: false, Error: "Query error (admins)" });
    res.json(rows);
  });
});

// GET /admins/:id
app.get("/admins/:id", (req, res) => {
  db.query(
    "SELECT id, email FROM admin WHERE id = ?",
    [req.params.id],
    (err, rows) => {
      if (err)
        return res
          .status(500)
          .json({ Status: false, Error: "Query error (admin by id)" });
      res.json(rows[0] || null);
    }
  );
});

// PUT /admins/:id
app.put("/admins/:id", (req, res) => {
  const { email } = req.body;
  db.query(
    "UPDATE admin SET email = ? WHERE id = ?",
    [email, req.params.id],
    (err) => {
      if (err)
        return res
          .status(500)
          .json({ Status: false, Error: "Update admin failed" });
      return res.json({ Status: "Success" });
    }
  );
});

// DELETE /admins/:id
app.delete("/admins/:id", (req, res) => {
  const id = Number(req.params.id);
  if (id === 1)
    return res.json({ Status: false, Error: "Super admin cannot be deleted" });

  db.query("DELETE FROM admin WHERE id = ?", [id], (err) => {
    if (err) return res.json({ Status: false, Error: "Delete failed" });
    return res.json({ Status: true });
  });
});

/* ========================= Category ======================== */

// GET /auth/category
app.get("/auth/category", (_req, res) => {
  db.query("SELECT id, name FROM category ORDER BY id", (err, rows) => {
    if (err) return res.json({ Status: false, Error: "Query error (category)" });
    return res.json({ Status: true, Result: rows });
  });
});

// POST /auth/add_category
app.post("/auth/add_category", (req, res) => {
  const { name } = req.body;
  if (!name || !name.trim())
    return res
      .status(400)
      .json({ Status: false, Error: "Category name is required" });

  db.query(
    "INSERT INTO category (name) VALUES (?)",
    [name.trim()],
    (err, result) => {
      if (err)
        return res.status(500).json({ Status: false, Error: "Insert failed" });
      return res.json({
        Status: true,
        Result: { id: result.insertId, name: name.trim() },
      });
    }
  );
});

/* ======================== Employees ======================== */

// GET /employee (list with envelope to match existing UI)
app.get("/employee", (_req, res) => {
  const sql =
    "SELECT id, name, image, email, role, address, salary FROM employee ORDER BY id";
  db.query(sql, (err, rows) => {
    if (err) return res.json({ Status: false, Error: "Query failed" });
    return res.json({ Status: "Success", Result: rows });
  });
});
app.get("/adminRecords", (_req, res) => {
  const sql = `
    SELECT id, username AS name, email
    FROM admin
    ORDER BY id DESC
    LIMIT 10
  `;
  db.query(sql, (err, rows) => {
    if (err) return res.json({ Status: "Error", Error: err.message });
    return res.json({ Status: "Success", Result: rows });
  });
});

// Multer for file upload
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, imagesDir),
  filename: (_req, file, cb) =>
    cb(null, `${Date.now()}${path.extname(file.originalname)}`),
});
const upload = multer({ storage });

// POST /create (add employee)
app.post("/create", upload.single("image"), (req, res) => {
  const { name, email, password, address, salary, category_id } = req.body;
  const image = req.file ? req.file.filename : null;

  const sql = `
    INSERT INTO employee (name, email, password, address, salary, image, category_id)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;
  const params = [
    name || "",
    email || "",
    password || "",
    address || "",
    Number(salary) || 0,
    image,
    category_id ? Number(category_id) : null,
  ];

  db.query(sql, params, (err, result) => {
    if (err)
      return res
        .status(500)
        .json({ Status: false, Error: "Insert employee failed" });
    return res.json({ Status: true, Result: { id: result.insertId } });
  });
});

// PUT /auth/edit_employee/:id (update)
app.put("/auth/edit_employee/:id", (req, res) => {
  const id = Number(req.params.id) || 0;
  if (!id) return res.status(400).json({ Status: false, Error: "Invalid id" });

  const { name, email, address, salary, category_id } = req.body;

  const sql = `
    UPDATE employee
    SET name = ?, email = ?, address = ?, salary = ?, category_id = ?
    WHERE id = ?
  `;
  const params = [
    name ?? "",
    email ?? "",
    address ?? "",
    Number(salary) || 0,
    category_id ? Number(category_id) : null,
    id,
  ];

  db.query(sql, params, (err, result) => {
    if (err) return res.status(500).json({ Status: false, Error: "Update failed" });
    if (result.affectedRows === 0)
      return res.status(404).json({ Status: false, Error: "Employee not found" });
    return res.json({ Status: true });
  });
});

/* ===================== Employee Login/API ==================== */

// POST /employeelogin (plain-text password support to match your DB)
app.post("/employeelogin", (req, res) => {
  const { email, password } = req.body;
  const sql = "SELECT id, password FROM employee WHERE email = ?";
  db.query(sql, [email], (err, rows) => {
    if (err) return res.status(500).json({ loginStatus: false, Error: "SQL error" });
    if (rows.length === 0)
      return res.json({ loginStatus: false, Error: "Invalid credentials" });

    const { id, password: dbPass } = rows[0];
    const ok = password === (dbPass ?? "");
    if (!ok) return res.json({ loginStatus: false, Error: "Invalid credentials" });

    const token = signToken({ role: "employee", id });
    res.cookie("token", token, { httpOnly: true });
    return res.json({ loginStatus: true, id });
  });
});

// Single implementation for returning employee by id…
const getEmployeeById = (req, res) => {
  const id = Number(req.params.id);
  if (!id) return res.status(400).json({ Status: false, Error: "Invalid id" });

  const sql = `
    SELECT e.id, e.name, e.email, e.role, e.salary, e.address, e.image,
           c.name AS category
    FROM employee e
    LEFT JOIN category c ON e.category_id = c.id
    WHERE e.id = ?
    LIMIT 1
  `;
  db.query(sql, [id], (err, rows) => {
    if (err) return res.status(500).json({ Status: false, Error: "Query error" });
    if (!rows?.length) return res.status(404).json({ Status: false, Error: "Employee not found" });
    return res.json({ Status: true, Result: rows[0] });
  });
};



// POST /auth/add_category
app.post("/auth/add_category", (req, res) => {
  const raw = (req.body?.name ?? "").trim();
  if (!raw) {
    return res.status(400).json({ Status: false, Error: "Category name is required" });
  }

  const sql = "INSERT INTO category (name) VALUES (?)";
  db.query(sql, [raw], (err, result) => {
    if (err) {
      // Duplicate name?
      if (err.code === "ER_DUP_ENTRY") {
        return res.status(409).json({ Status: false, Error: "Category already exists" });
      }
      return res.status(500).json({ Status: false, Error: err.sqlMessage || "Insert failed" });
    }
    return res.json({ Status: true, Result: { id: result.insertId, name: raw } });
  });
});


// …and THREE aliases so any of your pages work:
app.get("/employee/:id", getEmployeeById);
app.get("/employee/detail/:id", getEmployeeById);
app.get("/auth/employee/:id", getEmployeeById);

/* ========================= Healthcheck ====================== */
app.get("/", (_req, res) => res.send("API is running..."));

/* ============================ Boot ========================== */
app.listen(PORT, () => {
  console.log(`🚀 API running on http://localhost:${PORT}`);
});
