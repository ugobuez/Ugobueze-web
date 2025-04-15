import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import './index.css';
import "bootstrap/dist/css/bootstrap.min.css";

export default function GiftCardDetails() {
  const { id } = useParams();
  const [giftCard, setGiftCard] = useState(null);
  const [amount, setAmount] = useState("");
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Fetch gift card details by ID
  useEffect(() => {
    fetch(`https://ugobueze-app.onrender.com/api/giftcards/${id}`, {
      headers: {
        "Authorization": `Bearer ${localStorage.getItem("token")}`, // Ensure API is authenticated
      }
    })
      .then((res) => res.json())
      .then((data) => setGiftCard(data))
      .catch((error) => console.error("Error fetching gift card details:", error));
  }, [id]);

  // Handle image upload
  const handleImageUpload = (event) => {
    setImage(event.target.files[0]);
  };

  // Handle the form submission for redemption
  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!amount || !image) {
        alert("Please enter an amount and upload an image.");
        return;
    }

    const formData = new FormData();
    formData.append("amount", amount);
    formData.append("image", image);

    setLoading(true);
    setError("");

    try {
        const token = localStorage.getItem("token");  // Ensure the token is retrieved
        if (!token) {
            setError("You must be logged in to redeem a gift card.");
            return;
        }

        const response = await fetch(`https://ugobueze-app.onrender.com/api/giftcards/${id}/redeem`, {
            method: "POST",
            body: formData,
            headers: {
                "Authorization": `Bearer ${token}`  // Include token in headers
            }
        });

        const result = await response.json();
        if (response.ok) {
            alert("Redemption request submitted successfully!");
        } else {
            setError(result.error || "Something went wrong");
        }
    } catch (error) {
        setError("Error submitting redemption request");
    } finally {
        setLoading(false);
    }
  };

  // Show loading message if giftCard is not yet fetched
  if (!giftCard) return <p className="text-center mt-5">Loading...</p>;

  return (
    <div className="container mt-5">
      <div className="card p-4 shadow-lg mx-auto" style={{ maxWidth: "400px" }}>
        <h3 className="text-center my-5">{giftCard.name}</h3>
        <img src={giftCard.image} alt={giftCard.name} className="img-fluid rounded mx-auto d-block" style={{ maxWidth: "100%" }} />
        
        <form onSubmit={handleSubmit} className="mt-3">
          <div className="mb-3">
            <label className="form-label">Amount:</label>
            <input type="number" className="form-control" value={amount} onChange={(e) => setAmount(e.target.value)}  />
          </div>

          <div className="mb-3">
            <label className="form-label">Upload Image:</label>
            <input type="file" className="form-control" accept="image/*" onChange={handleImageUpload} required />
          </div>

          {error && <p className="text-danger">{error}</p>}

          <button type="submit" className="btn btn-primary w-100" disabled={loading}>
            {loading ? "Submitting..." : "Submit Redemption"}
          </button>
        </form>
      </div>
    </div>
  );
} import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function GiftCards() {
  const [giftCards, setGiftCards] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetch("https://ugobueze-app.onrender.com/api/giftcards", {
      headers: {
        "Authorization": `Bearer ${localStorage.getItem("token")}`, // ✅ Ensure user is logged in
      }
    })
      .then((res) => res.json())
      .then((data) => setGiftCards(data))
      .catch((error) => console.error("Error fetching gift cards:", error));
  }, []);

  return (
    <div>
      <div style={{ display: "flex", flexWrap: "wrap" }}>
        {giftCards.map((card) => (
          <div
            key={card._id}
            style={{ margin: "8px", textAlign: "center", cursor: "pointer" }}
            onClick={() => navigate(`/giftcard/${card._id}`)}
          >
            <div className="d-flex my-2"> {/* ✅ Fixed `class` → `className` */}
              <img
                src={card.image}
                alt={card.name}
                style={{ width: "100px", height: "50px", objectFit: "cover" }}
              />
              <h6 className="mx-1">{card.name}</h6>
            </div>
            <div className="d-flex text-center w-100 justify-content-center upto rounded">
              <p className="text-muted">UP TO </p>
              <p className="px-2">₦{card.value}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";

export default function AdminDashboard() {
  const [redemptions, setRedemptions] = useState([]);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    if (!token) {
      setError("Unauthorized: No admin token found. Redirecting to login...");
      setTimeout(() => navigate("/admin/login"), 3000);
      return;
    }

    fetch("http://localhost:3500/api/admin/redemptions", {
      headers: { "Authorization": "Bearer " + token },
    })
      .then((res) => {
        if (res.status === 403) {
          throw new Error("Access denied. Invalid or expired token.");
        }
        return res.json();
      })
      .then((data) => {
        console.log("Redemptions response:", data);
        if (Array.isArray(data)) {
          setRedemptions(data);
        } else {
          setRedemptions([]);
        }
      })
      .catch((error) => {
        console.error("Error fetching redemptions:", error);
        setError(error.message);
      });
  }, [navigate]);

  const handleStatusChange = async (id, status) => {
    try {
      const response = await fetch(`http://localhost:3500/api/admin/redemptions/${id}`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": "Bearer " + localStorage.getItem("adminToken")
        },
        body: JSON.stringify({ status }),
      });

      if (response.ok) {
        const updatedRedemption = await response.json();
        setRedemptions((prev) =>
          prev.map((r) => (r._id === id ? { ...r, status: updatedRedemption.status } : r))
        );
      } else {
        throw new Error("Failed to update status");
      }
    } catch (error) {
      console.error("Error updating status:", error);
      setError("Failed to update redemption status.");
    }
  };

  return (
    <div className="container-fluid mt-4">
      <h2 className="text-center mb-4">Admin Dashboard - Gift Card Redemptions</h2>
      {error && <div className="alert alert-danger">{error}</div>}
      <div className="table-responsive">
        <table className="table table-bordered">
          <thead>
            <tr>
              <th>User</th>
              <th>Gift Card</th>
              <th>Amount</th>
              <th>Proof</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {Array.isArray(redemptions) && redemptions.length > 0 ? (
              redemptions.map((r, index) => (
                <tr key={r._id + "-" + index}>
                  <td>{r.userId}</td>
                  <td>{r.giftCardId}</td>
                  <td>${r.amount || "N/A"}</td>
                  <td>
                    {r.image ? (
                      <a href={r.image} target="_blank" rel="noopener noreferrer">
                        <img src={r.image} alt="Proof" width="50" />
                      </a>
                    ) : (
                      "No proof available"
                    )}
                  </td>
                  <td>{r.status}</td>
                  <td>
                    <button className="btn btn-success me-2" onClick={() => handleStatusChange(r._id, "approved")}>
                      Approve
                    </button>
                    <button className="btn btn-danger" onClick={() => handleStatusChange(r._id, "rejected")}>
                      Reject
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="text-center">No redemptions found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}