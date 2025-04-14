import React, { useState, useEffect } from "react";
import axios from "axios";

const App = () => {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold text-center">Gift Card Management</h1>
      <UserDashboard />
      <AdminDashboard />
    </div>
  );
};

const UserDashboard = () => {
  const [userId, setUserId] = useState("");
  const [value, setValue] = useState("");
  const [image, setImage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("userId", userId);
    formData.append("value", value);
    formData.append("image", image);
    
    await axios.post("/submit-giftcard", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    alert("Gift card submitted!");
  };

  return (
    <div className="p-4 border rounded shadow my-4">
      <h2 className="text-xl font-semibold">Submit Gift Card</h2>
      <form onSubmit={handleSubmit} className="space-y-2">
        <input type="text" placeholder="User ID" value={userId} onChange={(e) => setUserId(e.target.value)} className="w-full p-2 border rounded" required />
        <input type="number" placeholder="Gift Card Value" value={value} onChange={(e) => setValue(e.target.value)} className="w-full p-2 border rounded" required />
        <input type="file" onChange={(e) => setImage(e.target.files[0])} className="w-full p-2 border rounded" required />
        <button type="submit" className="bg-blue-500 text-white p-2 rounded">Submit</button>
      </form>
    </div>
  );
};
