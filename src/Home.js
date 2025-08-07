import React from "react";
import Cash from "./assesst/images/cash.webp"; // Fixed the typo
import Sell from "./assesst/images/image.png"; // Fixed the typo
import "./App.css";
import { Link } from "react-router-dom";
import Coursel from "./Coursel";
import AOS from 'aos';
import 'aos/dist/aos.css'; // You can also use <link> for styles
import Referrals from "./Referrals"; 
AOS.init();

// You can also pass an optional settings object
// below listed default settings
AOS.init({
  // Global settings:
  disable: false, // accepts following values: 'phone', 'tablet', 'mobile', boolean, expression or function
  startEvent: 'DOMContentLoaded', // name of the event dispatched on the document, that AOS should initialize on
  initClassName: 'aos-init', // class applied after initialization
  animatedClassName: 'aos-animate', // class applied on animation
  useClassNames: false, // if true, will add content of `data-aos` as classes on scroll
  disableMutationObserver: false, // disables automatic mutations' detections (advanced)
  debounceDelay: 50, // the delay on debounce used while resizing window (advanced)
  throttleDelay: 99, // the delay on throttle used while scrolling the page (advanced)
  

  // Settings that can be overridden on per-element basis, by `data-aos-*` attributes:
  offset: 120, // offset (in px) from the original trigger point
  delay: 0, // values from 0 to 3000, with step 50ms
  duration: 400, // values from 0 to 3000, with step 50ms
  easing: 'ease', // default easing for AOS animations
  once: false, // whether animation should happen only once - while scrolling down
  mirror: false, // whether elements should animate out while scrolling past them
  anchorPlacement: 'top-bottom', // defines which position of the element regarding to window should trigger the animation

});

const Home = () => {
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
<Referrals/>
      {/* Gift Card Carousel Component */}

      <Coursel />
    </div>
  );
};

export default Home;
