// src/Components/AddEmployee.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

const api = axios.create({
  baseURL: "http://localhost:8081",
  withCredentials: true,
});

export default function AddEmployee() {
  const navigate = useNavigate();

  const [cats, setCats] = useState([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    salary: "",
    address: "",
    category_id: "",
    image: null,
  });

  useEffect(() => {
    api
      .get("/auth/category")
      .then(({ data }) => setCats(Array.isArray(data?.Result) ? data.Result : []))
      .catch(() => setCats([]));
  }, []);

  const onChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "image") {
      const file = files && files[0] ? files[0] : null;
      setForm((f) => ({ ...f, image: file }));
      return;
    }
    setForm((f) => ({ ...f, [name]: value }));
  };

  const validate = () => {
    if (!form.name.trim()) return "Name is required";
    if (!form.email.trim()) return "Email is required";
    if (!/\S+@\S+\.\S+/.test(form.email)) return "Enter a valid email";
    if (!form.password.trim()) return "Password is required";
    if (form.salary && isNaN(Number(form.salary))) return "Salary must be a number";
    return "";
  };

  const submit = async (e) => {
    e.preventDefault();
    const v = validate();
    if (v) return setError(v);
    setError("");
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append("name", form.name);
      fd.append("email", form.email);
      fd.append("password", form.password);
      fd.append("salary", form.salary || 0);
      fd.append("address", form.address);
      fd.append("category_id", form.category_id || "");
      if (form.image) fd.append("image", form.image);

      const res = await api.post("/create", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (res.data?.Status) {
        navigate("/dashboard/employee");
      } else {
        setError(res.data?.Error || "Failed to create employee");
      }
    } catch {
      setError("Failed to create employee");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="container d-flex justify-content-center">
      <div className="glass p-4" style={{ maxWidth: 600, width: "100%" }}>
        <div className="d-flex align-items-center justify-content-between mb-3">
          <h3 className="m-0">Add Employee</h3>
          <Link to="/dashboard/employee" className="btn btn-ghost">
            Back to list
          </Link>
        </div>

        {error && <div className="alert alert-warning">{error}</div>}

        <form onSubmit={submit} className="d-grid gap-3">
          <div>
            <label className="form-label">Name</label>
            <input
              className="input-modern w-100"
              name="name"
              placeholder="Enter Name"
              value={form.name}
              onChange={onChange}
            />
          </div>

          <div>
            <label className="form-label">Email</label>
            <input
              className="input-modern w-100"
              name="email"
              type="email"
              placeholder="Enter Email"
              value={form.email}
              onChange={onChange}
            />
          </div>

          <div>
            <label className="form-label">Password</label>
            <input
              className="input-modern w-100"
              name="password"
              type="password"
              placeholder="Enter Password"
              value={form.password}
              onChange={onChange}
            />
          </div>

          <div>
            <label className="form-label">Salary</label>
            <input
              className="input-modern w-100"
              name="salary"
              inputMode="numeric"
              placeholder="Enter Salary"
              value={form.salary}
              onChange={onChange}
            />
          </div>

          <div>
            <label className="form-label">Address</label>
            <input
              className="input-modern w-100"
              name="address"
              placeholder="1234 Main St"
              value={form.address}
              onChange={onChange}
            />
          </div>

          <div>
            <label className="form-label">Category</label>
            <select
              className="input-modern select-modern w-100"
              name="category_id"
              value={form.category_id}
              onChange={onChange}
            >
              <option value="">Select category</option>
              {cats.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="form-label">Select Image</label>
            <input
              className="form-control"
              name="image"
              type="file"
              accept="image/*"
              onChange={onChange}
            />
          </div>

          <div className="d-flex gap-2 mt-2">
            <button className="btn btn-primary-modern" disabled={saving}>
              {saving ? "Adding…" : "Add Employee"}
            </button>
            <Link to="/dashboard/employee" className="btn btn-ghost">
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
