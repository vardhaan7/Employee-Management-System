import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";   // ✅ default import


const AddCategory = () => {
  const [name, setName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErr("");

    const trimmed = name.trim();
    if (!trimmed) {
      setErr("Category name is required.");
      return;
    }

    try {
      setSubmitting(true);
      // Backend route we added: POST /auth/add_category  body: { name: "..." }
      const res = await api.post("/auth/add_category", { name: trimmed });

      if (res.data?.Status) {
        navigate("/dashboard/category");
      } else {
        setErr(res.data?.Error || "Failed to add category.");
      }
    } catch (error) {
      console.error("Add category failed:", error);
      setErr("Network or server error.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center h-75">
      <div className="p-3 rounded w-25 border">
        <h2>Add Category</h2>

        {err && <div className="alert alert-warning py-2">{err}</div>}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="categoryName">
              <strong>Category:</strong>
            </label>
            <input
              id="categoryName"
              type="text"
              name="category"
              placeholder="Enter category"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="form-control rounded-0"
              autoComplete="off"
            />
          </div>

          <button
            className="btn btn-success w-100 rounded-0 mb-2"
            type="submit"
            disabled={submitting}
          >
            {submitting ? "Adding..." : "Add Category"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddCategory;
