import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";

const GiftCardDetails = () => {
  const { id } = useParams();
  const [giftCard, setGiftCard] = useState(null);
  const [amount, setAmount] = useState("");
  const [image, setImage] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleImageUpload = (e) => {
    setImage(e.target.files[0]);
  };

  useEffect(() => {
    const fetchGiftCard = async () => {
      try {
        const response = await fetch(`http://localhost:4500/api/giftcards/${id}`);
        if (!response.ok) throw new Error("Gift card not found");
        const data = await response.json();
        setGiftCard(data);
      } catch (err) {
        console.error(err);
        setError("Failed to fetch gift card.");
      }
    };

    fetchGiftCard();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!amount || !image) {
      setError("Please provide amount and image.");
      return;
    }

    const token = localStorage.getItem("token") || localStorage.getItem("userToken");
    console.log("TOKEN FOUND:", token); // DEBUG

    if (!token) {
      setError("Authentication token missing. Please log in again.");
      return;
    }

    const formData = new FormData();
    formData.append("amount", amount.toString());
    formData.append("image", image);

    setLoading(true);
    try {
      const response = await fetch(`http://localhost:4500/api/giftcards/${id}/redeem`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        console.error("❌ Backend error response:", result);
        throw new Error(result.error || result.message || "Failed to submit redemption.");
      }

      setMessage(result.message || "Gift card submitted for review.");
      setError("");
      setAmount("");
      setImage(null);
    } catch (err) {
      console.error("Submit error:", err);
      setError(err.message || "An error occurred during submission.");
      setMessage("");
    } finally {
      setLoading(false);
    }
  };

  if (error && !giftCard) return <div className="container mt-5 text-danger">{error}</div>;
  if (!giftCard) return <div className="container mt-5">Loading...</div>;

  return (
    <div className="container mt-5">
      <div className="card p-4 shadow-lg mx-auto" style={{ maxWidth: "400px" }}>
        <h3 className="text-center my-5">{giftCard.name}</h3>
        <img
          src={giftCard.image}
          alt={giftCard.name}
          className="img-fluid rounded mx-auto d-block"
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
          {message && <p className="text-success">{message}</p>}

          <button type="submit" className="btn btn-primary w-100" disabled={loading}>
            {loading ? "Submitting..." : "Submit Redemption"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default GiftCardDetails;
