import React from "react";
import { Carousel, Container } from "react-bootstrap";
import { FaAmazon, FaPlaystation, FaEbay, FaSpotify, FaSteam, FaGooglePlay, FaApple, FaXbox } from "react-icons/fa";

const giftCards = [
  { icon: <FaAmazon size={60} color="#ff9900" />, name: "Amazon Gift Card" },
  { icon: <FaPlaystation size={60} color="#0070d1" />, name: "PlayStation Gift Card" },
  { icon: <FaEbay size={60} color="#e53238" />, name: "eBay Gift Card" },
  { icon: <FaSpotify size={60} color="#1DB954" />, name: "Spotify Gift Card" },
  { icon: <FaSteam size={60} color="#171a21" />, name: "Steam Gift Card" },
  { icon: <FaGooglePlay size={60} color="#34a853" />, name: "Google Play Gift Card" },
  { icon: <FaApple size={60} color="black" />, name: "Apple Gift Card" },
  { icon: <FaXbox size={60} color="#107c10" />, name: "Xbox Gift Card" },
];

const GiftCardCarousel = () => {
  return (
    <Container className="mt-1">
      <Carousel indicators={false} controls={true}>
        {giftCards.map((card, index) => (
          <Carousel.Item key={index} className="text-center p-4">
            <div className="d-flex flex-column align-items-center">
              <div className="bg-light p-4 rounded-circle shadow-lg">{card.icon}</div>
              <h5 className="mt-3">{card.name}</h5>
            </div>
          </Carousel.Item>
        ))}
      </Carousel>
    </Container>
  );
};

export default GiftCardCarousel;
