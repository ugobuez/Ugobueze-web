import { useEffect, useState } from "react";
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
