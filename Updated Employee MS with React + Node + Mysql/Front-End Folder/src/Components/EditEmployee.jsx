import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import api from "../api";

export default function EditEmployee() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    salary: "",
    address: "",
    category_id: "",
  });
  const [cats, setCats] = useState([]);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  // prettify header salary field display (but store raw number)
  const salaryDisplay = useMemo(
    () => (form.salary === "" ? "" : String(form.salary)),
    [form.salary]
  );

  useEffect(() => {
    // categories
    api
      .get("/auth/category")
      .then(({ data }) => {
        const rows = Array.isArray(data?.Result) ? data.Result : [];
        setCats(rows);
      })
      .catch(() => {});
    // employee
    api
      .get(`/employee/${id}`)
      .then(({ data }) => {
        const e = data?.Result || {};
        setForm({
          name: e.name ?? "",
          email: e.email ?? "",
          salary: e.salary ?? "",
          address: e.address ?? "",
          category_id: e.category_id ?? "",
        });
      })
      .catch(() => setMsg("Failed to load employee"));
  }, [id]);

  const updateField = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));

  const save = async (ev) => {
    ev.preventDefault();
    setSaving(true);
    setMsg("");
    try {
      const payload = {
        name: form.name.trim(),
        email: form.email.trim(),
        address: form.address.trim(),
        salary: Number(form.salary) || 0,
        category_id: form.category_id || null,
      };
      const { data } = await api.put(`/auth/edit_employee/${id}`, payload);
      if (data?.Status === true || data?.Status === "Success") {
        navigate("/dashboard/employee");
      } else {
        setMsg(data?.Error || "Update failed");
      }
    } catch {
      setMsg("Update failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="container py-4">
      {/* page header */}
      <div className="d-flex align-items-center justify-content-between mb-3">
        <div className="d-flex align-items-center gap-3">
          <div
            className="rounded-3 d-flex align-items-center justify-content-center"
            style={{
              width: 46,
              height: 46,
              background:
                "radial-gradient(120% 120% at 30% 20%, #3b82f6 0%, #2563eb 60%, #1e3a8a 100%)",
              boxShadow: "0 6px 22px rgba(59,130,246,.35)",
            }}
          >
            <i className="bi bi-pencil-square fs-5 text-white" />
          </div>
          <div>
            <h2 className="m-0 fw-bold">Edit Employee</h2>
            <div className="text-muted-2">ID #{id}</div>
          </div>
        </div>

        <Link to="/dashboard/employee" className="btn btn-ghost">
          <i className="bi bi-arrow-left me-2" />
          Back to list
        </Link>
      </div>

      {/* form card */}
      <div className="glass p-4 rounded-4 border-0 shadow-lg mx-auto" style={{ maxWidth: 960 }}>
        {msg && <div className="alert alert-warning mb-3">{msg}</div>}

        <form onSubmit={save} className="row g-3">
          <div className="col-12">
            <label className="form-label">Name</label>
            <input
              className="input-modern w-100"
              value={form.name}
              onChange={updateField("name")}
              placeholder="Enter name"
              required
            />
          </div>

          <div className="col-12">
            <label className="form-label">Email</label>
            <input
              className="input-modern w-100"
              type="email"
              value={form.email}
              onChange={updateField("email")}
              placeholder="user@company.com"
              required
            />
          </div>

          <div className="col-12 col-md-6">
            <label className="form-label">Salary</label>
            <input
              className="input-modern w-100"
              inputMode="numeric"
              value={salaryDisplay}
              onChange={(e) => {
                const raw = e.target.value.replace(/[^\d.]/g, "");
                setForm((p) => ({ ...p, salary: raw }));
              }}
              placeholder="50000"
            />
          </div>

          <div className="col-12 col-md-6">
            <label className="form-label">Address</label>
            <input
              className="input-modern w-100"
              value={form.address}
              onChange={updateField("address")}
              placeholder="1234 Main St"
            />
          </div>

          <div className="col-12">
            <label className="form-label">Category (Department)</label>
            <select
              className="input-modern w-100"
              value={form.category_id ?? ""}
              onChange={updateField("category_id")}
            >
              <option value="">Unassigned</option>
              {cats.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="col-12 d-flex gap-2 pt-2">
            <button className="btn btn-primary-modern px-4" disabled={saving}>
              <i className="bi bi-save2 me-2" />
              {saving ? "Saving…" : "Save Changes"}
            </button>
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => navigate("/dashboard/employee")}
            >
              <i className="bi bi-x-circle me-2" />
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
