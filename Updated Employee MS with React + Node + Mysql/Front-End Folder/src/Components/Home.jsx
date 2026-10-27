import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8081",
  withCredentials: true,
});

const StatCard = ({ icon, label, value, variant = "blue" }) => {
  const color =
    variant === "green"
      ? "badge-green"
      : variant === "amber"
      ? "badge-amber"
      : "badge-blue";

  return (
    <div className="glass p-3 h-100">
      <div className="d-flex align-items-center justify-content-between">
        <div>
          <div className="text-muted-2">{label}</div>
          <div className="display-6 fw-bold">{value}</div>
        </div>
        <div className={`badge ${color}`} style={{ fontSize: "1rem" }}>
          <i className={`bi ${icon}`} />
        </div>
      </div>
    </div>
  );
};

const Home = () => {
  const [adminTotal, setAdminTotal] = useState(0);
  const [employeeTotal, setEmployeeTotal] = useState(0);
  const [salaryTotal, setSalaryTotal] = useState(0);
  const [admins, setAdmins] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    api
      .get("/adminCount")
      .then(({ data }) => {
        if (!mounted) return;
        const val =
          (Array.isArray(data) && data[0]?.admin) ??
          data?.Result?.[0]?.admin ??
          0;
        setAdminTotal(Number(val) || 0);
      })
      .catch(() => setError((p) => p || "Failed to load admin count"));

    api
      .get("/employeeCount")
      .then(({ data }) => {
        if (!mounted) return;
        const val =
          (Array.isArray(data) && data[0]?.employee) ??
          data?.Result?.[0]?.employee ??
          0;
        setEmployeeTotal(Number(val) || 0);
      })
      .catch(() => setError((p) => p || "Failed to load employee count"));

    api
      .get("/salary")
      .then(({ data }) => {
        if (!mounted) return;
        const val =
          (Array.isArray(data) && data[0]?.sumOfSalary) ??
          data?.Result?.[0]?.sumOfSalary ??
          0;
        setSalaryTotal(Number(val) || 0);
      })
      .catch(() => setError((p) => p || "Failed to load salary total"));

    api
      .get("/admins")
      .then(({ data }) => {
        if (!mounted) return;
        const rows = Array.isArray(data) ? data : [];
        setAdmins(rows.slice(0, 5)); // show latest 5
      })
      .catch(() => setError((p) => p || "Failed to load recent admins"));

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="container-fluid">
      {error && (
        <div className="alert alert-warning glass border-0">⚠ {error}</div>
      )}

      {/* Stats row */}
      <div className="row g-3">
        <div className="col-12 col-md-4">
          <StatCard
            icon="bi-shield-lock"
            label="Total Admins"
            value={adminTotal}
            variant="blue"
          />
        </div>
        <div className="col-12 col-md-4">
          <StatCard
            icon="bi-people"
            label="Employees"
            value={employeeTotal}
            variant="green"
          />
        </div>
        <div className="col-12 col-md-4">
          <StatCard
            icon="bi-cash-coin"
            label="Salary (Sum)"
            value={`₹ ${salaryTotal.toLocaleString()}`}
            variant="amber"
          />
        </div>
      </div>

      {/* Recent admins + quick actions */}
      <div className="row g-3 mt-2">
        <div className="col-12 col-xl-8">
          <div className="glass p-3">
            <div className="d-flex align-items-center justify-content-between mb-2">
              <h5 className="m-0">Recent Admins</h5>
              <Link to="/dashboard/profile" className="btn btn-ghost">
                Manage Admins
              </Link>
            </div>
            <div className="table-responsive">
              <table className="table-modern">
                <thead>
                  <tr>
                    <th>Username</th>
                    <th>Email</th>
                    <th className="text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {admins.length === 0 && (
                    <tr>
                      <td colSpan={3} className="text-center text-muted-2 py-4">
                        No records
                      </td>
                    </tr>
                  )}
                  {admins.map((a) => (
                    <tr key={a.id || a.email}>
                      <td>{a.username || "—"}</td>
                      <td className="text-muted-2">{a.email || "—"}</td>
                      <td className="text-end">
                        <Link
                          to={`/dashboard/profile`}
                          className="btn btn-sm btn-ghost"
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="col-12 col-xl-4">
          <div className="glass p-3 h-100">
            <h5 className="mb-3">Quick Actions</h5>
            <div className="d-grid gap-2">
              <Link
                to="/dashboard/add_employee"
                className="btn btn-primary-modern"
              >
                <i className="bi bi-person-plus me-2" /> Add Employee
              </Link>
              <Link to="/dashboard/add_category" className="btn btn-ghost">
                <i className="bi bi-tag me-2" /> Add Category
              </Link>
              <Link to="/dashboard/employee" className="btn btn-ghost">
                <i className="bi bi-people me-2" /> View Employees
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
