import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "./index.css";
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
    fetch(`http://localhost:3500/api/giftcards/${id}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    })
      .then((res) => res.json())
      .then((data) => setGiftCard(data))
      .catch((error) => {
        console.error("Error fetching gift card details:", error);
        setError("Failed to load gift card details. Please try again.");
      });
  }, [id]);

  // Handle image upload
  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file && file.size > 5 * 1024 * 1024) {
      setError("Image file too large. Please upload an image smaller than 5MB.");
      setImage(null);
      return;
    }
    setImage(file);
  };

  // Handle the form submission for redemption
  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!amount || amount <= 0) {
      setError("Please enter a valid amount greater than zero.");
      return;
    }

    if (!image) {
      setError("Please upload an image.");
      return;
    }

    const formData = new FormData();
    formData.append("amount", amount.toString());
    formData.append("image", image);

    console.log("Submitting form data:", { amount, image: image.name });

    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("You must be logged in to redeem a gift card.");
        return;
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);

      const response = await fetch(`http://localhost:3500/api/giftcards/${id}/redeem`, {
        method: "POST",
        body: formData,
        headers: {
          Authorization: `Bearer ${token}`,
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const result = await response.json();
      console.log("Backend response:", result); // Log response for debugging

      if (response.ok) {
        alert("Redemption request submitted successfully!");
        setAmount("");
        setImage(null);
        document.querySelector('input[type="file"]').value = "";
      } else {
        setError(
          response.status === 400 && result.error.includes("Validation failed")
            ? "Invalid redemption data. Please check your input."
            : result.error || "Something went wrong"
        );
      }
    } catch (error) {
      console.error("Submission error:", error);
      if (error.name === "AbortError") {
        setError("Request timed out. Please try a smaller image.");
      } else {
        setError(`Error submitting redemption request: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  // Show loading message if giftCard is not yet fetched
  if (!giftCard) return <p className="text-center mt-5">{error || "Loading..."}</p>;

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