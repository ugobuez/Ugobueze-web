import React, { useEffect } from "react";
import Cash from "./assesst/images/cash.webp";
import Sell from "./assesst/images/image.png";
import "./App.css";
import { Link } from "react-router-dom";
import Coursel from "./Coursel";
import AOS from "aos";
import "aos/dist/aos.css";
import Referrals from "./Referrals";

AOS.init({
  disable: false,
  startEvent: "DOMContentLoaded",
  initClassName: "aos-init",
  animatedClassName: "aos-animate",
  useClassNames: false,
  disableMutationObserver: false,
  debounceDelay: 50,
  throttleDelay: 99,
  offset: 120,
  delay: 0,
  duration: 400,
  easing: "ease",
  once: false,
  mirror: false,
  anchorPlacement: "top-bottom",
});

const Home = () => {
  useEffect(() => {
    // Create JivoSite script element
    const script = document.createElement("script");
    script.src = "https://code.jivosite.com/widget/GB7NtfJel2";
    script.async = true;
    script.onload = () => console.log("JivoSite script loaded successfully");
    script.onerror = () => console.error("Failed to load JivoSite script");

    // Append the script to the document body
    document.body.appendChild(script);

    // Cleanup: Remove the script when the component unmounts
    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  return (
    <div className="container">
      <div data-aos="fade-right" data-aos-duration="1000">
        <div className="row align-items-center my-5">
          {/* Left Section - Sell Image */}
          <div className="col-md-6 text-center">
            <img src={Sell} className="w-100 my-5" alt="sell" />
            <div className="move">
              <Link to="/Hot" className="text-decoration-none">
                <button className="btn my-1 pt-2 btn-gin px-4">Sell now</button>
              </Link>
              {/* WhatsApp Button */}
              <a
                href="https://wa.me/message/2ZIMJZQRKTV6G1"
                target="_blank"
                rel="noopener noreferrer"
                className="text-decoration-none"
              >
                <button className="btn my-1 pt-2 btn-success px-4 ms-2">
                  Chat on WhatsApp
                </button>
              </a>
            </div>
          </div>

          {/* Right Section - Cash Image */}
          <div className="col-md-6 text-center">
            <div data-aos="fade-left">
              <img src={Cash} className="w-100 my-5" alt="cash" />
            </div>
          </div>
        </div>
      </div>
      <Referrals />
      {/* Gift Card Carousel Component */}
      <Coursel />
    </div>
  );
};

export default Home;