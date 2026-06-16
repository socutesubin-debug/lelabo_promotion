import { useState, useEffect, useRef } from "react";
import { playLoop, stopSound } from "./utils/soundManager";
import bgImage   from "./assets/lelabo_img/6/6-1.jpg";
import mainImage from "./assets/lelabo_img/6/6-main.png";
import subImage  from "./assets/lelabo_img/6/6-2.png";

const progSteps = [
  { time: "00:01", label: "BLENDING NOTES" },
  { time: "00:02", label: "STIRRING BASE"  },
  { time: "00:03", label: "SETTLING SCENT" },
];

const sourceNotes = [
  { num: "01", lines: ["베르가못은 지중해 기후에서 자란", "감귤류 과피에서 얻어집니다."] },
  { num: "02", lines: ["시더우드는 건조한 숲에서 자란", "나무의 심재와 결에서 출발합니다."] },
  { num: "03", lines: ["앰버 레진은 나무가 남긴 수지에서", "천천히 굳어진 원료로 시작됩니다."] },
  { num: "04", lines: ["카다멈은 따뜻한 지역에서 자란", "향신료 씨앗에서 채집됩니다."] },
  { num: "05", lines: ["로즈는 꽃잎이 가장 깊은 향을 품는", "순간에 선별됩니다."] },
  { num: "06", lines: ["머스크는 피부에 가까운 잔향을 위해", "섬세하게 조합된 베이스 원료입니다."] },
  { num: "07", lines: ["파로산토는 건조한 나무 조각에서", "스모키한 원료의 흔적을 얻습니다."] },
  { num: "08", lines: ["코튼은 부드러운 섬유의 감각에서", "깨끗한 질감의 원료로 해석됩니다."] },
];

function randomOther(current, length) {
  let next;
  do { next = Math.floor(Math.random() * length); } while (next === current && length > 1);
  return next;
}

function MixingProcessScreen({ onNext }) {
  const [progIdx, setProgIdx] = useState(0);
  const initialNote = () => Math.floor(Math.random() * sourceNotes.length);
  const [noteIdx, setNoteIdx] = useState(initialNote);
  const noteIdxRef = useRef(noteIdx);

  useEffect(() => {
    playLoop("stirring_liquid", 0.32);
    return () => stopSound("stirring_liquid");
  }, []);

  useEffect(() => {
    let count = 0;
    const interval = setInterval(() => {
      count += 1;
      if (count < progSteps.length) {
        setProgIdx(count);
      } else {
        clearInterval(interval);
        setTimeout(onNext, 2000);
      }
    }, 3200);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const noteInterval = setInterval(() => {
      const next = randomOther(noteIdxRef.current, sourceNotes.length);
      noteIdxRef.current = next;
      setNoteIdx(next);
    }, 3000);
    return () => clearInterval(noteInterval);
  }, []);

  return (
    <section
      className="mixing-process-screen"
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      <img src={mainImage} alt="" className="mixing-main-img" />
      <img src={subImage}  alt="" className="mixing-sub-img"  />

      <div className="mixing-overlay" />
      <div className="mixing-glow" />
      <div className="liquid-ripple liquid-ripple-1" />
      <div className="liquid-ripple liquid-ripple-2" />
      <div className="liquid-ripple liquid-ripple-3" />

      <p className="mixing-copy">당신이 고른 원료들이 <br/>하나의 향으로 이어집니다.</p>

      <div className="mixing-notes">
        <div key={noteIdx} className="mixing-note-item">
          <span className="mixing-note-num">{sourceNotes[noteIdx].num}</span>
          <p className="mixing-note-text">
            {sourceNotes[noteIdx].lines[0]}<br />
            {sourceNotes[noteIdx].lines[1]}
          </p>
        </div>
      </div>

      <div className="mixing-progress">
        <div key={progIdx} className="mixing-progress-item">
          <span className="mixing-progress-time">{progSteps[progIdx].time}</span>
        </div>
      </div>
    </section>
  );
}

export default MixingProcessScreen;
