import React, { useState, useEffect } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";

const AdminDashboard = () => {
  const [redemptions, setRedemptions] = useState([]);
  const [error, setError] = useState("");
  const [reason, setReason] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Fetch redemptions
  useEffect(() => {
    const fetchRedemptions = async () => {
      setIsLoading(true);
      const token = localStorage.getItem("adminToken");
      if (!token) {
        setError("Please log in as an admin to view redemptions");
        setIsLoading(false);
        return;
      }

      try {
        const response = await axios.get("http://localhost:3500/api/admin/redemptions", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setRedemptions(response.data);
        setError("");
      } catch (err) {
        console.error("Fetch error:", err.response || err);
        handleError(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchRedemptions();
  }, []);

  // Handle error responses
  const handleError = (err) => {
    if (err.response?.status === 403) {
      setError("Access denied: Admins only. Please re-login.");
      localStorage.removeItem("token"); // Clear invalid token
    } else if (err.response?.status === 401) {
      setError("Session expired. Please log in again.");
      localStorage.removeItem("token");
    } else {
      setError(`Failed to fetch redemptions: ${err.response?.data?.message || err.message}`);
    }
  };

  // Handle status change (accept or reject)
  const handleStatusChange = async (redemptionId, action, rejectReason = "") => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Please log in as an admin to perform this action");
        return;
      }

      const url = `http://localhost:3500/api/admin/redemptions/${redemptionId}/${action}`;
      const config = {
        headers: { Authorization: `Bearer ${token}` },
        data: action === "reject" ? { reason: rejectReason } : {},
      };

      await axios.post(url, config.data, { headers: config.headers });

      setRedemptions((prev) =>
        prev.map((redemption) =>
          redemption._id === redemptionId
            ? {
                ...redemption,
                status: action === "accept" ? "approved" : "rejected",
                reason: action === "reject" ? rejectReason : undefined,
              }
            : redemption
        )
      );

      setReason(""); // Clear reason input after action
      alert(`Redemption ${action}ed successfully`);
      setError("");
    } catch (err) {
      console.error(`Error updating status (${action}):`, err.response || err);
      handleError(err);
    }
  };

  return (
    <div className="container mt-5">
      <h2>Admin Dashboard - Redemptions</h2>
      {error && <p className="text-danger">{error}</p>}
      {isLoading && <p>Loading redemptions...</p>}
      <table className="table table-striped">
        <thead>
          <tr>
            <th>Gift Card</th>
            <th>User</th>
            <th>Email</th>
            <th>Amount</th>
            <th>Image</th>
            <th>Status</th>
            <th>Reason</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {redemptions.length === 0 && !error && !isLoading && (
            <tr>
              <td colSpan="8">No redemptions found</td>
            </tr>
          )}
          {redemptions.map((redemption) => (
            <tr key={redemption._id}>
              <td>{redemption.giftCardName || "N/A"}</td>
              <td>{redemption.userName || "N/A"}</td>
              <td>{redemption.userEmail || "N/A"}</td>
              <td>{redemption.amount || "0"}</td>
              <td>
                {redemption.image ? (
                  <a href={redemption.image} target="_blank" rel="noopener noreferrer">
                    View Image
                  </a>
                ) : (
                  "No Image"
                )}
              </td>
              <td>{redemption.status || "pending"}</td>
              <td>{redemption.reason || "-"}</td>
              <td>
                {redemption.status === "pending" && (
                  <div className="d-flex align-items-center">
                    <button
                      className="btn btn-success btn-sm me-2"
                      onClick={() => handleStatusChange(redemption._id, "accept")}
                    >
                      Accept
                    </button>
                    <div className="input-group" style={{ maxWidth: "300px" }}>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        placeholder="Rejection reason"
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                      />
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleStatusChange(redemption._id, "reject", reason)}
                        disabled={!reason.trim()}
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminDashboard;