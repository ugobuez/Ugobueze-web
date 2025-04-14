import React from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import Home from "./Home";
import Login from "./Login";
import Header from "./Header";
import "./App.css";
import Signup from "./Signup";
import Dashboard from "./Dashboard";
import AuthGuard from "./AuthGuard";
import GiftCards from "./Giftcard";
import GiftCardDetails from "./GiftCardDetails";
import AdminDashboard from "./AdminDashboard";
import AdminLogin from "./Admin";


const App = () => {
  const location = useLocation();
  const hideHeaderRoutes = ["/login", "/signup", "/dashboard"];

  return (
    <div>
      {!hideHeaderRoutes.includes(location.pathname) && <Header />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/authguard" element={<AuthGuard />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/" element={<GiftCards />} />
        <Route path="/giftcard/:id" element={<GiftCardDetails />} />
        <Route path='/admin/login' element={<AdminLogin/>}/>

      </Routes>
    </div>
  );
};

export default App;
