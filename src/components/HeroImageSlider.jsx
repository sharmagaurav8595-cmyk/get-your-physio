import { useCallback, useEffect, useId, useRef, useState } from "react";
import { hyroxPhotos } from "../data/hyrox.js";
import "../styles/hero-image-slider.css";

const photos = [...hyroxPhotos].sort((first, second) => (first.heroOrder ?? 2) - (second.heroOrder ?? 2));

const photoAt = (index) => photos[(index + photos.length) % photos.length];

export default function HeroImageSlider() {
  const [frame, setFrame] = useState({ index: 0, previousIndex: null, direction: 1, sequence: 0 });
  const [paused, setPaused] = useState(false);
  const [keyboardFocused, setKeyboardFocused] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const [photoRatios, setPhotoRatios] = useState(() => Object.fromEntries(
    hyroxPhotos.filter((photo) => photo.width > 0 && photo.height > 0)
      .map((photo) => [photo.src, photo.width / photo.height]),
  ));
  const [reducedMotion, setReducedMotion] = useState(() => window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  const gesture = useRef(null);
  const instructionsId = useId();
  const recordPhotoRatio = useCallback((src, image) => {
    if (!image.naturalWidth || !image.naturalHeight) return;
    const ratio = image.naturalWidth / image.naturalHeight;
    setPhotoRatios((current) => current[src] === ratio ? current : { ...current, [src]: ratio });
  }, []);
  const move = useCallback((direction) => {
    if (photos.length < 2) return;
    setFrame((current) => ({
      index: (current.index + direction + photos.length) % photos.length,
      previousIndex: current.index,
      direction,
      sequence: current.sequence + 1,
    }));
  }, []);

  const cancelGesture = (event) => {
    if (gesture.current?.pointerId !== event.pointerId) return;
    gesture.current = null;
    setDragging(false);
    setDragOffset(0);
  };

  const finishGesture = (event) => {
    const start = gesture.current;
    if (!start || start.pointerId !== event.pointerId) return;
    const distanceX = event.clientX - start.x;
    const distanceY = event.clientY - start.y;
    const threshold = Math.max(30, Math.min(50, event.currentTarget.clientWidth * .12));
    cancelGesture(event);
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    if (Math.abs(distanceX) >= threshold && Math.abs(distanceX) > Math.abs(distanceY)) {
      move(distanceX < 0 ? 1 : -1);
    }
  };

  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(preference.matches);
    preference.addEventListener("change", update);
    return () => preference.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (photos.length < 2 || paused || dragging || keyboardFocused || reducedMotion) return;
    const timer = window.setInterval(() => {
      if (!document.hidden) move(1);
    }, 3000);
    return () => window.clearInterval(timer);
  }, [paused, dragging, keyboardFocused, reducedMotion, frame.index, move]);

  useEffect(() => {
    if (!photos.length) return;
    // Load the next incoming photo before the next three-second slide.
    [frame.index + 3, frame.index - 1].forEach((index) => {
      const preload = new Image();
      const src = photoAt(index).src;
      preload.onload = () => recordPhotoRatio(src, preload);
      preload.src = src;
    });
  }, [frame.index, recordPhotoRatio]);

  if (!photos.length) return null;
  const centerRatio = photoRatios[photoAt(frame.index + 1).src] || 2 / 3;

  return (
    <div
      className={`hero-image-slider hero-image-slider--${centerRatio > 1 ? "landscape" : "portrait"}${dragging ? " hero-image-slider--dragging" : ""}`}
      style={{ "--center-aspect-ratio": centerRatio, "--drag-offset": `${dragOffset}px` }}
      role="region"
      aria-roledescription="carousel"
      aria-label="HYROX sports event photos"
      aria-describedby={instructionsId}
      tabIndex={0}
      onFocus={(event) => setKeyboardFocused(event.currentTarget.matches(":focus-visible"))}
      onBlur={() => setKeyboardFocused(false)}
      onKeyDown={(event) => {
        if (event.target !== event.currentTarget) return;
        if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
          event.preventDefault();
          setKeyboardFocused(true);
          move(event.key === "ArrowRight" ? 1 : -1);
        } else if (event.key === " ") {
          event.preventDefault();
          if (!event.repeat) {
            setKeyboardFocused(false);
            setPaused((value) => !value);
          }
        }
      }}
      onPointerDown={(event) => {
        if (!event.isPrimary || event.button !== 0) return;
        if (event.pointerType === "mouse") event.preventDefault();
        gesture.current = { pointerId: event.pointerId, x: event.clientX, y: event.clientY };
        event.currentTarget.setPointerCapture(event.pointerId);
        setKeyboardFocused(false);
        setDragging(true);
      }}
      onPointerMove={(event) => {
        const start = gesture.current;
        if (!start || start.pointerId !== event.pointerId) return;
        const distanceX = event.clientX - start.x;
        const distanceY = event.clientY - start.y;
        setDragOffset(Math.abs(distanceX) > Math.abs(distanceY) ? Math.max(-40, Math.min(40, distanceX * .2)) : 0);
      }}
      onPointerUp={finishGesture}
      onPointerCancel={cancelGesture}
      onLostPointerCapture={cancelGesture}
    >
      <span id={instructionsId} className="gy-sr-only">
        Drag with your mouse or swipe left or right to browse photos. Use arrow keys to browse, and press Space to pause or resume automatic sliding.
      </span>
      <div className="hero-image-slider__panels">
        {[0, 1, 2].map((offset) => {
          const currentPhoto = photoAt(frame.index + offset);
          return (
            <div
              className={`hero-image-slider__panel hero-image-slider__panel--${offset + 1}`}
              key={offset}
              role="group"
              aria-roledescription="slide"
              aria-label={`Photo ${(frame.index + offset) % photos.length + 1} of ${photos.length}`}
            >
              <div
                key={frame.sequence}
                className={`hero-image-slider__frame${frame.previousIndex !== null ? " hero-image-slider__frame--moving" : ""}`}
                style={{ "--slide-direction": frame.direction }}
              >
                {frame.previousIndex !== null && (
                  <img
                    className="hero-image-slider__photo hero-image-slider__photo--previous"
                    src={photoAt(frame.previousIndex + offset).src}
                    alt=""
                    aria-hidden="true"
                    draggable={false}
                  />
                )}
                <img
                  className="hero-image-slider__photo hero-image-slider__photo--current"
                  src={currentPhoto.src}
                  alt={currentPhoto.alt}
                  fetchPriority={offset === 1 ? "high" : "auto"}
                  decoding="async"
                  onLoad={(event) => recordPhotoRatio(currentPhoto.src, event.currentTarget)}
                  draggable={false}
                />
              </div>
              {offset === 1 && currentPhoto.person && (
                <div className="hero-image-slider__identity" key={`identity-${frame.sequence}`}>
                  <strong className="hero-image-slider__identity-name">{currentPhoto.person.name}</strong>
                  <span className="hero-image-slider__identity-role">{currentPhoto.person.role}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
      <span className="gy-sr-only" aria-live={paused || keyboardFocused || reducedMotion ? "polite" : "off"} aria-atomic="true">
        Photo {(frame.index + 1) % photos.length + 1} of {photos.length}
      </span>
    </div>
  );
}
