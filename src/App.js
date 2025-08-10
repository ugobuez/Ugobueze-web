import React from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import Home from "./Home";
import Login from "./Login";
import Header from "./Header";
import "./App.css";
import Signup from "./Signup";
import Dashboard from "./Dashboard";
import GiftCardDetails from "./GiftCardDetails";
import AdminDashboard from "./AdminDashboard";
import Wallet from "./Wallet";
import Activities from "./Activities";
import Sellgiftcard from "./Sellgiftcard";
import Referrals from "./Referrals";
import Forgotten from "./ForgottenPassword"

// ✅ NEW: Route guards
import ProtectedRoute from "./ProtectedRoute";
import AdminRoute from "./AdminRoute";

const App = () => {
  const location = useLocation();
  const hideHeaderRoutes = [
    "/login",
    "/signup",
    "/dashboard",
    "/admin/dashboard",
    "/Hot",
    "/wallet",
    "/transactions"
  ];

  return (
    <div>
      {!hideHeaderRoutes.includes(location.pathname) && <Header />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/Hot" element={<Sellgiftcard />} />
        <Route path="/Wallet" element={<Wallet />} />
        <Route path="/referrals" element={<Referrals />} />
        <Route path="/giftcard/:id" element={<GiftCardDetails />} />
        <Route path="/transactions" element={<Activities />} />
        <Route path="/forgot-password" element={<Forgotten />} />
        {/* ✅ Protected User Routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
        </Route>

        {/* ✅ Protected Admin Routes */}
        <Route element={<AdminRoute />}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
        </Route>
      </Routes>
    </div>
  );
};

export default App;
