import { useEffect, useState } from "react";
import { Outlet, Navigate, useLocation } from "react-router-dom";
import axios from "axios";

export default function PrivateRoute() {
  const [loading, setLoading] = useState(true);
  const [ok, setOk] = useState(false);
  const location = useLocation();

  useEffect(() => {
    axios
      .get("http://localhost:8081/verify", { withCredentials: true })
      .then(({ data }) => setOk(data?.Status === "Success"))
      .catch(() => setOk(false))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return null;
  return ok ? (
    <Outlet />
  ) : (
    <Navigate to="/" replace state={{ from: location }} />
  );
}
