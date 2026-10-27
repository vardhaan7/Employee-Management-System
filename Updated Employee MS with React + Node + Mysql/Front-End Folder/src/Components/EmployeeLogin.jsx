import React, { useState } from "react";
import "./style.css";
import { useNavigate } from "react-router-dom";
// Use your axios instance if you have one, otherwise fall back to plain axios
import axios from "axios";

// If you already have ../api with an axios instance, use that instead:
// import { api } from "../api";
// const client = api;
const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8081",
  withCredentials: true,
});

const EmployeeLogin = () => {
  const [values, setValues] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const navigate = useNavigate();

const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    const res = await api.post("/employeelogin", { email, password });
    if (res.data?.loginStatus) {
      localStorage.setItem("valid", true);
      navigate(`/employee_detail/${res.data.id}`);  // ✅ correct path
    } else {
      setError(res.data?.Error || "Invalid credentials");
    }
  } catch {
    setError("Login failed");
  }
};

  return (
    <div className="d-flex justify-content-center align-items-center vh-100 loginPage">
      <div className="p-3 rounded w-25 border loginForm">
        <div className="text-warning">{error && error}</div>
        <h2>Login Page</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="email">
              <strong>Email:</strong>
            </label>
            <input
              id="email"
              type="email"
              name="email"
              autoComplete="off"
              placeholder="Enter Email"
              className="form-control rounded-0"
              required
              onChange={(e) =>
                setValues((v) => ({ ...v, email: e.target.value }))
              }
            />
          </div>

          <div className="mb-3">
            <label htmlFor="password">
              <strong>Password:</strong>
            </label>
            <input
              id="password"
              type="password"
              name="password"
              placeholder="Enter Password"
              className="form-control rounded-0"
              required
              onChange={(e) =>
                setValues((v) => ({ ...v, password: e.target.value }))
              }
            />
          </div>

          <button className="btn btn-success w-100 rounded-0 mb-2">
            Log in
          </button>

          <div className="mb-1">
            <input type="checkbox" id="tick" className="me-2" />
            <label htmlFor="tick">You are Agree with terms &amp; conditions</label>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EmployeeLogin;
