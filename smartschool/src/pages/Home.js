import React, { useEffect } from "react";
import { SITE_NAME, PAGE_NAME, PAGE_NAMES } from "../components/Constants";
import cover from '../images/saac-best-wishes.jpg';
const Home = () => {
  useEffect(() => {
      document.title = SITE_NAME + ": " + PAGE_NAMES['home'];
  });
  return (
      <div className="section-horizontal-padding section-vertical-padding home-background-image" style={{backgroundImage:  `url(${cover})`}}>

      </div>
  );
};

export default Home;
