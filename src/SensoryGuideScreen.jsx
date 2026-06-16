import { useState, useEffect } from "react";
import bgImage from "./assets/lelabo_img/2/2-main.jpg";
import silhouetteImage from "./assets/lelabo_img/2/2-1.png";

function SensoryGuideScreen({ onNext }) {
  const [textVisible, setTextVisible] = useState(false);
  const [figureVisible, setFigureVisible] = useState(false);
  const [buttonVisible, setButtonVisible] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setTextVisible(true), 100);
    const t2 = setTimeout(() => setFigureVisible(true), 600);
    const t3 = setTimeout(() => setButtonVisible(true), 1300);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, []);

  return (
    <section
      className="sensory-screen"
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      <div className={`sensory-ornament-copy ${textVisible ? "sensory-ornament-copy--visible" : ""}`}>
        <div className="ornament-line top">
          <span className="line-segment line-left" />
          <span className="ornament-center-dot" />
          <span className="line-segment line-right" />
        </div>

        <p className="ornament-text">
          양옆에 놓인 원료를 천천히 바라보고,<br />
          향과 질감을 직접 느껴보세요.
        </p>

        <div className="ornament-line bottom">
          <span className="line-segment line-left" />
          <span className="ornament-center-dot" />
          <span className="line-segment line-right" />
        </div>
      </div>

      <img
        src={silhouetteImage}
        alt="인물 실루엣"
        className={`sensory-figure ${figureVisible ? "sensory-figure--visible" : ""}`}
      />

      <button
        className={`sensory-start-btn ${buttonVisible ? "sensory-start-btn--visible" : ""}`}
        onClick={onNext}
      >
        다음으로
      </button>
    </section>
  );
}

export default SensoryGuideScreen;
