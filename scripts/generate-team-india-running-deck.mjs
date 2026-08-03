import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import pptxgen from "pptxgenjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const OUT = process.env.DECK_OUT
  ? path.resolve(ROOT, process.env.DECK_OUT)
  : path.join(ROOT, "docs", "GetYourPhysio_Team_India_Running_Proposal.pptx");

const A = {
  logo: path.join(ROOT, "src", "assets", "logoNew2.jpg"),
  assessment: path.join(ROOT, "src", "assets", "generated", "event-race-injury-assessment.png"),
  taping: path.join(ROOT, "src", "assets", "generated", "event-pre-race-taping.png"),
  recoveryZone: path.join(ROOT, "src", "assets", "generated", "event-recovery-zone-team.png"),
  experience: path.join(ROOT, "src", "assets", "generated", "event-experience-collaboration.png"),
};

const SIZE = new Map([
  [A.logo, [1254, 1254]],
  [A.assessment, [1672, 941]],
  [A.taping, [1672, 941]],
  [A.recoveryZone, [1672, 941]],
  [A.experience, [1672, 941]],
]);

const C = {
  navy: "061B3A",
  navy2: "0B2D52",
  teal: "12A59A",
  tealDark: "08766F",
  tealLight: "DFF6F3",
  blue: "1479BF",
  blueLight: "E5F2FA",
  orange: "F2A33A",
  orangeLight: "FFF2DE",
  red: "D95B59",
  white: "FFFFFF",
  mist: "F6FAFC",
  ink: "13314A",
  slate: "567083",
  line: "D7E4EB",
};

const pptx = new pptxgen();
pptx.layout = "LAYOUT_WIDE";
pptx.author = "GetYourPhysio.in";
pptx.company = "GetYourPhysio.in";
pptx.subject = "Official Recovery Partner Proposal for Team India Running";
pptx.title = "GetYourPhysio.in — Team India Running Recovery Partner Proposal";
pptx.lang = "en-IN";
pptx.theme = {
  headFontFace: "Aptos Display",
  bodyFontFace: "Aptos",
  lang: "en-IN",
};

const noLine = { color: C.white, transparency: 100 };
const shadow = { type: "outer", color: "0B2844", opacity: 0.14, blur: 2, angle: 45, distance: 1.5 };

pptx.defineSlideMaster({
  title: "LIGHT",
  background: { color: C.mist },
  objects: [
    { rect: { x: 0, y: 0, w: 13.333, h: 0.08, fill: { color: C.teal }, line: noLine } },
    { line: { x: 0.55, y: 7.08, w: 12.2, h: 0, line: { color: C.line, width: 0.8 } } },
    {
      text: {
        text: "GETYOURPHYSIO.IN  •  TEAM INDIA RUNNING PROPOSAL",
        options: { x: 0.58, y: 7.14, w: 6.2, h: 0.16, fontFace: "Aptos", fontSize: 7.5, bold: true, color: C.slate, charSpacing: 1.1, margin: 0 },
      },
    },
    {
      text: {
        text: "CONFIDENTIAL",
        options: { x: 11.45, y: 7.14, w: 1.2, h: 0.16, fontFace: "Aptos", fontSize: 7.5, bold: true, color: C.slate, align: "right", charSpacing: 1, margin: 0 },
      },
    },
  ],
  slideNumber: { x: 12.82, y: 7.14, color: C.slate, fontFace: "Aptos", fontSize: 7.5 },
});

function text(slide, value, x, y, w, h, options = {}) {
  slide.addText(value, {
    x,
    y,
    w,
    h,
    fontFace: "Aptos",
    fontSize: 16,
    color: C.ink,
    margin: 0,
    valign: "mid",
    fit: "shrink",
    breakLine: false,
    ...options,
  });
}

function card(slide, x, y, w, h, options = {}) {
  slide.addShape(pptx.ShapeType.roundRect, {
    x,
    y,
    w,
    h,
    rectRadius: options.radius ?? 0.07,
    fill: { color: options.fill ?? C.white, transparency: options.transparency ?? 0 },
    line: { color: options.line ?? C.line, width: options.lineWidth ?? 0.8 },
    shadow: options.shadow === false ? undefined : { ...shadow },
  });
}

function sectionTitle(slide, eyebrow, title, subtitle = "") {
  text(slide, eyebrow.toUpperCase(), 0.6, 0.38, 4.8, 0.25, {
    fontSize: 9,
    bold: true,
    color: C.teal,
    charSpacing: 2,
  });
  text(slide, title, 0.6, 0.72, 12.0, subtitle ? 0.68 : 0.78, {
    fontFace: "Aptos Display",
    fontSize: 28,
    bold: true,
    color: C.navy,
    breakLine: true,
  });
  if (subtitle) {
    text(slide, subtitle, 0.62, 1.43, 11.85, 0.45, {
      fontSize: 12.4,
      color: C.slate,
      breakLine: true,
    });
  }
}

function crop(imagePath, x, y, w, h) {
  const [iw, ih] = SIZE.get(imagePath);
  return { path: imagePath, x, y, w: iw / ih, h: 1, sizing: { type: "cover", w, h } };
}

function cropRegion(imagePath, x, y, w, h, region) {
  const [iw, ih] = SIZE.get(imagePath);
  const sx = w / region.w;
  const sy = h / region.h;
  return {
    path: imagePath,
    x,
    y,
    w: iw * sx,
    h: ih * sy,
    sizing: { type: "crop", x: region.x * sx, y: region.y * sy, w, h },
  };
}

function tightLogo(slide, x, y, w) {
  const region = { x: 89, y: 156, w: 1072, h: 840 };
  const h = (w * region.h) / region.w;
  slide.addImage(cropRegion(A.logo, x, y, w, h, region));
}

function pill(slide, value, x, y, w, options = {}) {
  slide.addShape(pptx.ShapeType.roundRect, {
    x,
    y,
    w,
    h: 0.34,
    rectRadius: 0.07,
    fill: { color: options.fill ?? C.tealLight },
    line: { color: options.fill ?? C.tealLight },
  });
  text(slide, value, x + 0.1, y + 0.02, w - 0.2, 0.29, {
    fontSize: 8.5,
    bold: true,
    color: options.color ?? C.tealDark,
    charSpacing: 1.1,
    align: "center",
  });
}

function checkRow(slide, value, x, y, w, options = {}) {
  const h = options.h ?? 0.42;
  const s = 0.22;
  const cy = y + (h - s) / 2;
  slide.addShape(pptx.ShapeType.ellipse, {
    x,
    y: cy,
    w: s,
    h: s,
    fill: { color: options.color ?? C.teal },
    line: noLine,
  });
  text(slide, "✓", x, cy - 0.004, s, s, { fontSize: 8.5, bold: true, color: C.white, align: "center" });
  text(slide, value, x + 0.34, y, w - 0.34, h, {
    fontSize: options.fontSize ?? 11,
    color: options.textColor ?? C.ink,
    bold: options.bold ?? false,
    breakLine: true,
  });
}

function numberBadge(slide, n, x, y, color = C.teal) {
  slide.addShape(pptx.ShapeType.ellipse, { x, y, w: 0.48, h: 0.48, fill: { color }, line: noLine });
  text(slide, String(n).padStart(2, "0"), x, y, 0.48, 0.46, { fontSize: 10, bold: true, color: C.white, align: "center" });
}

function photoLabel(slide, value, x, y, w) {
  slide.addShape(pptx.ShapeType.roundRect, {
    x,
    y,
    w,
    h: 0.38,
    rectRadius: 0.05,
    fill: { color: C.navy, transparency: 8 },
    line: noLine,
  });
  text(slide, value, x + 0.12, y + 0.03, w - 0.24, 0.3, {
    fontSize: 8,
    bold: true,
    color: C.white,
    charSpacing: 1,
    align: "center",
  });
}

// Slide 1 — Cover
{
  const slide = pptx.addSlide();
  slide.background = { color: C.mist };
  slide.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: 13.333, h: 0.1, fill: { color: C.teal }, line: noLine });
  slide.addShape(pptx.ShapeType.ellipse, { x: 9.85, y: -1.15, w: 4.9, h: 4.9, fill: { color: C.tealLight }, line: noLine });
  slide.addShape(pptx.ShapeType.ellipse, { x: 10.85, y: 5.18, w: 3.1, h: 3.1, fill: { color: C.blueLight }, line: noLine });
  slide.addShape(pptx.ShapeType.roundRect, {
    x: 9.75,
    y: 0.72,
    w: 2.45,
    h: 1.54,
    rectRadius: 0.08,
    fill: { color: C.white },
    line: { color: C.white },
    shadow: { ...shadow },
  });
  tightLogo(slide, 10.05, 0.8, 1.82);
  pill(slide, "OFFICIAL PARTNER PROPOSAL", 0.72, 0.76, 2.48, { fill: C.teal, color: C.white });
  text(slide, "Official Recovery\nPartner Proposal", 0.72, 1.39, 6.35, 1.25, {
    fontFace: "Aptos Display",
    fontSize: 31,
    bold: true,
    color: C.navy,
    breakLine: true,
  });
  text(slide, "PREPARED FOR", 0.74, 2.98, 1.5, 0.2, { fontSize: 8.5, bold: true, color: C.teal, charSpacing: 1.5 });
  text(slide, "Team India Running", 0.74, 3.3, 4.8, 0.36, { fontSize: 17, bold: true, color: C.navy });
  text(slide, "Presented by Dr. Kandarp Sharma (PT)\nSports Physiotherapist", 0.74, 3.89, 5.75, 0.62, {
    fontSize: 12.5,
    color: C.slate,
    breakLine: true,
  });
  slide.addShape(pptx.ShapeType.line, { x: 0.74, y: 4.92, w: 2.1, h: 0, line: { color: C.teal, width: 3 } });
  text(slide, "HEALING AT YOUR DOORSTEP", 0.74, 5.14, 4.2, 0.25, {
    fontSize: 9,
    bold: true,
    color: C.tealDark,
    charSpacing: 1.5,
  });
  slide.addImage(crop(A.assessment, 6.53, 2.62, 6.2, 4.36));
  slide.addShape(pptx.ShapeType.roundRect, {
    x: 7.02,
    y: 6.15,
    w: 5.22,
    h: 0.52,
    rectRadius: 0.05,
    fill: { color: C.navy, transparency: 5 },
    line: noLine,
  });
  text(slide, "ON-SITE PHYSIOTHERAPY • ATHLETE RECOVERY • EVENT SUPPORT", 7.28, 6.25, 4.7, 0.3, {
    fontSize: 8.4,
    bold: true,
    color: C.white,
    charSpacing: 0.8,
    align: "center",
  });
  text(slide, "GetYourPhysio.in  •  Gurugram", 0.74, 6.86, 3.8, 0.22, {
    fontSize: 9,
    bold: true,
    color: C.navy,
    charSpacing: 0.7,
  });
}

// Slide 2 — About
{
  const slide = pptx.addSlide("LIGHT");
  sectionTitle(slide, "About GetYourPhysio.in", "Who we are", "Sports and orthopedic Physiotherapy built around prevention, faster recovery and confident performance.");
  card(slide, 0.62, 2.08, 6.15, 4.5, { shadow: false });
  text(
    slide,
    "GetYourPhysio.in is a sports and orthopedic Physiotherapy service dedicated to helping athletes and active individuals prevent injuries, recover faster, and perform at their best.",
    0.94,
    2.43,
    5.48,
    1.04,
    { fontSize: 15, bold: true, color: C.navy, breakLine: true },
  );
  text(
    slide,
    "Our focus is on evidence-based treatment, athlete care, and on-site recovery support for endurance and fitness events.",
    0.94,
    3.64,
    5.48,
    0.75,
    { fontSize: 12, color: C.slate, breakLine: true },
  );
  slide.addImage(crop(A.taping, 0.94, 4.72, 5.48, 1.5));
  photoLabel(slide, "ATHLETE-FIRST • EVIDENCE-BASED • EVENT-READY", 2.02, 5.66, 3.35);

  text(slide, "OUR EXPERTISE", 7.28, 2.14, 2.8, 0.23, { fontSize: 9, bold: true, color: C.teal, charSpacing: 1.5 });
  const expertise = [
    ["Sports Injury Rehabilitation", C.blue],
    ["Orthopedic Physiotherapy", C.teal],
    ["Athlete Recovery & Performance", C.orange],
    ["Event Medical & Recovery Support", C.navy2],
    ["Home Physiotherapy Services", C.blue],
  ];
  expertise.forEach(([label, color], i) => {
    const y = 2.58 + i * 0.78;
    card(slide, 7.28, y, 5.38, 0.62, { shadow: false, fill: C.white });
    slide.addShape(pptx.ShapeType.rect, { x: 7.28, y, w: 0.09, h: 0.62, fill: { color }, line: noLine });
    text(slide, label, 7.58, y + 0.08, 4.76, 0.44, { fontSize: 12.2, bold: true, color: C.navy });
  });
}

// Slide 3 — Services
{
  const slide = pptx.addSlide("LIGHT");
  sectionTitle(
    slide,
    "Our services",
    "Comprehensive recovery support",
    "Professional Physiotherapy before, during and after sporting events—helping participants stay safe and perform at their best.",
  );
  const services = [
    "Pre-race taping and injury prevention",
    "On-site injury assessment",
    "Muscle cramp management",
    "Sports massage and soft tissue release",
    "Manual therapy and joint mobilization",
    "Recovery stretching and mobility work",
    "Dry needling—when clinically appropriate",
    "Post-race recovery guidance and rehabilitation advice",
  ];
  services.forEach((item, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const x = 0.62 + col * 4.18;
    const y = 2.18 + row * 1.03;
    card(slide, x, y, 3.88, 0.82, { shadow: false });
    numberBadge(slide, i + 1, x + 0.2, y + 0.17, i % 3 === 0 ? C.blue : i % 3 === 1 ? C.teal : C.orange);
    text(slide, item, x + 0.86, y + 0.1, 2.78, 0.62, { fontSize: 10.8, bold: true, color: C.navy, breakLine: true });
  });
  slide.addImage(crop(A.assessment, 9.17, 2.18, 3.56, 4.7));
  slide.addShape(pptx.ShapeType.roundRect, {
    x: 9.48,
    y: 5.78,
    w: 2.94,
    h: 0.76,
    rectRadius: 0.05,
    fill: { color: C.navy, transparency: 5 },
    line: noLine,
  });
  text(slide, "CARE AT THE POINT\nOF NEED", 9.7, 5.9, 2.5, 0.48, {
    fontSize: 12,
    bold: true,
    color: C.white,
    align: "center",
    breakLine: true,
  });
}

// Slide 4 — Recovery Zone Setup
{
  const slide = pptx.addSlide("LIGHT");
  sectionTitle(slide, "Recovery Zone setup", "Efficient recovery zone", "Designed for smooth athlete flow and quick access to professional care.");
  slide.addImage(crop(A.recoveryZone, 0.62, 2.12, 6.42, 4.47));
  photoLabel(slide, "ILLUSTRATIVE EVENT-DAY RECOVERY ZONE", 1.68, 5.92, 4.3);

  const setup = [
    "Treatment tables",
    "Recovery beds",
    "Sports taping station",
    "Ice therapy station",
    "Manual therapy area",
    "Athlete waiting & assessment area",
    "Recovery equipment & consumables",
  ];
  card(slide, 7.43, 2.12, 5.3, 3.62, { shadow: false });
  text(slide, "SETUP INCLUDES", 7.76, 2.43, 2.6, 0.22, { fontSize: 9, bold: true, color: C.teal, charSpacing: 1.4 });
  setup.forEach((item, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    checkRow(slide, item, 7.76 + col * 2.45, 2.9 + row * 0.62, 2.2, { h: 0.44, fontSize: 10.2, color: col ? C.blue : C.teal });
  });
  card(slide, 7.43, 5.97, 5.3, 0.62, { fill: C.navy, line: C.navy, shadow: false });
  text(slide, "CUSTOMISED TO PARTICIPANT NUMBERS & EVENT REQUIREMENTS", 7.68, 6.1, 4.8, 0.32, {
    fontSize: 9.2,
    bold: true,
    color: C.white,
    charSpacing: 0.7,
    align: "center",
  });
}

// Slide 5 — Team Strength
{
  const slide = pptx.addSlide("LIGHT");
  sectionTitle(slide, "Team strength", "Experienced & scalable team", "Qualified professionals trained to manage sports injuries and post-race recovery efficiently.");
  const roles = [
    ["LEAD SPORTS PHYSIOTHERAPIST", "Clinical lead • escalation • team oversight", C.navy],
    ["SPORTS PHYSIOTHERAPISTS", "Assessment • treatment • athlete guidance", C.teal],
    ["PHYSIOTHERAPY INTERNS", "Flow support • supervised recovery assistance", C.blue],
    ["EVENT COORDINATOR", "Operations • organiser liaison • reporting", C.orange],
    ["SUPPORT STAFF & VOLUNTEERS", "Check-in • supplies • participant movement", C.navy2],
  ];

  card(slide, 4.33, 2.12, 4.67, 0.92, { fill: C.navy, line: C.navy, shadow: false });
  text(slide, roles[0][0], 4.62, 2.27, 4.1, 0.25, { fontSize: 12, bold: true, color: C.white, align: "center", charSpacing: 0.8 });
  text(slide, roles[0][1], 4.62, 2.58, 4.1, 0.2, { fontSize: 9.2, color: "C7D9E7", align: "center" });
  slide.addShape(pptx.ShapeType.line, { x: 6.67, y: 3.04, w: 0, h: 0.33, line: { color: C.teal, width: 2 } });
  roles.slice(1).forEach((role, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const x = 1.05 + col * 6.32;
    const y = 3.37 + row * 1.38;
    card(slide, x, y, 4.9, 1.08, { shadow: false });
    slide.addShape(pptx.ShapeType.rect, { x, y, w: 0.1, h: 1.08, fill: { color: role[2] }, line: noLine });
    text(slide, role[0], x + 0.32, y + 0.17, 4.25, 0.25, { fontSize: 11.2, bold: true, color: role[2], charSpacing: 0.5 });
    text(slide, role[1], x + 0.32, y + 0.52, 4.25, 0.32, { fontSize: 9.8, color: C.slate, breakLine: true });
  });
  pill(slide, "TEAM SIZE SCALES WITH EVENT SIZE & EXPECTED TURNOUT", 4.12, 6.35, 5.1, { fill: C.teal, color: C.white });
}

// Slide 6 — Experience
{
  const slide = pptx.addSlide("LIGHT");
  sectionTitle(slide, "Previous experience", "Experience & collaborations", "Supporting athletes across high-performance, fitness and endurance environments.");
  const items = [
    "Athlete rehabilitation",
    "Gym collaborations",
    "Sports injury management",
    "Marathon and endurance event support",
    "Strength & conditioning recovery",
    "Individual athlete performance care",
  ];
  card(slide, 0.62, 2.12, 4.8, 4.48, { shadow: false });
  items.forEach((item, i) => checkRow(slide, item, 0.98, 2.55 + i * 0.59, 4.08, { h: 0.42, fontSize: 11.3, color: i % 2 ? C.blue : C.teal }));
  card(slide, 0.98, 6.05, 4.08, 0.3, { fill: C.tealLight, line: C.tealLight, shadow: false });
  text(slide, "Event photographs can be incorporated when supplied.", 1.1, 6.08, 3.84, 0.22, { fontSize: 8.2, bold: true, color: C.tealDark, align: "center" });
  slide.addImage(crop(A.experience, 5.77, 2.12, 6.96, 4.48));
  photoLabel(slide, "ILLUSTRATIVE SPORTS-EVENT COLLABORATION", 8.75, 5.92, 3.55);
}

// Slide 7 — Workflow
{
  const slide = pptx.addSlide("LIGHT");
  sectionTitle(slide, "Event-day workflow", "Structured athlete care", "A clear pathway ensures timely care, appropriate escalation and useful recovery guidance.");
  const steps = [
    ["Report", "Athlete arrives at Recovery Zone"],
    ["Assess", "Initial Physiotherapy assessment"],
    ["Evaluate", "Clinical evaluation and diagnosis"],
    ["Treat", "Immediate recovery intervention"],
    ["Refer", "Medical-team referral if required"],
    ["Guide", "Recovery and return-to-activity advice"],
    ["Document", "Post-event recommendations"],
  ];
  steps.forEach((step, i) => {
    const topRow = i < 4;
    const idx = topRow ? i : i - 4;
    const x = topRow ? 0.62 + idx * 3.13 : 2.18 + idx * 3.13;
    const y = topRow ? 2.15 : 4.54;
    const color = i === 4 ? C.red : i % 3 === 0 ? C.blue : i % 3 === 1 ? C.teal : C.orange;
    card(slide, x, y, 2.63, 1.62, { shadow: false, line: i === 4 ? "EAB5B3" : C.line });
    numberBadge(slide, i + 1, x + 0.18, y + 0.18, color);
    text(slide, step[0].toUpperCase(), x + 0.82, y + 0.18, 1.55, 0.25, { fontSize: 10.5, bold: true, color, charSpacing: 0.6 });
    text(slide, step[1], x + 0.2, y + 0.78, 2.22, 0.54, { fontSize: 10.2, color: C.ink, align: "center", breakLine: true });
    if (topRow && i < 3) {
      slide.addShape(pptx.ShapeType.line, { x: x + 2.69, y: y + 0.82, w: 0.32, h: 0, line: { color: C.teal, width: 1.8, endArrowType: "triangle" } });
    }
    if (!topRow && i < 6) {
      slide.addShape(pptx.ShapeType.line, { x: x + 2.69, y: y + 0.82, w: 0.32, h: 0, line: { color: C.teal, width: 1.8, endArrowType: "triangle" } });
    }
  });
  pill(slide, "LISTEN • ASSESS • ACT • ESCALATE • GUIDE", 4.17, 6.45, 5.0, { fill: C.navy, color: C.white });
}

// Slide 8 — Collaboration
{
  const slide = pptx.addSlide("LIGHT");
  sectionTitle(slide, "Collaboration model", "What we offer", "Complete recovery support throughout the event as your Official Recovery Partner.");
  slide.addImage(crop(A.taping, 0.62, 2.12, 4.78, 4.5));
  photoLabel(slide, "PRE-RACE PREPARATION & TAPING", 1.43, 5.93, 3.16);
  const offer = [
    "Complete Recovery Zone setup",
    "Qualified Physiotherapy team",
    "Recovery equipment and treatment supplies",
    "Sports taping and manual therapy",
    "Athlete recovery and injury-prevention education",
    "Event-day operational support",
    "Post-event feedback and recovery summary—optional",
  ];
  offer.forEach((item, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const x = 5.78 + col * 3.46;
    const y = 2.12 + row * 1.08;
    card(slide, x, y, 3.18, 0.84, { shadow: false });
    numberBadge(slide, i + 1, x + 0.18, y + 0.18, i % 3 === 0 ? C.blue : i % 3 === 1 ? C.teal : C.orange);
    text(slide, item, x + 0.82, y + 0.1, 2.12, 0.62, { fontSize: 9.9, bold: true, color: C.navy, breakLine: true });
  });
}

// Slide 9 — Why Partner
{
  const slide = pptx.addSlide("LIGHT");
  sectionTitle(slide, "Why partner with GetYourPhysio.in?", "Adding value to your event", "Professional recovery support strengthens athlete experience, safety and event quality.");
  const benefits = [
    "Professional on-site Physiotherapy support",
    "Faster injury management and recovery",
    "Enhanced athlete safety",
    "Improved participant satisfaction",
    "Better event reputation and credibility",
    "Positive brand association",
    "Seamless Recovery Zone operations",
  ];
  benefits.forEach((item, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const x = 0.62 + col * 3.72;
    const y = 2.15 + row * 0.88;
    card(slide, x, y, 3.42, 0.68, { shadow: false });
    checkRow(slide, item, x + 0.22, y + 0.1, 2.98, { h: 0.48, fontSize: 10.2, color: col ? C.blue : C.teal });
  });
  slide.addImage(crop(A.assessment, 8.35, 2.15, 4.38, 3.58));
  card(slide, 0.62, 5.96, 12.11, 0.62, { fill: C.navy, line: C.navy, shadow: false });
  text(slide, "OUR GOAL", 0.96, 6.11, 1.25, 0.22, { fontSize: 8.8, bold: true, color: C.teal, charSpacing: 1.4 });
  text(slide, "Help every participant recover safely, perform confidently, and leave with a positive event experience.", 2.3, 6.06, 9.86, 0.32, {
    fontSize: 12.2,
    bold: true,
    color: C.white,
    align: "center",
  });
}

// Slide 10 — Contact
{
  const slide = pptx.addSlide();
  slide.background = { color: C.mist };
  slide.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: 13.333, h: 0.1, fill: { color: C.teal }, line: noLine });
  slide.addShape(pptx.ShapeType.ellipse, { x: 9.85, y: -1.15, w: 4.9, h: 4.9, fill: { color: C.tealLight }, line: noLine });
  slide.addShape(pptx.ShapeType.ellipse, { x: 10.9, y: 4.83, w: 3.18, h: 3.18, fill: { color: C.blueLight }, line: noLine });
  slide.addShape(pptx.ShapeType.roundRect, {
    x: 9.75,
    y: 0.72,
    w: 2.45,
    h: 1.54,
    rectRadius: 0.08,
    fill: { color: C.white },
    line: { color: C.white },
    shadow: { ...shadow },
  });
  tightLogo(slide, 10.05, 0.8, 1.82);
  pill(slide, "THANK YOU", 0.72, 0.78, 1.55, { fill: C.teal, color: C.white });
  text(slide, "Let’s help every athlete\nfinish with confidence.", 0.72, 1.48, 7.9, 1.38, {
    fontFace: "Aptos Display",
    fontSize: 31,
    bold: true,
    color: C.navy,
    breakLine: true,
  });
  text(slide, "Dr. Kandarp Sharma (PT)", 0.74, 3.16, 4.8, 0.32, { fontSize: 16, bold: true, color: C.navy });
  text(slide, "Founder — GetYourPhysio.in  •  Sports Physiotherapist", 0.74, 3.57, 6.7, 0.25, { fontSize: 11.5, color: C.slate });
  card(slide, 0.72, 4.28, 11.86, 1.52, { fill: C.navy, line: C.navy, shadow: false });
  const contacts = [
    ["WEBSITE", "www.getyourphysio.in"],
    ["EMAIL", "getyourphysio.in@gmail.com"],
    ["PHONE", "+91 99193 87585"],
  ];
  contacts.forEach((item, i) => {
    const x = 1.06 + i * 3.82;
    text(slide, item[0], x, 4.62, 1.2, 0.18, { fontSize: 8.5, bold: true, color: C.teal, charSpacing: 1.4 });
    text(slide, item[1], x, 4.98, 3.38, 0.3, { fontSize: i === 1 ? 11.2 : 12.2, bold: true, color: C.white });
    if (i < 2) slide.addShape(pptx.ShapeType.line, { x: x + 3.48, y: 4.62, w: 0, h: 0.84, line: { color: "36536E", width: 0.8 } });
  });
  text(slide, "“Helping athletes recover stronger, perform better, and finish with confidence.”", 0.74, 6.43, 10.6, 0.28, {
    fontSize: 12.2,
    bold: true,
    italic: true,
    color: C.tealDark,
  });
  text(slide, "GetYourPhysio.in  •  Gurugram", 0.74, 6.9, 3.8, 0.22, { fontSize: 9, bold: true, color: C.navy, charSpacing: 0.7 });
}

fs.mkdirSync(path.dirname(OUT), { recursive: true });
await pptx.writeFile({ fileName: OUT });
console.log(`Created ${OUT}`);
