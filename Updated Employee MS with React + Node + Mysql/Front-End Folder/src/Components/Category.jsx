// src/Components/Category.jsx
import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8081",
  withCredentials: true,
});

export default function Category() {
  const [cats, setCats] = useState([]);
  const [loading, setLoading] = useState(true);

  // search state
  const [q, setQ] = useState("");

  // add form state (hidden until button click)
  const [showAdd, setShowAdd] = useState(false);
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const load = () => {
    setLoading(true);
    api
      .get("/auth/category")
      .then(({ data }) => setCats(Array.isArray(data?.Result) ? data.Result : []))
      .catch(() => setCats([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return term ? cats.filter((c) => (c.name || "").toLowerCase().includes(term)) : cats;
  }, [cats, q]);

  const add = async (e) => {
    e.preventDefault();
    setError("");
    if (!name.trim()) return setError("Category name is required");
    setSaving(true);
    try {
      const res = await api.post("/auth/add_category", { name: name.trim() });
      if (res.data?.Status) {
        setName("");
        setShowAdd(false);
        load();
      } else {
        setError(res.data?.Error || "Failed to add category");
      }
    } catch {
      setError("Failed to add category");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="container-fluid">
      {/* Top controls: Search first, then Add button */}
      <div className="glass p-3 mb-3">
        <div className="d-flex flex-wrap gap-2 align-items-center">
          <input
            className="input-modern flex-grow-1"
            placeholder="Search categories..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />

          <button
            className="btn btn-primary-modern"
            onClick={() => setShowAdd((s) => !s)}
            aria-expanded={showAdd}
            aria-controls="add-cat-form"
          >
            <i className="bi bi-plus-lg me-2" />
            {showAdd ? "Close" : "Add Category"}
          </button>
        </div>

        {/* Inline add form (hidden until user clicks button) */}
        {showAdd && (
          <form id="add-cat-form" onSubmit={add} className="row g-2 align-items-end mt-3">
            <div className="col-12 col-md-6 col-lg-4">
              <label className="form-label">Category name</label>
              <input
                className="input-modern w-100"
                placeholder="e.g. Engineering"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoFocus
              />
            </div>
            <div className="col-12 col-md-auto">
              <button className="btn btn-primary-modern" disabled={saving}>
                {saving ? "Adding…" : "Add"}
              </button>
            </div>
            {error && (
              <div className="col-12">
                <div className="alert alert-warning mt-1 mb-0">{error}</div>
              </div>
            )}
          </form>
        )}
      </div>

      {/* Category table */}
      <div className="glass p-0">
        <div className="table-responsive">
          <table className="table-modern">
            <thead>
              <tr>
                <th style={{ width: 120 }} className="text-muted-2">ID</th>
                <th>Name</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={2} className="text-center py-4">Loading…</td>
                </tr>
              )}
              {!loading && filtered.length === 0 && (
                <tr>
                  <td colSpan={2} className="text-center text-muted-2 py-4">No categories</td>
                </tr>
              )}
              {!loading &&
                filtered.map((c) => (
                  <tr key={c.id}>
                    <td className="text-muted-2" style={{ width: 120 }}>{c.id}</td>
                    <td className="fw-semibold">{c.name}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
