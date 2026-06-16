import { useState, useEffect, useRef, useCallback } from "react";
import { playSound } from "./utils/soundManager";
import bgImage        from "./assets/lelabo_img/10/10-bg.jpg";
import leftHandImg    from "./assets/lelabo_img/10/left_hand.png";
import labelImg       from "./assets/lelabo_img/10/label.png";
import nolabelImg     from "./assets/lelabo_img/10/nolabel.png";
import stickerHand01  from "./assets/lelabo_img/10/sticker_hand01.png";
import stickerHand02  from "./assets/lelabo_img/10/sticker_hand02.png";
import perfumeImg     from "./assets/lelabo_img/10/purfume_fs.png";
import openBoxImg     from "./assets/lelabo_img/10/open_box.png";
import openBox02Img   from "./assets/lelabo_img/10/open_box02.png";
import box03Img       from "./assets/lelabo_img/10/box_03.png";

/*
  Phase 흐름:
  intro → waitLabel → labeling → perfumeReady → waitBox → packing → sealing → boxed
*/

function LabelingPackagingScreen({ onNext }) {
  const [phase, setPhase] = useState("intro");

  // 드래그 상태
  const [draggingLabel, setDraggingLabel] = useState(false);
  const [labelPos, setLabelPos] = useState(null); // {x, y} 드래그 중 override
  const [draggingPerfume, setDraggingPerfume] = useState(false);
  const [perfumePos, setPerfumePos] = useState(null);

  const labelRef    = useRef(null);
  const bottleRef   = useRef(null);
  const perfumeRef  = useRef(null);
  const openBoxRef  = useRef(null);
  const dragOrigin  = useRef(null); // 드래그 시작 시 마우스-오브젝트 오프셋
  const glass1PlayedRef = useRef(false);
  const boxClosePlayedRef = useRef(false);
  const paperSlidePlayedRef = useRef(false);
  const sealPaperSlidePlayedRef = useRef(false);

  // 왼손(라벨) 등장 시 paper_slide 1회 재생
  useEffect(() => {
    if (paperSlidePlayedRef.current) return;
    paperSlidePlayedRef.current = true;
    playSound("paper_slide", 0.4);
  }, []);

  // open_box02 봉인 단계에서 라벨이 다시 등장할 때 paper_slide 1회 재생
  useEffect(() => {
    if (phase !== "sealing" || sealPaperSlidePlayedRef.current) return;
    sealPaperSlidePlayedRef.current = true;
    playSound("paper_slide", 0.4);
  }, [phase]);

  // ── 1. intro: 왼손 + 라벨 등장 (800ms), 손 퇴장 후 waitLabel
  useEffect(() => {
    if (phase !== "intro") return;
    const t = setTimeout(() => setPhase("waitLabel"), 3400);
    return () => clearTimeout(t);
  }, [phase]);

  // 향수병(nolabel)이 처음 등장하는 순간 glass1 1회 재생
  useEffect(() => {
    const bottleVisible = phase === "waitLabel" || phase === "labeling";
    if (!bottleVisible || glass1PlayedRef.current) return;
    glass1PlayedRef.current = true;
    playSound("glass1", 0.4);
  }, [phase]);

  // 상자를 닫는(boxed) 순간 box_close 1회 재생
  useEffect(() => {
    if (phase !== "boxed" || boxClosePlayedRef.current) return;
    boxClosePlayedRef.current = true;
    playSound("box_close", 0.4);
  }, [phase]);

  // ── 라벨링 시퀀스
  useEffect(() => {
    if (phase !== "labeling") return;
    // sticker_hand01 → hand02 → perfumeReady
    const t = setTimeout(() => setPhase("perfumeReady"), 3200);
    return () => clearTimeout(t);
  }, [phase]);

  // sticker_hand01/02가 등장해 라벨을 문지르는 동안 rubbing 재생
  // 원본 음원이 22초로 길어서, 손 애니메이션이 끝나는 시점(약 3.1s)에 맞춰 짧게 끊어 재생
  useEffect(() => {
    if (phase !== "labeling") return;
    const el = playSound("rubbing", 0.35, { maxDurationMs: 2900 });
    return () => { if (el) { el.pause(); el.currentTime = 0; } };
  }, [phase]);

  // ── perfumeReady → waitBox (병이 우측 상단으로 슬라이드 이동)
  useEffect(() => {
    if (phase !== "perfumeReady") return;
    const t = setTimeout(() => setPhase("waitBox"), 1800);
    return () => clearTimeout(t);
  }, [phase]);

  // ── packing: 향수가 상자 위에서 회전하며 떨어지는 애니메이션 → sealing
  useEffect(() => {
    if (phase !== "packing") return;
    const t = setTimeout(() => setPhase("sealing"), 900);
    return () => clearTimeout(t);
  }, [phase]);

  // ── 드래그: 라벨 (병 라벨링 / 상자 봉인 공용) ──────────────
  const onLabelMouseDown = useCallback((e) => {
    if (phase !== "waitLabel" && phase !== "sealing") return;
    e.preventDefault();
    const rect = labelRef.current.getBoundingClientRect();
    dragOrigin.current = { ox: e.clientX - rect.left, oy: e.clientY - rect.top };
    setDraggingLabel(true);
    setLabelPos({ x: rect.left, y: rect.top });
  }, [phase]);

  const onMouseMove = useCallback((e) => {
    if (draggingLabel) {
      setLabelPos({
        x: e.clientX - dragOrigin.current.ox,
        y: e.clientY - dragOrigin.current.oy,
      });
    }
    if (draggingPerfume) {
      setPerfumePos({
        x: e.clientX - dragOrigin.current.ox,
        y: e.clientY - dragOrigin.current.oy,
      });
    }
  }, [draggingLabel, draggingPerfume]);

  const onMouseUp = useCallback((e) => {
    if (draggingLabel) {
      setDraggingLabel(false);
      const isSealStep = phase === "sealing";
      const targetRef = isSealStep ? openBoxRef : bottleRef;
      if (targetRef.current) {
        const tr = targetRef.current.getBoundingClientRect();
        const tCX = tr.left + tr.width / 2;
        const tCY = tr.top + tr.height / 2;
        const lCX = e.clientX - dragOrigin.current.ox + (labelRef.current?.offsetWidth ?? 0) / 2;
        const lCY = e.clientY - dragOrigin.current.oy + (labelRef.current?.offsetHeight ?? 0) / 2;
        const dist = Math.hypot(lCX - tCX, lCY - tCY);
        if (dist < (isSealStep ? 260 : 200)) {
          setLabelPos(null);
          setPhase(isSealStep ? "boxed" : "labeling");
          return;
        }
      }
      // 실패 → 원위치
      setLabelPos(null);
    }
    if (draggingPerfume) {
      setDraggingPerfume(false);
      if (openBoxRef.current) {
        const br = openBoxRef.current.getBoundingClientRect();
        const bCX = br.left + br.width / 2;
        const bCY = br.top + br.height / 2;
        const pCX = e.clientX - dragOrigin.current.ox + (perfumeRef.current?.offsetWidth ?? 0) / 2;
        const pCY = e.clientY - dragOrigin.current.oy + (perfumeRef.current?.offsetHeight ?? 0) / 2;
        const dist = Math.hypot(pCX - bCX, pCY - bCY);
        if (dist < 220) {
          setPerfumePos(null);
          setPhase("packing");
          return;
        }
      }
      setPerfumePos(null);
    }
  }, [draggingLabel, draggingPerfume, phase]);

  // 클릭 fallback
  const onLabelClick = useCallback(() => {
    if (draggingLabel) return;
    if (phase === "waitLabel") setPhase("labeling");
    else if (phase === "sealing") setPhase("boxed");
  }, [phase, draggingLabel]);

  const onPerfumeClick = useCallback(() => {
    if (phase === "waitBox" && !draggingPerfume) setPhase("packing");
  }, [phase, draggingPerfume]);

  // ── 드래그: 향수 ──────────────────────────────────────
  const onPerfumeMouseDown = useCallback((e) => {
    if (phase !== "waitBox") return;
    e.preventDefault();
    const rect = perfumeRef.current.getBoundingClientRect();
    dragOrigin.current = { ox: e.clientX - rect.left, oy: e.clientY - rect.top };
    setDraggingPerfume(true);
    setPerfumePos({ x: rect.left, y: rect.top });
  }, [phase]);

  // 안내 문구
  const guideText = {
    waitLabel: "라벨을 향수병 위로 옮겨주세요.",
    waitBox:   "완성된 향수를 상자 안에 담아주세요.",
    sealing:   "라벨을 이용해 상자를 포장해주세요.",
    boxed:     "당신의 향이 담겼습니다.",
  }[phase] ?? null;

  const isIntro        = phase === "intro";
  const isWaitLabel    = phase === "waitLabel";
  const isLabeling     = phase === "labeling";
  const isPerfumeReady = phase === "perfumeReady";
  const isWaitBox      = phase === "waitBox";
  const isPacking      = phase === "packing";
  const isSealing      = phase === "sealing";
  const isBoxed        = phase === "boxed";

  const showLeftHand   = isIntro;
  const showLabel      = isIntro || isWaitLabel || isSealing;
  const showNolabel    = isWaitLabel || isLabeling;
  const showHand01     = isLabeling;
  const showHand02     = isLabeling;
  const showPerfume    = isLabeling || isPerfumeReady || isWaitBox || isPacking;
  const showOpenBox    = isWaitBox || isPacking;
  const showOpenBox02  = isSealing;
  const showBox03      = isBoxed;

  // 드래그 중인 오브젝트 스타일
  const labelDragStyle = labelPos
    ? { position: "fixed", left: labelPos.x, top: labelPos.y, zIndex: 500, cursor: "grabbing", transition: "none" }
    : undefined;
  const perfumeDragStyle = perfumePos
    ? { position: "fixed", left: perfumePos.x, top: perfumePos.y, zIndex: 500, cursor: "grabbing", transition: "none" }
    : undefined;

  return (
    <section
      className="labeling-packaging-screen"
      style={{ backgroundImage: `url(${bgImage})` }}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
    >
      <div className="labeling-bg-overlay" />

      {/* 왼손 */}
      {showLeftHand && (
        <img src={leftHandImg} alt="" className={`ritual-object left-hand left-hand--in`} />
      )}

      {/* 라벨 (병 라벨링 / 상자 봉인 공용) */}
      {showLabel && (
        <img
          ref={labelRef}
          src={labelImg}
          alt=""
          className={[
            "ritual-object loose-label",
            isIntro     ? "loose-label--with-hand" : "",
            isWaitLabel ? "loose-label--settled" : "",
            isWaitLabel ? "object-glow" : "",
            isSealing   ? "loose-label--resealed object-glow" : "",
            draggingLabel ? "loose-label--dragging" : "",
          ].join(" ")}
          style={labelDragStyle}
          onMouseDown={onLabelMouseDown}
          onClick={onLabelClick}
          draggable={false}
        />
      )}

      {/* nolabel 향수병 */}
      {showNolabel && (
        <img
          ref={bottleRef}
          src={nolabelImg}
          alt=""
          className={[
            "ritual-object nolabel-bottle",
            (isWaitLabel || isLabeling) ? "nolabel-bottle--in" : "",
            isWaitLabel ? "drop-zone" : "",
          ].join(" ")}
        />
      )}

      {/* sticker_hand01 */}
      {showHand01 && (
        <img
          src={stickerHand01}
          alt=""
          className={`ritual-object sticker-hand-01 sticker-hand-01--in`}
        />
      )}

      {/* sticker_hand02 */}
      {showHand02 && (
        <img
          src={stickerHand02}
          alt=""
          className={`ritual-object sticker-hand-02 sticker-hand-02--in`}
        />
      )}

      {/* 완성 향수 purfume_fs */}
      {showPerfume && (
        <img
          ref={perfumeRef}
          src={perfumeImg}
          alt=""
          className={[
            "ritual-object finished-perfume",
            isLabeling     ? "finished-perfume--at-bottle" : "",
            isPerfumeReady ? "finished-perfume--at-bottle object-glow" : "",
            isWaitBox      ? "finished-perfume--corner object-glow" : "",
            isPacking      ? "finished-perfume--packing" : "",
          ].join(" ")}
          style={perfumeDragStyle}
          onMouseDown={onPerfumeMouseDown}
          onClick={onPerfumeClick}
          draggable={false}
        />
      )}

      {/* open_box (비어있음 / 향수 낙하 중) */}
      {showOpenBox && (
        <img
          ref={openBoxRef}
          src={openBoxImg}
          alt=""
          className={[
            "ritual-object open-box open-box--in",
            isWaitBox ? "drop-zone open-box--invite" : "",
            isPacking ? "object-glow" : "",
          ].join(" ")}
        />
      )}

      {/* open_box02 (향수가 담긴 채로 열려있음, 라벨 봉인 대기) */}
      {showOpenBox02 && (
        <img
          ref={openBoxRef}
          src={openBox02Img}
          alt=""
          className={`ritual-object open-box-02 ${isSealing ? "open-box-02--in" : ""}`}
        />
      )}

      {/* box_03 — 최종 포장 완료 */}
      {showBox03 && (
        <div className="ritual-final-stage">
          <img
            src={box03Img}
            alt=""
            className={`ritual-object box-step-03 ${isBoxed ? "box-step-03--in" : ""}`}
          />
        </div>
      )}
      {showBox03 && (
        <button
          type="button"
          className={`sensory-start-btn ${isBoxed ? "sensory-start-btn--visible" : ""}`}
          onClick={onNext}
        >
          다음으로
        </button>
      )}

      {/* 안내 문구 (상단 중앙, SensoryGuideScreen 스타일) */}
      {guideText && (
        <div key={phase} className="sensory-ornament-copy sensory-ornament-copy--visible">
          <div className="ornament-line top">
            <span className="line-segment line-left" />
            <span className="ornament-center-dot" />
            <span className="line-segment line-right" />
          </div>
          <p className="ornament-text">{guideText}</p>
          <div className="ornament-line bottom">
            <span className="line-segment line-left" />
            <span className="ornament-center-dot" />
            <span className="line-segment line-right" />
          </div>
        </div>
      )}
    </section>
  );
}

export default LabelingPackagingScreen;
