import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api"; // ✅ central axios instance (http://localhost:8081 + withCredentials)

export default function Start() {
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is already authenticated
    api
      .get("/verify")
      .then((res) => {
        if (res.data?.Status === "Success") {
          if (res.data.role === "admin") {
            navigate("/dashboard");
          } else if (res.data.role === "employee") {
            navigate(`/employee_detail/${res.data.id}`); // ✅ employee redirect
          }
        }
      })
      .catch(() => {
        // Not logged in → stay on chooser page
      });
  }, [navigate]);

  return (
    <div className="d-flex justify-content-center align-items-center vh-100 loginPage">
      <div className="p-3 rounded w-25 border loginForm text-center">
        <h2 className="mb-4">Login As</h2>
        <div className="d-flex justify-content-around">
          <button
            className="btn btn-primary px-4"
            onClick={() => navigate("/employee_login")}
          >
            Employee
          </button>
          <button
            className="btn btn-success px-4"
            onClick={() => navigate("/login")}
          >
            Admin
          </button>
        </div>
      </div>
    </div>
  );
}
