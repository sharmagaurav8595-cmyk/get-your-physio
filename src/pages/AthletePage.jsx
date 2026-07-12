import { Box, Button, Container, Stack, Typography } from "@mui/material";
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  Bolt,
  CalendarCheck,
  Check,
  ChevronDown,
  Dumbbell,
  Gauge,
  HeartPulse,
  Menu,
  MoveUpRight,
  Phone,
  ShieldCheck,
  Sparkles,
  Target,
  TimerReset,
  Trophy,
  X,
} from "lucide-react";
import { useState } from "react";
import logo from "../assets/logoNew.jpg";
import { images } from "../assets/images.js";
import { contactDetails } from "../data/contact.js";
import "../styles/athlete-page.css";

const navLinks = [
  { label: "Programs", href: "#athlete-programs" },
  { label: "Method", href: "#athlete-method" },
  { label: "Recovery", href: "#athlete-recovery" },
  { label: "Book", href: "#athlete-book" },
];

const programs = [
  {
    number: "01",
    title: "Return to Sport",
    copy: "Structured progressions from pain control to confident sport-specific movement.",
    icon: Trophy,
  },
  {
    number: "02",
    title: "Performance Mobility",
    copy: "Improve usable range, control and movement efficiency without losing strength.",
    icon: Gauge,
  },
  {
    number: "03",
    title: "Strength Rebuild",
    copy: "Progressive loading that restores capacity after injury, surgery or time away.",
    icon: Dumbbell,
  },
  {
    number: "04",
    title: "Injury Prevention",
    copy: "Identify repeat-risk patterns and build a practical plan around your training week.",
    icon: ShieldCheck,
  },
];

const method = [
  { step: "Assess", copy: "Movement, strength, mobility and pain are tested against your sport demands." },
  { step: "Build", copy: "You get a progressive plan with clear exercise dosage and recovery targets." },
  { step: "Perform", copy: "Sport-specific exposure prepares you for confident return to training and play." },
];

const outcomes = [
  "Clear return-to-training criteria",
  "Sport-specific strength progressions",
  "Mobility without unnecessary stretching",
  "Load management for training weeks",
  "Home, gym and online plan options",
  "Progress markers you can understand",
];

function AthleteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="athlete-header">
      <Container maxWidth="xl" className="athlete-header__inner">
        <a href="/" className="athlete-brand" aria-label="GetYourPhysio.in home">
          <span className="athlete-brand__logo"><img src={logo} alt="" /></span>
          <span>
            <strong>GetYourPhysio.in</strong>
            <small>Sports Performance</small>
          </span>
        </a>

        <nav className="athlete-nav" aria-label="Athlete page navigation">
          {navLinks.map((link) => <a key={link.href} href={link.href}>{link.label}</a>)}
        </nav>

        <Button
          component="a"
          href={contactDetails.whatsappHref}
          target="_blank"
          rel="noopener noreferrer"
          className="athlete-header__cta"
          endIcon={<MoveUpRight size={17} />}
        >
          Start Recovery
        </Button>

        <button className="athlete-menu" onClick={() => setOpen(!open)} aria-label="Toggle navigation" aria-expanded={open}>
          {open ? <X /> : <Menu />}
        </button>

        {open && (
          <nav className="athlete-mobile-nav" aria-label="Mobile athlete page navigation">
            {navLinks.map((link) => <a key={link.href} href={link.href} onClick={() => setOpen(false)}>{link.label}</a>)}
            <a href="/">Back to main website</a>
          </nav>
        )}
      </Container>
    </header>
  );
}

export default function AthletePage() {
  return (
    <Box className="athlete-page">
      <AthleteHeader />

      <main>
        <section className="athlete-hero" id="athlete-home">
          <div className="athlete-orbit athlete-orbit--one" aria-hidden="true" />
          <div className="athlete-orbit athlete-orbit--two" aria-hidden="true" />
          <Container maxWidth="xl" className="athlete-hero__grid">
            <div className="athlete-hero__copy">
              <div className="athlete-kicker"><Bolt size={16} /> Physiotherapy built for movement</div>
              <Typography component="h1" className="athlete-hero__title">
                Recover stronger.<br />Return <span>ready.</span>
              </Typography>
              <Typography className="athlete-hero__lead">
                Athlete-focused Physiotherapy for injury rehabilitation, strength restoration and a confident return to training.
              </Typography>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} className="athlete-hero__actions">
                <Button
                  component="a"
                  href={contactDetails.whatsappHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="athlete-btn athlete-btn--lime"
                  endIcon={<ArrowRight size={19} />}
                >
                  Book Athlete Assessment
                </Button>
                <Button component="a" href="#athlete-programs" className="athlete-btn athlete-btn--ghost" endIcon={<ChevronDown size={19} />}>
                  Explore Programs
                </Button>
              </Stack>
              <div className="athlete-proof" data-stagger>
                <div><strong>1:1</strong><span>Personalized care</span></div>
                <div><strong>4-step</strong><span>Return framework</span></div>
                <div><strong>Home</strong><span>& online support</span></div>
              </div>
            </div>

            <div className="athlete-hero__visual">
              <div className="athlete-hero__image-wrap">
                <img src={images.sports} alt="Athlete working with a physiotherapist during sports rehabilitation" />
              </div>
              <div className="athlete-score-card athlete-float">
                <span className="athlete-score-card__icon"><Target size={21} /></span>
                <div><small>Recovery focus</small><strong>Sport-specific</strong></div>
              </div>
              <div className="athlete-ready-card athlete-float athlete-float--delay">
                <BadgeCheck size={19} /> Criteria-led return
              </div>
            </div>
          </Container>
          <div className="athlete-marquee" aria-label="Athlete services">
            <div>
              <span>SPORTS REHAB</span><Sparkles /><span>STRENGTH</span><Sparkles /><span>MOBILITY</span><Sparkles /><span>RETURN TO PLAY</span><Sparkles />
              <span>SPORTS REHAB</span><Sparkles /><span>STRENGTH</span><Sparkles /><span>MOBILITY</span><Sparkles /><span>RETURN TO PLAY</span><Sparkles />
            </div>
          </div>
        </section>

        <section className="athlete-section athlete-programs" id="athlete-programs">
          <Container maxWidth="xl">
            <div className="athlete-section-heading" data-reveal>
              <div><span>01 / Programs</span><Typography component="h2">Built around your sport.<br />Not a generic protocol.</Typography></div>
              <p>Your plan progresses with your symptoms, capacity, training schedule and the real demands you need to return to.</p>
            </div>
            <div className="athlete-program-grid" data-stagger>
              {programs.map(({ number, title, copy, icon: Icon }) => (
                <article className="athlete-program-card" key={title} data-reveal>
                  <div className="athlete-program-card__top"><span>{number}</span><Icon /></div>
                  <Typography component="h3">{title}</Typography>
                  <Typography>{copy}</Typography>
                  <a href={contactDetails.whatsappHref} target="_blank" rel="noopener noreferrer" aria-label={`Ask about ${title}`}><ArrowRight /></a>
                </article>
              ))}
            </div>
          </Container>
        </section>

        <section className="athlete-section athlete-method" id="athlete-method">
          <Container maxWidth="xl" className="athlete-method__grid">
            <div className="athlete-method__media" data-reveal>
              <img src={images.performance} alt="Physiotherapist assessing an athlete's movement" />
              <div className="athlete-method__caption"><HeartPulse /><span><small>Evidence-informed</small><strong>Progress you can measure</strong></span></div>
            </div>
            <div className="athlete-method__content">
              <span className="athlete-label" data-reveal>02 / The method</span>
              <Typography component="h2" data-reveal>Assessment to performance in three clear phases.</Typography>
              <div className="athlete-method-list" data-stagger>
                {method.map((item, index) => (
                  <div className="athlete-method-step" key={item.step} data-reveal>
                    <span>0{index + 1}</span>
                    <div><Typography component="h3">{item.step}</Typography><Typography>{item.copy}</Typography></div>
                  </div>
                ))}
              </div>
            </div>
          </Container>
        </section>

        <section className="athlete-section athlete-recovery" id="athlete-recovery">
          <Container maxWidth="xl">
            <div className="athlete-recovery__grid">
              <div>
                <span className="athlete-label" data-reveal>03 / Complete recovery</span>
                <Typography component="h2" data-reveal>More than pain relief.<br /><span>Build real capacity.</span></Typography>
              </div>
              <div className="athlete-outcomes" data-stagger>
                {outcomes.map((outcome) => <div key={outcome} data-reveal><span><Check size={17} /></span>{outcome}</div>)}
              </div>
            </div>
            <div className="athlete-image-strip" data-stagger>
              <div data-reveal><img src={images.mobility} alt="Athlete mobility training" /><span>Mobility</span></div>
              <div data-reveal><img src={images.strength} alt="Athlete strength rehabilitation" /><span>Strength</span></div>
              <div data-reveal><img src={images.recovery} alt="Sports recovery physiotherapy" /><span>Recovery</span></div>
            </div>
          </Container>
        </section>

        <section className="athlete-cta" id="athlete-book">
          <Container maxWidth="xl" className="athlete-cta__inner" data-reveal>
            <div>
              <span><TimerReset size={18} /> Your comeback starts with a clear plan</span>
              <Typography component="h2">Ready to move like an athlete again?</Typography>
            </div>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
              <Button component="a" href={contactDetails.whatsappHref} target="_blank" rel="noopener noreferrer" className="athlete-btn athlete-btn--lime" startIcon={<CalendarCheck />}>Book Assessment</Button>
              <Button component="a" href={contactDetails.phoneHref} className="athlete-btn athlete-btn--outline-light" startIcon={<Phone />}>Call Now</Button>
            </Stack>
          </Container>
        </section>
      </main>

      <footer className="athlete-footer">
        <Container maxWidth="xl" className="athlete-footer__inner">
          <a href="/" className="athlete-footer__back"><ArrowLeft /> Main website</a>
          <span>GetYourPhysio.in — Sports rehabilitation at your doorstep</span>
        </Container>
      </footer>
    </Box>
  );
}
