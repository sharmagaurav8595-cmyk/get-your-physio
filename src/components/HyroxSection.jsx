import { useEffect, useRef, useState } from "react";
import { Box, Button, Container, IconButton, Typography } from "@mui/material";
import { ArrowLeft, ArrowRight, ArrowUpRight, ShieldCheck } from "lucide-react";
import { hyroxPhotos } from "../data/hyrox.js";
import { contactDetails } from "../data/contact.js";

export default function HyroxSection({ isEventPage = false }) {
  const trackRef = useRef(null);
  const [position, setPosition] = useState({ index: 0, atStart: true, atEnd: false });

  useEffect(() => {
    const track = trackRef.current;
    const update = () => {
      const cards = [...track.children];
      const left = track.scrollLeft;
      const index = cards.reduce((closest, card, i) =>
        Math.abs(card.offsetLeft - left) < Math.abs(cards[closest].offsetLeft - left) ? i : closest, 0);
      setPosition({ index, atStart: left < 4, atEnd: left + track.clientWidth >= track.scrollWidth - 4 });
    };
    track.addEventListener("scroll", update, { passive: true });
    const observer = new ResizeObserver(update);
    observer.observe(track);
    update();
    return () => { track.removeEventListener("scroll", update); observer.disconnect(); };
  }, []);

  const move = (direction) => {
    const track = trackRef.current;
    const offsets = [...track.children].map((card) => card.offsetLeft);
    const target = direction > 0
      ? offsets.find((offset) => offset > track.scrollLeft + 4) ?? track.scrollWidth
      : offsets.findLast((offset) => offset < track.scrollLeft - 4) ?? 0;
    track.scrollTo({ left: target, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" });
  };

  return (
    <Box component="section" id="hyrox" className="hyrox-story" aria-labelledby="hyrox-story-title">
      <Container maxWidth="xl">
        <Box className="hyrox-story__heading">
          <Box data-reveal>
            <span className="hyrox-story__eyebrow"><ShieldCheck size={16} /> The HYROX collaboration</span>
            <Typography component="h2" id="hyrox-story-title">A part of the race.<br /><span>A partner in recovery.</span></Typography>
          </Box>
          <Box className="hyrox-story__intro" data-reveal>
            <Typography>As HYROX's official physiotherapy partner, our team was on site to support athletes with hands-on care, sports taping and recovery. Here are a few moments from the ground.</Typography>
            <span>Our people. Our work. Through the lens.</span>
          </Box>
        </Box>
        <Box className="hyrox-gallery__toolbar">
          <span>THE RACE-DAY JOURNAL <small>{String(hyroxPhotos.length).padStart(2, "0")} moments</small></span>
          <Box className="hyrox-gallery__controls">
            <IconButton aria-label="Previous HYROX photos" aria-controls="hyrox-photo-gallery" disabled={position.atStart} onClick={() => move(-1)}><ArrowLeft size={20} /></IconButton>
            <IconButton aria-label="Next HYROX photos" aria-controls="hyrox-photo-gallery" disabled={position.atEnd} onClick={() => move(1)}><ArrowRight size={20} /></IconButton>
          </Box>
        </Box>
        <Box id="hyrox-photo-gallery" className="hyrox-gallery" ref={trackRef} role="region" aria-roledescription="carousel" aria-label="HYROX event photographs. Use the arrow keys to browse." tabIndex={0}
          onKeyDown={(event) => {
            if (event.target !== event.currentTarget) return;
            if (event.key === "ArrowLeft" || event.key === "ArrowRight") { event.preventDefault(); move(event.key === "ArrowRight" ? 1 : -1); }
            if (event.key === "Home" || event.key === "End") { event.preventDefault(); event.currentTarget.scrollTo({ left: event.key === "Home" ? 0 : event.currentTarget.scrollWidth, behavior: "instant" }); }
          }}>
          {hyroxPhotos.map((photo, index) => (
            <Box component="figure" className={`hyrox-gallery__card${photo.landscape ? " hyrox-gallery__card--landscape" : ""}`} key={photo.src} role="group" aria-roledescription="slide" aria-label={`${index + 1} of ${hyroxPhotos.length}`}>
              <Box className="hyrox-gallery__image"><img src={photo.src} alt={photo.alt} width={photo.width} height={photo.height} loading="lazy" decoding="async" /><span>{String(index + 1).padStart(2, "0")}</span></Box>
              <figcaption><span>{photo.category}</span><strong>{photo.title}</strong></figcaption>
            </Box>
          ))}
        </Box>
        <Box className="hyrox-gallery__footer"><span>Swipe or use the arrows to explore</span><span aria-live="polite" aria-atomic="true">Photo {position.index + 1} of {hyroxPhotos.length}</span></Box>
        <Box className="hyrox-story__cta" data-reveal>
          <Box><span>YOUR EVENT. OUR EXPERTISE.</span><Typography component="h3">Bring dedicated physio care to your start line.</Typography></Box>
          <Button component="a" href={isEventPage ? contactDetails.eventCoverageWhatsappHref : "/event-coverage"} target={isEventPage ? "_blank" : undefined} rel={isEventPage ? "noopener noreferrer" : undefined} endIcon={<ArrowUpRight size={19} />}>{isEventPage ? "Discuss Your Event" : "Explore Event Coverage"}</Button>
        </Box>
      </Container>
    </Box>
  );
}
