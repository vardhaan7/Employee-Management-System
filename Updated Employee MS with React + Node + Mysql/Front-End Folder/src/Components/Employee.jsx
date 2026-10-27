// src/Components/Employee.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api";

export default function Employee() {
  const navigate = useNavigate();

  const [rows, setRows] = useState([]);
  const [q, setQ] = useState("");
  const [cats, setCats] = useState([]);
  const [catId, setCatId] = useState(""); // filter
  const [error, setError] = useState("");

  const loadEmployees = () => {
    setError("");
    api
      .get("/employee")
      .then(({ data }) => setRows(Array.isArray(data?.Result) ? data.Result : []))
      .catch(() => setError("Failed to load employees"));
  };

  useEffect(() => {
    loadEmployees();
    api
      .get("/auth/category")
      .then(({ data }) => setCats(Array.isArray(data?.Result) ? data.Result : []))
      .catch(() => {});
  }, []);

  const catMap = useMemo(() => {
    const m = {};
    for (const c of cats) m[String(c.id)] = c.name;
    return m;
  }, [cats]);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return rows.filter((r) => {
      // category filter
      let okCat = true;
      if (catId === "__none") okCat = !r.category_id;
      else if (catId) okCat = String(r.category_id) === String(catId);

      if (!term) return okCat;

      const hay = `${r.name ?? ""} ${r.email ?? ""} ${r.address ?? ""}`.toLowerCase();
      return okCat && hay.includes(term);
    });
  }, [rows, q, catId]);

  const deptName = (emp) => {
    if (!emp?.category_id) return "Unassigned";
    return catMap[String(emp.category_id)] || "—";
  };

  const prettySalary = (n) =>
    typeof n === "number" || /^\d+(\.\d+)?$/.test(String(n))
      ? `₹ ${Number(n).toLocaleString()}`
      : "—";

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this employee?")) return;
    try {
      const tries = [`/employee/delete/${id}`, `/delete/${id}`, `/employees/${id}`];
      for (const ep of tries) {
        try {
          const { data } = await api.delete(ep);
          if (data?.Status === true || data?.Status === "Success") break;
        } catch {}
      }
      loadEmployees();
    } catch {
      setError("Delete failed");
    }
  };

  return (
    <div className="container-fluid">
      {/* Line 1: heading only */}
      <div className="d-flex align-items-center mb-2">
        <h2 className="m-0">Employees</h2>
      </div>

      {/* Line 2: search + department + add button (same row) */}
      <div className="d-flex flex-wrap align-items-center gap-2 mb-3">
        <input
          className="input-modern"
          style={{ flex: "1 1 420px", minWidth: 260 }}
          placeholder="Search name, email, address..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
          aria-label="Search employees"
        />

        <select
          className="input-modern"
          style={{ flex: "0 0 260px", minWidth: 200 }}
          value={catId}
          onChange={(e) => setCatId(e.target.value)}
          aria-label="Filter by department"
          title="Filter by department"
        >
          <option value="">All Departments</option>
          {cats.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
          <option value="__none">Unassigned</option>
        </select>

        <button
          className="btn btn-primary-modern"
          style={{ flex: "0 0 auto" }}
          onClick={() => navigate("/dashboard/add_employee")}
        >
          <i className="bi bi-plus-lg me-2" />
          Add Employee
        </button>
      </div>

      {error && <div className="alert alert-warning glass border-0">⚠ {error}</div>}

      {/* Table */}
      <div className="glass border-0 rounded-4 p-0 overflow-hidden">
        <div className="table-responsive">
          <table className="table-modern m-0">
            <thead>
              <tr>
                <th style={{ width: 76 }}>Emp</th>
                <th style={{ width: 220 }}>Name</th>
                <th>Email</th>
                <th style={{ width: 160 }}>Dept</th>
                <th style={{ width: 140 }}>Salary</th>
                <th style={{ width: 260 }}>Address</th>
                <th style={{ width: 140 }} className="text-end">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-4 text-muted-2">
                    No employees
                  </td>
                </tr>
              )}

              {filtered.map((r) => (
                <tr key={r.id}>
                  <td>
                    {r.image ? (
                      <img
                        src={`http://localhost:8081/images/${r.image}`}
                        alt={r.name || "employee"}
                        className="rounded-circle"
                        style={{ width: 44, height: 44, objectFit: "cover" }}
                        onError={(e) => {
                          e.currentTarget.src = "https://placehold.co/88x88?text=EMP";
                        }}
                      />
                    ) : (
                      <div
                        className="rounded-circle d-inline-flex align-items-center justify-content-center"
                        style={{
                          width: 44,
                          height: 44,
                          background: "linear-gradient(180deg,#334155,#0f172a)",
                          color: "#9ca3af",
                        }}
                        title="No photo"
                      >
                        <i className="bi bi-person" />
                      </div>
                    )}
                  </td>

                  <td className="fw-semibold">{r.name || "—"}</td>
                  <td className="text-muted-2">{r.email || "—"}</td>
                  <td className="text-muted-2">{deptName(r)}</td>
                  <td>{prettySalary(r.salary)}</td>
                  <td className="text-muted-2">{r.address || "—"}</td>

                  <td className="text-end">
                    <div className="d-inline-flex gap-2">
                      <Link
                        className="btn btn-sm btn-ghost"
                        to={`/dashboard/edit_employee/${r.id}`}
                        title="Edit"
                      >
                        <i className="bi bi-pencil-square" />
                      </Link>
                      <button
                        className="btn btn-sm btn-ghost"
                        title="Delete"
                        onClick={() => handleDelete(r.id)}
                      >
                        <i className="bi bi-trash3" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
