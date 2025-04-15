import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";

export default function GiftCardDetails() {
  const { id } = useParams();
  const [giftCard, setGiftCard] = useState(null);
  const [amount, setAmount] = useState("");
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`https://ugobueze-app.onrender.com/api/giftcards/${id}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("userToken")}`,
      },
    })
      .then((res) => res.json())
      .then((data) => setGiftCard(data))
      .catch((error) => {
        setError("Failed to load gift card details");
      });
  }, [id]);

  // Add this missing function
  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError("Image file too large (max 5MB)");
      setImage(null);
      return;
    }
    
    setImage(file);
    setError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData();
    formData.append("amount", amount);
    formData.append("image", image);

    try {
      const token = localStorage.getItem("userToken");
      if (!token) {
        setError("Authentication required");
        return;
      }

      const response = await fetch(`https://ugobueze-app.onrender.com/api/giftcards/${id}/redeem`, {
        method: "POST",
        body: formData,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (response.ok) {
        alert("Redemption submitted!");
        setAmount("");
        setImage(null);
      } else {
        setError(data.error || "Redemption failed");
      }
    } catch (err) {
      setError("Network error. Try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!giftCard) return <div className="text-center mt-5">Loading...</div>;

  return (
    <div className="container mt-5">
      <div className="card p-4 shadow-lg mx-auto" style={{ maxWidth: "400px" }}>
        <h3 className="text-center my-5">{giftCard.name}</h3>
        <img
          src={giftCard.image}
          alt={giftCard.name}
          className="img-fluid rounded mx-auto d-block"
          style={{ maxWidth: "100%" }}
        />

        <form onSubmit={handleSubmit} className="mt-3">
          <div className="mb-3">
            <label className="form-label">Amount:</label>
            <input
              type="number"
              className="form-control"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min="0.01"
              step="0.01"
              required
              disabled={loading}
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Upload Image:</label>
            <input
              type="file"
              className="form-control"
              accept="image/*"
              onChange={handleImageUpload}
              required
              disabled={loading}
            />
            <small className="form-text text-muted">Max file size: 5MB</small>
          </div>

          {error && <p className="text-danger">{error}</p>}

          <button type="submit" className="btn btn-primary w-100" disabled={loading}>
            {loading ? "Submitting..." : "Submit Redemption"}
          </button>
        </form>
      </div>
    </div>
  );
}