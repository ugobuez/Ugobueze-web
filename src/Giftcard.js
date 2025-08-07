

import React, { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { useNavigate } from "react-router-dom";

const BASE_URL = "https://ugobueze-app.onrender.com";

const GiftCard = () => {
  const [giftCards, setGiftCards] = useState([]);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchGiftCards = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setError("Authentication token missing. Please log in.");
          navigate("/login");
          return;
        }

        const res = await fetch(`${BASE_URL}/api/giftcards`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        });

        const contentType = res.headers.get("content-type");
        if (!res.ok || !contentType?.includes("application/json")) {
          const text = await res.text();
          throw new Error(`Unexpected response: ${text.slice(0, 100)}`);
        }

        const data = await res.json();
        const cards = Array.isArray(data) ? data : (data.success && Array.isArray(data.data) ? data.data : []);

        setGiftCards(cards);
        setError("");
      } catch (err) {
        console.error("GiftCard fetch error:", err.message);
        setError(`Could not load gift cards: ${err.message}`);
      }
    };

    fetchGiftCards();
  }, [navigate]);

  if (error) return <p className="text-danger">{error}</p>;

  return (
    <div className="row">
      {giftCards.map((card) => (
        <div className="col-6 mb-3" key={card._id} onClick={() => navigate(`/giftcard/${card._id}`)}>
          <div className="card shadow-sm" style={{ cursor: "pointer" }}>
            <img
              src={card.image}
              alt={card.name}
              className="card-img-top"
              style={{ height: "120px", objectFit: "cover" }}
            />
            <div className="card-body text-center">
              <h6 className="card-title">{card.name}</h6>
              <div className="d-flex justify-content-center align-items-center text-muted">
                <p className="mb-0">UP TO </p>
                <p className="mb-0 px-2">₦{card.value}</p>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default GiftCard;