// src/Components/LoginChooser.jsx
import React from "react";
import { useNavigate } from "react-router-dom";

export default function LoginChooser() {
  const navigate = useNavigate();

  return (
    <div className="d-flex flex-column align-items-center justify-content-center vh-100 text-center">
      <h2 className="mb-4">Login As</h2>
      <div className="d-flex gap-3">
        <button
          className="btn btn-primary"
          onClick={() => navigate("/login")}
        >
          Admin
        </button>
        <button
          className="btn btn-success"
          onClick={() => navigate("/employee_login")}
        >
          Employee
        </button>
      </div>
    </div>
  );
}
