import React, { useEffect, useState } from "react";
import { Link, Outlet, useNavigate, useLocation } from "react-router-dom";
import "bootstrap-icons/font/bootstrap-icons.css";
import axios from "axios";
import "../index.css";
import "./style.css";

const api = axios.create({
  baseURL: "http://localhost:8081",
  withCredentials: true,
});

const NavItem = ({ to, icon, label }) => {
  const location = useLocation();
  const active = location.pathname === to;
  return (
    <li className="nav-item my-1">
      <Link
        to={to}
        className={`nav-link d-flex align-items-center gap-2 sidebar-link ${active ? "active" : ""}`}
        aria-current={active ? "page" : undefined}
      >
        <i className={`bi ${icon}`} />
        <span className="d-none d-lg-inline">{label}</span>
      </Link>
    </li>
  );
};

export default function Dashboard() {
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("sidebar-collapsed");
    if (saved) setCollapsed(saved === "1");
  }, []);

  const toggleCollapse = () => {
    const val = !collapsed;
    setCollapsed(val);
    localStorage.setItem("sidebar-collapsed", val ? "1" : "0");
  };

  // ✅ define handleLogout (was missing)
  const handleLogout = async () => {
    try {
      await api.get("/logout");
    } catch {}
    localStorage.removeItem("valid");
    navigate("/"); // back to chooser
  };

  return (
    <div className={`layout ${collapsed ? "layout--collapsed" : ""}`}>
      {/* Sidebar */}
      <aside className="sidebar d-none d-lg-flex flex-column p-3">
        <div className="d-flex align-items-center justify-content-between mb-3">
          <Link to="/dashboard" className="d-flex align-items-center gap-2">
            <div
              className="rounded-3"
              style={{
                width: 36,
                height: 36,
                background: "linear-gradient(180deg,#3b82f6,#2563eb)",
              }}
            />
            {!collapsed && <h5 className="m-0 fw-bold">EMS</h5>}
          </Link>
          <button
            className="btn btn-sm btn-ghost ms-auto"
            title="Collapse"
            onClick={toggleCollapse}
          >
            <i className={`bi ${collapsed ? "bi-arrow-bar-right" : "bi-arrow-bar-left"}`} />
          </button>
        </div>

        <ul className="nav nav-pills flex-column mb-auto">
          <NavItem to="/dashboard" icon="bi-speedometer2" label="Overview" />
          <NavItem to="/dashboard/employee" icon="bi-people" label="Employees" />
          <NavItem to="/dashboard/category" icon="bi-tags" label="Categories" />
          <NavItem to="/dashboard/profile" icon="bi-person-circle" label="Profile" />
        </ul>

        <div className="mt-auto">
          <button className="btn btn-ghost w-100" onClick={handleLogout}>
            <i className="bi bi-box-arrow-right me-2" />
            <span className="d-none d-lg-inline">Logout</span>
          </button>
        </div>
      </aside>

      {/* Mobile drawer */}
      <div className="d-lg-none">
        {mobileOpen && (
          <div
            className="position-fixed top-0 start-0 bottom-0 end-0"
            style={{ background: "rgba(0,0,0,.6)", zIndex: 30 }}
            onClick={() => setMobileOpen(false)}
          />
        )}
        <div
          className={`position-fixed top-0 bottom-0 start-0 p-3 sidebar ${mobileOpen ? "" : "d-none"}`}
          style={{ width: 260, zIndex: 40 }}
        >
          <div className="d-flex align-items-center justify-content-between mb-3">
            <Link to="/dashboard" className="d-flex align-items-center gap-2" onClick={() => setMobileOpen(false)}>
              <div
                className="rounded-3"
                style={{
                  width: 36,
                  height: 36,
                  background: "linear-gradient(180deg,#3b82f6,#2563eb)",
                }}
              />
              <h5 className="m-0 fw-bold">EMS</h5>
            </Link>
            <button className="btn btn-ghost" onClick={() => setMobileOpen(false)}>
              <i className="bi bi-x-lg" />
            </button>
          </div>
          <ul className="nav nav-pills flex-column mb-auto" onClick={() => setMobileOpen(false)}>
            <NavItem to="/dashboard" icon="bi-speedometer2" label="Overview" />
            <NavItem to="/dashboard/employee" icon="bi-people" label="Employees" />
            <NavItem to="/dashboard/category" icon="bi-tags" label="Categories" />
            <NavItem to="/dashboard/profile" icon="bi-person-circle" label="Profile" />
          </ul>
          <button className="btn btn-ghost w-100 mt-auto" onClick={handleLogout}>
            <i className="bi bi-box-arrow-right me-2" /> Logout
          </button>
        </div>
      </div>

      {/* Main content */}
      <main className="content">
        {/* Topbar */}
        <div className="topbar glass d-flex align-items-center justify-content-between px-3 py-2 rounded-3">
          <div className="d-flex align-items-center gap-2">
            <button className="btn btn-ghost d-lg-none" onClick={() => setMobileOpen(true)} aria-label="Open menu">
              <i className="bi bi-list" />
            </button>
            <h5 className="m-0 fw-semibold">Employee Management</h5>
          </div>
          <div className="d-flex align-items-center gap-2">
            <span className="badge badge-soft">Admin</span>
            <div className="action-icon"><i className="bi bi-bell" /></div>
            <div className="action-icon"><i className="bi bi-gear" /></div>
          </div>
        </div>

        <Outlet />
      </main>
    </div>
  );
}
