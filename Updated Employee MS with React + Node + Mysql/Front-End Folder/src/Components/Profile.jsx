// src/Components/Profile.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const api = axios.create({
  baseURL: "http://localhost:8081",
  withCredentials: true,
});

export default function Profile() {
  const navigate = useNavigate();

  // Admin list + which one is selected
  const [admins, setAdmins] = useState([]);
  const [selectedId, setSelectedId] = useState("");

  // Current admin details
  const [admin, setAdmin] = useState(null);

  // UI state
  const [edit, setEdit] = useState(false);
  const [saving, setSaving] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState("");

  // On mount: find my id (from /verify) and load admin list
  useEffect(() => {
    let me = null;
    api
      .get("/verify")
      .then(({ data }) => {
        if (data?.Status === "Success" && data.role === "admin") me = data.id;
        return api.get("/admins");
      })
      .then(({ data }) => {
        const list = Array.isArray(data) ? data : [];
        setAdmins(list);
        setSelectedId(String(me || (list[0] && list[0].id) || ""));
      })
      .catch(() => setError("Failed to load admins"));
  }, []);

  // When selectedId changes, fetch that admin’s details
  useEffect(() => {
    if (!selectedId) return;
    setEdit(false);
    setNewPassword("");
    setError("");
    api
      .get(`/admins/${selectedId}`)
      .then(({ data }) => setAdmin(data))
      .catch(() => setError("Failed to load admin details"));
  }, [selectedId]);

  // example inside Dashboard or Profile
const logout = async () => {
  try { await api.get("/logout"); } catch {}
  localStorage.removeItem("valid");
  navigate("/");     // ← ALWAYS back to chooser
};


  const save = async () => {
    if (!admin) return;
    setSaving(true);
    setError("");
    try {
      const payload = {
        username: admin.username || "",
        email: admin.email || "",
        role: admin.role || "admin",
      };
      if (newPassword.trim()) payload.newPassword = newPassword.trim();

      const res = await api.put(`/admins/${admin.id}`, payload);
      if (res.data && res.data.Status === "Success") {
        setEdit(false);
        setNewPassword("");
        // refresh list (username/email may have changed)
        const listRes = await api.get("/admins");
        setAdmins(Array.isArray(listRes.data) ? listRes.data : []);
      } else {
        setError((res.data && res.data.Error) || "Update failed");
      }
    } catch {
      setError("Update failed");
    } finally {
      setSaving(false);
    }
  };

  const initials = ((admin && (admin.username || admin.email)) || "A")
    .split(" ")
    .map((s) => s[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="container d-flex justify-content-center">
      <div className="profile-card">
        {/* Banner */}
        <div className="profile-banner">
          <button className="btn btn-ghost" onClick={() => navigate(-1)}>
            <i className="bi bi-arrow-left me-1" />
            Back
          </button>

          {/* Switcher */}
          <div className="profile-switch">
            <label className="text-muted-2 me-2 d-none d-sm-inline">Switch admin</label>
            <select
              className="input-modern select-modern"
              value={selectedId}
              onChange={(e) => setSelectedId(e.target.value)}
            >
              {admins.map((a) => (
                <option key={a.id} value={a.id}>
                  #{a.id} — {a.username || a.email}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Avatar */}
        <div className="profile-avatar-wrap">
          <div className="profile-avatar-ring" />
          <div className="profile-avatar">{initials}</div>
        </div>

        {/* Headline */}
        <div className="text-center mt-4">
          {admin ? (
            <>
              {edit ? (
                <input
                  className="input-modern text-center w-auto"
                  value={admin.username || ""}
                  onChange={(e) => setAdmin({ ...admin, username: e.target.value })}
                />
              ) : (
                <h3 className="fw-bold mb-1">{admin.username || "—"}</h3>
              )}
              <div className="text-muted-2">
                {edit ? (
                  <input
                    className="input-modern text-center w-auto"
                    value={admin.role || ""}
                    onChange={(e) => setAdmin({ ...admin, role: e.target.value })}
                  />
                ) : (
                  <span>{admin.role || "admin"}</span>
                )}
              </div>
            </>
          ) : (
            <div className="text-muted">Loading…</div>
          )}
        </div>

        {error && <div className="alert alert-warning mt-3 mx-3">{error}</div>}

        {/* Info grid */}
        {admin && (
          <div className="profile-grid">
            <div>
              <span>ID</span>
              <b>{admin.id}</b>
            </div>

            <div>
              <span>Username</span>
              {edit ? (
                <input
                  className="input-modern w-100"
                  value={admin.username || ""}
                  onChange={(e) => setAdmin({ ...admin, username: e.target.value })}
                />
              ) : (
                <b>{admin.username || "—"}</b>
              )}
            </div>

            <div className="grid-2">
              <span>Email</span>
              {edit ? (
                <input
                  className="input-modern w-100"
                  type="email"
                  value={admin.email || ""}
                  onChange={(e) => setAdmin({ ...admin, email: e.target.value })}
                />
              ) : (
                <b className="truncate">{admin.email || "—"}</b>
              )}
            </div>

            <div>
              <span>Role</span>
              {edit ? (
                <input
                  className="input-modern w-100"
                  value={admin.role || ""}
                  onChange={(e) => setAdmin({ ...admin, role: e.target.value })}
                />
              ) : (
                <b>{admin.role || "admin"}</b>
              )}
            </div>

            {edit && (
              <div className="grid-2">
                <span>New password</span>
                <input
                  className="input-modern w-100"
                  type="password"
                  placeholder="Optional"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="profile-actions">
          <button className="btn btn-danger" onClick={logout}>
            <i className="bi bi-box-arrow-right me-1" />
            Logout
          </button>

          {edit ? (
            <div className="d-flex gap-2">
              <button className="btn btn-primary-modern" disabled={saving} onClick={save}>
                {saving ? "Saving…" : "Save"}
              </button>
              <button
                className="btn btn-ghost"
                onClick={() => {
                  setEdit(false);
                  setNewPassword("");
                }}
              >
                Cancel
              </button>
            </div>
          ) : (
            <button className="btn btn-ghost" onClick={() => setEdit(true)}>
              <i className="bi bi-pencil me-1" />
              Edit
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
