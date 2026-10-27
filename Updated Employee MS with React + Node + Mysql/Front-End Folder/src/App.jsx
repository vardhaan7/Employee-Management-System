import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Components (match your filenames exactly)
import Start from "./Components/Start";
import LoginChooser from "./Components/LoginChooser";
import AdminLogin from "./Components/Login";
import EmployeeLogin from "./Components/EmployeeLogin";
import Dashboard from "./Components/Dashboard";
import PrivateRoute from "./Components/PrivateRoute";
import Home from "./Components/Home";
import Employee from "./Components/Employee";            // ✅ use Employee, not EmployeeList
import EmployeeDetail from "./Components/EmployeeDetail";
import Category from "./Components/Category";
import AddCategory from "./Components/AddCategory";
import AddEmployee from "./Components/AddEmployee";
import EditEmployee from "./Components/EditEmployee";
import Profile from "./Components/Profile";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Chooser / landing */}
        <Route path="/" element={<Start />} />
        <Route path="/choose" element={<LoginChooser />} />

        {/* Public logins */}
        <Route path="/login" element={<AdminLogin />} />
        <Route path="/employee_login" element={<EmployeeLogin />} />

        {/* Public employee detail (as requested) */}
        <Route path="/employee_detail/:id" element={<EmployeeDetail />} />

        {/* Admin-area (protected) */}
        <Route element={<PrivateRoute />}>
          <Route path="/dashboard" element={<Dashboard />}>
            <Route index element={<Home />} />
            <Route path="employee" element={<Employee />} />        {/* ✅ fixed */}
            <Route path="category" element={<Category />} />
            <Route path="profile" element={<Profile />} />
            <Route path="add_category" element={<AddCategory />} />
            <Route path="add_employee" element={<AddEmployee />} />
            <Route path="edit_employee/:id" element={<EditEmployee />} />
          </Route>
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
