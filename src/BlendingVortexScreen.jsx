import { useState, useEffect } from "react";
import { playSound } from "./utils/soundManager";
import bgImage    from "./assets/lelabo_img/5/5-main.jpg";
import beakerImage from "./assets/lelabo_img/5/5-1.png";
import mat01 from "./assets/lelabo_img/4/material01.png";
import mat02 from "./assets/lelabo_img/4/material02.png";
import mat03 from "./assets/lelabo_img/4/material03.png";
import mat04 from "./assets/lelabo_img/4/material04.png";
import mat05 from "./assets/lelabo_img/4/material05.png";
import mat06 from "./assets/lelabo_img/4/material06.png";
import mat07 from "./assets/lelabo_img/4/material07.png";
import mat08 from "./assets/lelabo_img/4/material08.png";

const materials = [mat01, mat02, mat03, mat04, mat05, mat06, mat07, mat08];

function BlendingVortexScreen({ onNext }) {
  const [beakerVisible, setBeakerVisible] = useState(false);
  const [trayVisible,   setTrayVisible]   = useState(false);
  const [bouncing,      setBouncing]      = useState(false);
  const [enterCount,    setEnterCount]    = useState(0);
  const [exiting,       setExiting]       = useState(false);

  useEffect(() => {
    // glass2 원본 음원이 8초 가량으로 길어서, 이후 겹치는 pop/waterdrop과 뒤섞이지 않도록 짧게 끊어 재생
    const t1 = setTimeout(() => { setBeakerVisible(true); playSound("glass2", 0.4, { maxDurationMs: 1200 }); }, 600);
    const t2 = setTimeout(() => setTrayVisible(true),   1000);
    const t3 = setTimeout(() => setBouncing(true),      1400);

    // 재료가 트레이에 하나씩 바운스 등장(--delay: i*0.22s)하는 타이밍에 맞춰 pop 재생
    // pop 원본 음원(~1s)이 등장 간격(220ms)보다 길어 여러 개가 쌓여 들리므로 짧게 끊어 재생
    const popTimers = materials.map((_, i) =>
      setTimeout(() => playSound("pop", 0.35, { maxDurationMs: 200 }), 1400 + i * 220)
    );

    // 재료가 비커 안으로 들어가는 순간마다 waterdrop 재생 (같은 이유로 짧게 끊어 재생)
    const enterTimers = materials.map((_, i) =>
      setTimeout(() => { setEnterCount(c => c + 1); playSound("waterdrop", 0.55, { maxDurationMs: 250 }); }, 4100 + i * 380)
    );

    // 마지막 재료 입장 완료 → 줌인 exit → 다음 화면
    const lastMatEnd = 4100 + (materials.length - 1) * 380 + 880;
    const tExit = setTimeout(() => setExiting(true),  lastMatEnd + 80);
    const tNext = setTimeout(onNext,                   lastMatEnd + 830);

    return () => {
      clearTimeout(t1); clearTimeout(t2); clearTimeout(t3);
      popTimers.forEach(clearTimeout);
      enterTimers.forEach(clearTimeout);
      clearTimeout(tExit); clearTimeout(tNext);
    };
  }, []);

  return (
    <section
      className={`blending-screen${exiting ? " blending-screen--exit" : ""}`}
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      <div className="blending-vignette" />

      <div className={[
        "blending-beaker-wrap",
        beakerVisible ? "blending-beaker-wrap--visible" : "",
        bouncing      ? "blending-beaker-wrap--active"  : "",
      ].join(" ").trim()}>
        <div className="beaker-shadow" />
        <div className="beaker-glow" />
        <img src={beakerImage} alt="" className="blending-beaker-img" />
      </div>

      <div className={`inventory-tray ${trayVisible ? "inventory-tray--visible" : ""}`}>
        {materials.map((_, i) => (
          <div key={i} className="inventory-slot" />
        ))}
      </div>

      {materials.map((src, i) => (
        <img
          key={i}
          src={src}
          alt=""
          className={[
            "mat-item",
            `mat-pos-0${i + 1}`,
            bouncing       ? "mat-item--bouncing"  : "",
            enterCount > i ? "mat-item--entering"  : "",
          ].join(" ").trim()}
          style={{ "--delay": `${i * 0.22}s` }}
        />
      ))}
    </section>
  );
}

export default BlendingVortexScreen;
