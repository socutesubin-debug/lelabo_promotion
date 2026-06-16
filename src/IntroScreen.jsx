import { useState, useEffect } from "react";
import bgImage from "./assets/lelabo_img/1/1-main.jpg";
import perfumerImage from "./assets/lelabo_img/1/1-1.png";

function IntroScreen({ onNext }) {
  const [perfumerVisible, setPerfumerVisible] = useState(false);
  const [buttonVisible, setButtonVisible] = useState(false);

  useEffect(() => {
    const perfumerTimer = setTimeout(() => setPerfumerVisible(true), 100);
    const buttonTimer = setTimeout(() => setButtonVisible(true), 1100);
    return () => {
      clearTimeout(perfumerTimer);
      clearTimeout(buttonTimer);
    };
  }, []);

  return (
    <section
      className="intro-screen"
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      <div className="intro-perfumer-wrap">
        <img
          src={perfumerImage}
          alt="조향사"
          className={`intro-perfumer ${perfumerVisible ? "intro-perfumer--visible" : ""}`}
        />
      </div>

      <button
        className={`intro-start-btn ${buttonVisible ? "intro-start-btn--visible" : ""}`}
        onClick={onNext}
      >
        시작하기
      </button>
    </section>
  );
}

export default IntroScreen;
