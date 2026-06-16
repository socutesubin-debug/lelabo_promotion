import { useState, useEffect } from "react";
import { playSound } from "./utils/soundManager";
import bgImage   from "./assets/lelabo_img/4/4-bg.jpg";
import mat01 from "./assets/lelabo_img/4/material01.png";
import mat02 from "./assets/lelabo_img/4/material02.png";
import mat03 from "./assets/lelabo_img/4/material03.png";
import mat04 from "./assets/lelabo_img/4/material04.png";
import mat05 from "./assets/lelabo_img/4/material05.png";
import mat06 from "./assets/lelabo_img/4/material06.png";
import mat07 from "./assets/lelabo_img/4/material07.png";
import mat08 from "./assets/lelabo_img/4/material08.png";

const materials = [
  { src: mat01, name: "LAVENDER" },
  { src: mat02, name: "CEDARWOOD" },
  { src: mat03, name: "AMBER RESIN" },
  { src: mat04, name: "CARDAMOM" },
  { src: mat05, name: "CITRUS" },
  { src: mat06, name: "COTTON MUSK" },
  { src: mat07, name: "PALO SANTO" },
  { src: mat08, name: "ROSE" },
];

function SelectedMaterialsScreen({ onNext }) {
  const [headerVisible, setHeaderVisible] = useState(false);
  const [gridVisible,   setGridVisible]   = useState(false);
  const [buttonVisible, setButtonVisible] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setHeaderVisible(true), 400);
    const t2 = setTimeout(() => setGridVisible(true),   900);
    const t3 = setTimeout(() => setButtonVisible(true), 1600);
    // 그리드의 nth-child 등장 애니메이션 딜레이(0.25s 간격)에 맞춰 재료별로 pop 재생
    // pop 원본 음원(~1s)이 등장 간격(250ms)보다 길어 여러 개가 쌓여 들리므로 짧게 끊어 재생
    const popTimers = materials.map((_, i) =>
      setTimeout(() => playSound("pop", 0.35, { maxDurationMs: 200 }), 900 + i * 250)
    );
    return () => {
      clearTimeout(t1); clearTimeout(t2); clearTimeout(t3);
      popTimers.forEach(clearTimeout);
    };
  }, []);

  return (
    <section
      className="selected-material-screen"
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      <div className={`selected-material-header ${headerVisible ? "selected-material-header--visible" : ""}`}>
        <div className="selected-material-deco-line" />
        <h2 className="selected-material-title">당신이 고른 향료들</h2>
        <div className="selected-material-deco-line" />
      </div>

      <div className={`selected-material-grid ${gridVisible ? "selected-material-grid--visible" : ""}`}>
        {materials.map((m, i) => (
          <div key={i} className="selected-material-item">
            <img src={m.src} alt={m.name} />
            <span className="selected-material-name">{m.name}</span>
          </div>
        ))}
      </div>

      <div className={`selected-material-btn-wrap ${buttonVisible ? "selected-material-btn-wrap--visible" : ""}`}>
        <button className="selected-material-btn" onClick={onNext}>
          조합하기
        </button>
      </div>
    </section>
  );
}

export default SelectedMaterialsScreen;
