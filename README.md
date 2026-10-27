

# Employee Management System (React + Node + MySQL)

## 📌 Project Description

The **Employee Management System (EMS)** is a full-stack web application built using **React.js (Frontend)**, **Node.js + Express.js (Backend)**, and **MySQL (Database)**.
It provides a centralized platform for companies to manage their employees, departments, and attendance effectively.
Admins can add, edit, and categorize employees, while employees can log in to view their own profiles and related details.

This project is designed to streamline HR operations such as employee records, role assignments, category management, and attendance tracking.

---

## ⚙️ Project Requirements

Before running the project, ensure the following are installed on your system:

* **Node.js** (v16 or above) → [Download](https://nodejs.org/)
* **npm** (comes with Node.js)
* **MySQL Server** (v8 or above) → [Download](https://dev.mysql.com/downloads/mysql/)
* **MySQL Workbench or CLI** for managing database
* **VS Code** or any code editor

---

## 🗄️ Database Setup

1. **Create Database**

   ```sql
   CREATE DATABASE employee_ms;
   USE employee_ms;
   ```

2. **Create Tables**

   **Admin Table**

   ```sql
   CREATE TABLE admin (
       id INT AUTO_INCREMENT PRIMARY KEY,
       username VARCHAR(100) NOT NULL,
       email VARCHAR(100) UNIQUE NOT NULL,
       password VARCHAR(255) NOT NULL,
       role VARCHAR(50) NOT NULL,
       created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
   );
   ```

   **Employee Table**

   ```sql
   CREATE TABLE employee (
       id INT AUTO_INCREMENT PRIMARY KEY,
       name VARCHAR(100) NOT NULL,
       email VARCHAR(100) UNIQUE NOT NULL,
       role VARCHAR(100),
       salary DECIMAL(10,2),
       created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
       address VARCHAR(255),
       image VARCHAR(255),
       category_id INT,
       password VARCHAR(255)
   );
   ```

   **Category Table**

   ```sql
   CREATE TABLE category (
       id INT AUTO_INCREMENT PRIMARY KEY,
       name VARCHAR(100) NOT NULL,
       created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
   );
   ```

   **Attendance Table**

   ```sql
   CREATE TABLE attendance (
       id INT AUTO_INCREMENT PRIMARY KEY,
       employee_id INT,
       date DATE NOT NULL,
       status ENUM('Present','Absent','Leave') NOT NULL,
       created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
       FOREIGN KEY (employee_id) REFERENCES employee(id) ON DELETE CASCADE
   );
   ```

3. **Insert Sample Data**

   ```sql
   -- Insert Admins
   INSERT INTO admin (username, email, password, role) VALUES
   ('SuperAdmin', 'admin@gmail.com', '1234', 'admin'),
   ('HRManager', 'hr@gmail.com', 'hr1234', 'admin');

   -- Insert Categories
   INSERT INTO category (name) VALUES
   ('HR'), ('Engineering'), ('Sales'), ('Support'), ('Marketing');

   -- Insert Employees
   INSERT INTO employee (name, email, role, salary, address, category_id, password)
   VALUES ('Ganesh', 'employee@gmail.com', 'Developer', 50000, 'Bangalore', 2, '1234'),
          ('Anu', 'anu1@gmail.com', 'Designer', 5000, '1234 Main Street', 5, '1234');
   ```

---

🚀 How to Run the Project Locally
1. Clone the Repository
git clone <repository-url>
cd "Employee-Management-System-in-React-Node-MySQL"

2. Navigate to Updated Project
cd "Updated Employee MS with React + Node + MySQL"

3. Setup Backend (Server Side)
cd "Server Side"
npm install


Create a .env file inside Server Side:

DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=employee_ms
PORT=5000


Start backend:

npm start

4. Setup Frontend (React)
cd "../Front-End Folder"
npm install
npm start

This will run the frontend on `http://localhost:5173`.

---

### 4. Access the Application

* Open browser → [http://localhost:5173](http://localhost:5173)
* Choose **Login as Admin** or **Employee**
* Use the credentials you inserted in the database, e.g.:

  * **Admin Login** → `admin@gmail.com / 1234`
  * **Employee Login** → `employee@gmail.com / 1234`

---

## 📊 Features

* Admin Dashboard: Manage employees, categories, and attendance
* Add/Edit/Delete employees
* Assign categories (departments) to employees
* Track attendance
* Employee profile management
* Secure login for Admins and Employees

---

## ✅ Conclusion

The **Employee Management System** simplifies HR operations by providing an easy-to-use web platform for managing employees and departments.
It demonstrates a complete **MERN-style architecture (React + Node + MySQL)** with modular separation of backend and frontend.


