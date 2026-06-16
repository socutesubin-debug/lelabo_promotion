import { useState, useEffect } from "react";
import bgImage from "./assets/lelabo_img/3/3-1.jpg";

function MaterialPlaceScreen({ onNext }) {
  const [copyVisible, setCopyVisible] = useState(false);
  const [arrowVisible, setArrowVisible] = useState(false);
  const [buttonVisible, setButtonVisible] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setCopyVisible(true), 400);
    const t2 = setTimeout(() => setArrowVisible(true), 1000);
    const t3 = setTimeout(() => setButtonVisible(true), 1400);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, []);

  return (
    <section
      className="material-place-screen"
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      <div className={`material-place-copy ${copyVisible ? "material-place-copy--visible" : ""}`}>
        <p>
          마음에 남은 향료를<br />
          아래 트레이에 올려주세요.
        </p>
      </div>

      <div className={`material-arrow-wrap ${arrowVisible ? "material-arrow-wrap--visible" : ""}`}>
        <div className="material-arrow" />
      </div>

      <button
        className={`material-next-btn ${buttonVisible ? "material-next-btn--visible" : ""}`}
        onClick={onNext}
      >
        다음으로
      </button>
    </section>
  );
}

export default MaterialPlaceScreen;
