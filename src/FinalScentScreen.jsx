import { useState, useEffect } from "react";
import { playSound, stopSound } from "./utils/soundManager";
import bgImage     from "./assets/lelabo_img/8/8-main.jpg";
import bottleImage from "./assets/lelabo_img/8/8-1.png";
import decoImage   from "./assets/lelabo_img/8/8-3.png";

const scentProfile = [
  { label: "FLORAL", fill: 78 },
  { label: "WOODY",  fill: 68 },
  { label: "MUSKY",  fill: 82 },
  { label: "AMBERY", fill: 58 },
];

function FinalScentScreen({ onNext }) {
  const [bottleVisible, setBottleVisible] = useState(false);
  const [panelVisible,  setPanelVisible]  = useState(false);
  const [copyVisible,   setCopyVisible]   = useState(false);
  const [buttonVisible, setButtonVisible] = useState(false);

  useEffect(() => {
    // shining 원본 음원이 42초 가량으로 길어서, 다음 화면까지 새어 들어가지 않도록 짧게 끊어 재생
    const t1 = setTimeout(() => { setBottleVisible(true); playSound("shining", 0.35, { maxDurationMs: 2200 }); }, 400);
    const t2 = setTimeout(() => setPanelVisible(true),   700);
    const t3 = setTimeout(() => setCopyVisible(true),   1100);
    const t4 = setTimeout(() => setButtonVisible(true), 2400);
    return () => {
      [t1, t2, t3, t4].forEach(clearTimeout);
      stopSound("shining");
    };
  }, []);

  return (
    <section
      className="final-scent-screen"
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      <div className="final-scent-vignette" />

      {/* 상단 문구 — 2페이지 ornament 구조 동일 */}
      <div className={`sensory-ornament-copy ${copyVisible ? "sensory-ornament-copy--visible" : ""}`}>
        <div className="ornament-line top">
          <span className="line-segment line-left" />
          <span className="ornament-center-dot" />
          <span className="line-segment line-right" />
        </div>
        <p className="ornament-text">
          당신이 고른 원료들이<br />
          하나의 향으로 정돈되었습니다.
        </p>
        <div className="ornament-line bottom">
          <span className="line-segment line-left" />
          <span className="ornament-center-dot" />
          <span className="line-segment line-right" />
        </div>
      </div>

      {/* 배경 데코 이미지 — 패널과 독립 배치 */}
      <img src={decoImage} alt="" className={`final-deco-img ${panelVisible ? "final-deco-img--visible" : ""}`} />

      {/* 좌측 정보 패널 */}
      <div className={`final-info-panel ${panelVisible ? "final-info-panel--visible" : ""}`}>
        <span className="final-kicker">YOUR SCENT</span>
        <h2 className="final-scent-name">ANOTHER 13</h2>
        <p className="final-description">
          우디한 머스크와 플로럴의 대비가 어우러진,<br />
          중독성 있는 시그니처 향.
        </p>
        <p className="final-quote">
          "A fragrance that adapts to you,<br />
          and becomes uniquely yours."
        </p>
        <div className="final-divider" />
        <div className="scent-profile">
          {scentProfile.map((item, i) => (
            <div key={i} className="scent-profile-row">
              <span className="scent-profile-label">{item.label}</span>
              <div className="scent-bar">
                <div
                  className="scent-bar-fill"
                  style={{
                    "--fill": `${item.fill}%`,
                    animationDelay: `${1.6 + i * 0.15}s`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 우측 향수병 */}
      <div className={`final-bottle-wrap ${bottleVisible ? "final-bottle-wrap--visible" : ""}`}>
        <div className="final-bottle-floater">
          <img src={bottleImage} alt="향수병" className="final-bottle-img" />
        </div>
      </div>

      {/* 버튼 */}
      <button
        className={`final-scent-btn ${buttonVisible ? "final-scent-btn--visible" : ""}`}
        onClick={onNext}
      >
        라벨 만들기
      </button>
    </section>
  );
}

export default FinalScentScreen;
