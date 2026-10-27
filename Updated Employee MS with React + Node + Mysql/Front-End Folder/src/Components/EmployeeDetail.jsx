import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../api"; // <- default export from src/api.js

export default function EmployeeDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [emp, setEmp] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  // inline SVG fallback avatar (no network)
  const fallbackAvatar = useMemo(
    () =>
      `data:image/svg+xml;utf8,` +
      encodeURIComponent(
        `<svg xmlns='http://www.w3.org/2000/svg' width='180' height='180'>
          <defs>
            <linearGradient id='g' x1='0' y1='0' x2='1' y2='1'>
              <stop offset='0%' stop-color='#4f46e5'/>
              <stop offset='100%' stop-color='#0ea5e9'/>
            </linearGradient>
          </defs>
          <rect width='100%' height='100%' rx='90' fill='url(#g)'/>
          <g fill='white' opacity='0.9' transform='translate(35,30)'>
            <circle cx='55' cy='40' r='28'/>
            <rect x='0' y='85' width='140' height='70' rx='35'/>
          </g>
        </svg>`
      ),
    []
  );

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setErr("");

    api
      .get(`/employee/${id}`)
      .then(({ data }) => {
        if (!mounted) return;

        // your server sometimes returns {Status:true, Result:{...}}
        // and sometimes returns the row directly — normalize it:
        const row = data?.Result ?? data;
        if (!row || !row.id) {
          setErr("Employee not found");
          setEmp(null);
        } else {
          setEmp(row);
        }
      })
      .catch(() => {
        if (mounted) {
          setErr("Failed to load employee");
          setEmp(null);
        }
      })
      .finally(() => mounted && setLoading(false));

    return () => {
      mounted = false;
    };
  }, [id]);

  const handleLogout = async () => {
    try {
      await api.get("/logout");
    } catch {}
    localStorage.removeItem("valid");
    navigate("/chooser"); // <- go to chooser page
  };

  const imgSrc =
    emp?.image ? `http://localhost:8081/images/${emp.image}` : fallbackAvatar;

  const salaryPretty =
    emp?.salary || emp?.salary === 0
      ? `₹ ${Number(emp.salary).toLocaleString()}`
      : "—";

  return (
    <div className="ed-layout">
      {/* --- Header --- */}
      <header className="ed-header glass">
        <div className="ed-header__left">
          <h1 className="ed-title">Employee Detail</h1>
          {emp?.name ? <span className="ed-subtitle">{emp.name}</span> : null}
        </div>

        <div className="ed-header__right">
        </div>
      </header>

      {/* --- Sidebar --- */}
      <aside className="ed-sidebar glass">
        <div className="ed-avatar-wrap">
          <img className="ed-avatar" src={imgSrc} alt={emp?.name || "User"} />
        </div>

        <div className="ed-name">{emp?.name || "—"}</div>
        <div className="ed-chips">
          <span className="chip">
            <i className="bi bi-hash me-1" />
            {emp?.id ?? "—"}
          </span>
          <span className="chip">
            <i className="bi bi-briefcase me-1" />
            {emp?.role || "—"}
          </span>
          <span className="chip">
            <i className="bi bi-diagram-3 me-1" />
            {emp?.category_name || "Unassigned"}
          </span>
        </div>

        <button className="btn btn-danger w-100 mt-2" onClick={handleLogout}>
          <i className="bi bi-box-arrow-right me-2" />
          Logout
        </button>
      </aside>

      {/* --- Main content --- */}
      <main className="ed-main">
        {loading ? (
          <div className="glass p-4 text-muted">Loading…</div>
        ) : err ? (
          <div className="alert alert-warning glass">{err}</div>
        ) : (
          <>
            {/* About card */}
            <section className="glass ed-card">
              <div className="ed-card__title">
                <i className="bi bi-person-badge me-2" />
                Profile Summary
              </div>

              <div className="ed-grid">
                <div>
                  <div className="label">Email</div>
                  <div className="value">{emp?.email || "—"}</div>
                </div>
                <div>
                  <div className="label">Address</div>
                  <div className="value">{emp?.address || "—"}</div>
                </div>
                <div>
                  <div className="label">Salary</div>
                  <div className="value">{salaryPretty}</div>
                </div>
                <div>
                  <div className="label">Role (Job title)</div>
                  <div className="value">{emp?.role || "—"}</div>
                </div>
                <div>
                  <div className="label">Department</div>
                  <div className="value">{emp?.category_name || "Unassigned"}</div>
                </div>
              </div>
            </section>

            {/* Contact card */}
            <section className="glass ed-card">
              <div className="ed-card__title">
                <i className="bi bi-envelope me-2" />
                Contact & Meta
              </div>

              <div className="ed-grid">
                <div>
                  <div className="label">Email</div>
                  <div className="value">{emp?.email || "—"}</div>
                </div>
                <div>
                  <div className="label">Employee ID</div>
                  <div className="value">{emp?.id ?? "—"}</div>
                </div>
          
                  </div>
            </section>
          </>
        )}
      </main>
    </div>
  );
}
