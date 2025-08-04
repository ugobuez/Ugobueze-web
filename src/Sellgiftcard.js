import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function GiftCards() {
  const [giftCards, setGiftCards] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetch("https://ugobueze-app.onrender.com/api/giftcards", {
      headers: {
        "Authorization": `Bearer ${localStorage.getItem("userToken")}`, // use consistent token key
      }
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.data)) {
          setGiftCards(data.data);
        } else {
          console.error("Unexpected response format:", data);
        }
      })
      .catch((error) => console.error("Error fetching gift cards:", error));
  }, []);

  return (
    <div style={{ padding: "1rem", maxWidth: "600px", margin: "0 auto" }}>
      <h3 style={{ fontWeight: 600, marginBottom: "1rem" }}>Sell Gift Card</h3>

      <input
        type="text"
        placeholder="🔍 Search Giftcards"
        style={{
          width: "100%",
          padding: "0.75rem 1rem",
          borderRadius: "12px",
          border: "1px solid #ccc",
          marginBottom: "1.5rem",
        }}
      />

      <section>
        <h5 style={{ fontWeight: 600 }}>Recently Sold Gift Cards</h5>
        <div className="w-50" style={{ display: "flex", gap: "1rem", marginBottom: "2rem" }}>
          {Array.isArray(giftCards) && giftCards.slice(0, 1).map((card) => (
            <div
              key={card._id}
              style={{
                borderRadius: "16px",
                padding: "1rem",
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                cursor: "pointer",
                flex: "1",
                textAlign: "center"
              }}
              onClick={() => navigate(`/giftcard/${card._id}`)}
            >
              <img
                src={card.image}
                alt={card.name}
                style={{ width: "75%", borderRadius: "12px", marginBottom: "0.5rem" }}
              />
              <p style={{ fontWeight: 500 }}>{card.name}</p>
              <div
                style={{
                  backgroundColor: "#f3f4f6",
                  borderRadius: "8px",
                  padding: "0.25rem 0.5rem",
                  display: "inline-block",
                  marginTop: "0.25rem",
                }}
              >
                <small style={{ color: "#888" }}>UP TO</small>{" "}
                <strong>₦{card.value}</strong>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h5 style={{ fontWeight: 600 }}>All Gift Cards</h5>
          <div style={{ fontSize: "0.9rem", color: "#3b82f6" }}>
            <span style={{ marginRight: "1rem", cursor: "pointer" }}>Featured</span>
            <span style={{ cursor: "pointer" }}>High to Low</span>
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: "1rem",
            marginTop: "1rem"
          }}
        >
          {Array.isArray(giftCards) && giftCards.map((card) => (
            <div
              key={card._id}
              style={{
                borderRadius: "16px",
                padding: "1rem",
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                cursor: "pointer",
                textAlign: "center"
              }}
              onClick={() => navigate(`/giftcard/${card._id}`)}
            >
              <img
                src={card.image}
                alt={card.name}
                style={{
                  width: "75%",
                  borderRadius: "12px",
                  marginBottom: "0.5rem",
                  height: "100px",
                  objectFit: "cover"
                }}
              />
              <p style={{ fontWeight: 500 }}>{card.name}</p>
              <div
                style={{
                  backgroundColor: "#f3f4f6",
                  borderRadius: "8px",
                  padding: "0.25rem 0.5rem",
                  display: "inline-block",
                  marginTop: "0.25rem",
                }}
              >
                <small style={{ color: "#888" }}>UP TO</small>{" "}
                <strong>₦{card.value}</strong>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
