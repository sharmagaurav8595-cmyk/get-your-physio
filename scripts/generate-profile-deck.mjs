import pptxgen from "pptxgenjs";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const OUT = path.join(ROOT, "docs", "GetYourPhysio_Event_Partnership_Profile.pptx");

const ASSETS = {
  logo: path.join(ROOT, "src", "assets", "logoNew2.jpg"),
  hero: path.join(ROOT, "src", "assets", "generated", "male-physio-hero.png"),
  assessment: path.join(ROOT, "src", "assets", "generated", "male-physio-assessment.png"),
  sportsReturn: path.join(ROOT, "src", "assets", "generated", "male-physio-sports-return.png"),
  taping: path.join(ROOT, "src", "assets", "generated", "male-physio-taping.png"),
  mobility: path.join(ROOT, "src", "assets", "generated", "male-physio-mobility-breathing.png"),
  movement: path.join(ROOT, "src", "assets", "generated", "male-physio-movement-assessment.png"),
  manual: path.join(ROOT, "src", "assets", "generated", "male-physio-manual-therapy.png"),
};

const IMAGE_SIZE = new Map([
  [ASSETS.logo, [1254, 1254]],
  [ASSETS.hero, [1727, 910]],
  [ASSETS.assessment, [1536, 1024]],
  [ASSETS.sportsReturn, [1684, 934]],
  [ASSETS.taping, [1254, 1254]],
  [ASSETS.mobility, [1604, 981]],
  [ASSETS.movement, [1254, 1254]],
  [ASSETS.manual, [1254, 1254]],
]);

const C = {
  navy: "061B3A",
  navy2: "0A2B53",
  blue: "0F6FB8",
  blueLight: "D9EEFB",
  teal: "0F9F8F",
  tealDark: "087568",
  tealLight: "DFF7F4",
  ink: "14324A",
  slate: "52697A",
  white: "FFFFFF",
  mist: "F7FBFD",
  line: "D9E5EC",
  sky: "ECF6FC",
  orange: "F0A23B",
  red: "D95C59",
};

const pptx = new pptxgen();
pptx.layout = "LAYOUT_WIDE";
pptx.author = "GetYourPhysio.in";
pptx.company = "GetYourPhysio.in";
pptx.subject = "Event physiotherapy partnership profile";
pptx.title = "GetYourPhysio.in – Event Partnership Profile";
pptx.lang = "en-IN";
pptx.theme = {
  headFontFace: "Aptos Display",
  bodyFontFace: "Aptos",
  lang: "en-IN",
};
pptx.defineSlideMaster({
  title: "GYP_LIGHT",
  background: { color: C.mist },
  objects: [
    { rect: { x: 0, y: 0, w: 13.333, h: 0.08, fill: { color: C.teal }, line: { color: C.teal } } },
    { line: { x: 0.55, y: 7.08, w: 12.23, h: 0, line: { color: C.line, width: 0.7 } } },
    {
      text: {
        text: "GETYOURPHYSIO.IN  •  EVENT PARTNERSHIP PROFILE",
        options: { x: 0.58, y: 7.13, w: 5.6, h: 0.18, fontFace: "Aptos", fontSize: 7.5, bold: true, color: C.slate, charSpacing: 1.2, margin: 0 },
      },
    },
    {
      text: {
        text: "CONFIDENTIAL",
        options: { x: 11.55, y: 7.13, w: 1.2, h: 0.18, fontFace: "Aptos", fontSize: 7.5, bold: true, color: C.slate, align: "right", charSpacing: 1, margin: 0 },
      },
    },
  ],
  slideNumber: { x: 12.82, y: 7.13, color: C.slate, fontFace: "Aptos", fontSize: 7.5 },
});

const shadow = { type: "outer", color: "102A43", opacity: 0.12, blur: 2, angle: 45, distance: 1.5 };
const noLine = { color: "FFFFFF", transparency: 100 };

function crop(imagePath, x, y, w, h) {
  const [iw, ih] = IMAGE_SIZE.get(imagePath);
  return {
    path: imagePath,
    x,
    y,
    w: iw / ih,
    h: 1,
    sizing: { type: "cover", w, h },
  };
}

function contain(imagePath, x, y, w, h) {
  const [iw, ih] = IMAGE_SIZE.get(imagePath);
  const s = Math.min(w / iw, h / ih);
  const rw = iw * s;
  const rh = ih * s;
  return { path: imagePath, x: x + (w - rw) / 2, y: y + (h - rh) / 2, w: rw, h: rh };
}

function cropRegion(imagePath, x, y, w, h, region) {
  const [iw, ih] = IMAGE_SIZE.get(imagePath);
  const sx = w / region.w;
  const sy = h / region.h;
  return {
    path: imagePath,
    x,
    y,
    w: iw * sx,
    h: ih * sy,
    sizing: {
      type: "crop",
      x: region.x * sx,
      y: region.y * sy,
      w,
      h,
    },
  };
}

function addTightLogo(slide, x, y, w) {
  const logoRegion = { x: 89, y: 156, w: 1072, h: 840 };
  const h = (w * logoRegion.h) / logoRegion.w;
  slide.addImage(cropRegion(ASSETS.logo, x, y, w, h, logoRegion));
  return h;
}

function addText(slide, text, x, y, w, h, options = {}) {
  slide.addText(text, {
    x,
    y,
    w,
    h,
    fontFace: "Aptos",
    fontSize: 18,
    color: C.ink,
    margin: 0,
    breakLine: false,
    valign: "mid",
    fit: "shrink",
    ...options,
  });
}

function addPill(slide, text, x, y, w, options = {}) {
  slide.addShape(pptx.ShapeType.roundRect, {
    x,
    y,
    w,
    h: 0.34,
    rectRadius: 0.08,
    fill: { color: options.fill ?? C.tealLight },
    line: { color: options.line ?? options.fill ?? C.tealLight },
  });
  addText(slide, text, x + 0.12, y + 0.02, w - 0.24, 0.29, {
    fontSize: 8.5,
    bold: true,
    color: options.color ?? C.tealDark,
    charSpacing: 1.2,
    align: options.align ?? "center",
  });
}

function addSectionTitle(slide, eyebrow, title, subtitle = "") {
  addText(slide, eyebrow.toUpperCase(), 0.58, 0.42, 3.5, 0.25, {
    fontSize: 9,
    bold: true,
    color: C.teal,
    charSpacing: 2,
  });
  addText(slide, title, 0.58, 0.75, 11.95, subtitle ? 0.7 : 0.78, {
    fontFace: "Aptos Display",
    fontSize: 28,
    bold: true,
    color: C.navy,
    breakLine: true,
  });
  if (subtitle) {
    addText(slide, subtitle, 0.6, 1.48, 11.7, 0.46, {
      fontSize: 12.5,
      color: C.slate,
      breakLine: true,
    });
  }
}

function addCard(slide, x, y, w, h, options = {}) {
  slide.addShape(pptx.ShapeType.roundRect, {
    x,
    y,
    w,
    h,
    rectRadius: 0.08,
    fill: { color: options.fill ?? C.white, transparency: options.transparency ?? 0 },
    line: { color: options.line ?? C.line, width: options.lineWidth ?? 0.8, transparency: options.lineTransparency ?? 0 },
    shadow: options.shadow === false ? undefined : { ...shadow },
  });
}

function addNumberBadge(slide, number, x, y, color = C.teal) {
  slide.addShape(pptx.ShapeType.ellipse, {
    x,
    y,
    w: 0.48,
    h: 0.48,
    fill: { color },
    line: { color },
  });
  addText(slide, String(number).padStart(2, "0"), x, y + 0.01, 0.48, 0.44, {
    fontSize: 10,
    bold: true,
    color: C.white,
    align: "center",
  });
}

function addCheck(slide, text, x, y, w, options = {}) {
  const rowH = options.h ?? 0.32;
  const checkSize = 0.22;
  const checkY = y + (rowH - checkSize) / 2;
  slide.addShape(pptx.ShapeType.ellipse, {
    x,
    y: checkY,
    w: checkSize,
    h: checkSize,
    fill: { color: options.color ?? C.teal },
    line: noLine,
  });
  addText(slide, "✓", x, checkY - 0.005, checkSize, checkSize, {
    fontSize: 9,
    bold: true,
    color: C.white,
    align: "center",
    valign: "mid",
  });
  addText(slide, text, x + 0.34, y, w - 0.34, rowH, {
    fontSize: options.fontSize ?? 11.5,
    color: options.textColor ?? C.ink,
    bold: options.bold ?? false,
    breakLine: true,
  });
}

function addImageWithOverlay(slide, imagePath, x, y, w, h, overlay = 0) {
  slide.addImage(crop(imagePath, x, y, w, h));
  if (overlay > 0) {
    slide.addShape(pptx.ShapeType.rect, {
      x,
      y,
      w,
      h,
      fill: { color: C.navy, transparency: 100 - overlay },
      line: noLine,
    });
  }
}

// 1 — Cover
{
  const slide = pptx.addSlide();
  slide.background = { color: C.navy };
  addImageWithOverlay(slide, ASSETS.hero, 7.72, 0, 5.61, 7.5, 22);
  slide.addShape(pptx.ShapeType.rect, { x: 7.33, y: 0, w: 0.4, h: 7.5, fill: { color: C.teal }, line: noLine });
  slide.addShape(pptx.ShapeType.roundRect, {
    x: 0.7,
    y: 0.55,
    w: 2.45,
    h: 1.54,
    rectRadius: 0.08,
    fill: { color: C.white },
    line: { color: C.white },
    shadow: { ...shadow },
  });
  addTightLogo(slide, 1.0, 0.63, 1.82);
  addPill(slide, "EVENT PARTNERSHIP PROFILE", 0.72, 2.35, 2.55, { fill: C.teal, color: C.white, line: C.teal });
  addText(slide, "Official physiotherapy.\nOn-ground athlete care.", 0.72, 2.78, 6.1, 1.68, {
    fontFace: "Aptos Display",
    fontSize: 31,
    bold: true,
    color: C.white,
    breakLine: true,
  });
  addText(slide, "A partnership profile for sporting events, races,\nfitness communities and active experiences.", 0.74, 4.63, 5.8, 0.82, {
    fontSize: 15,
    color: "D9E8F5",
    breakLine: true,
  });
  slide.addShape(pptx.ShapeType.line, { x: 0.74, y: 5.82, w: 2.25, h: 0, line: { color: C.teal, width: 3 } });
  addText(slide, "ATHLETE CARE — FROM WARM-UP TO FINISH LINE", 0.74, 6.04, 5.95, 0.3, {
    fontSize: 9.5,
    bold: true,
    color: C.white,
    charSpacing: 1.4,
  });
  addText(slide, "GURUGRAM  •  2026", 0.74, 6.68, 2.5, 0.25, {
    fontSize: 8.5,
    bold: true,
    color: "A8C1D5",
    charSpacing: 1.5,
  });
  addText(slide, "GetYourPhysio.in", 9.04, 6.73, 3.55, 0.34, {
    fontSize: 15,
    bold: true,
    color: C.white,
    align: "right",
  });
  slide.addNotes("Open with the partnership ambition: GetYourPhysio.in can become the event’s official physiotherapy and recovery partner.");
}

// 2 — Company snapshot
{
  const slide = pptx.addSlide("GYP_LIGHT");
  addSectionTitle(slide, "Who we are", "Clinical thinking. Athlete-first delivery.", "Gurugram-based sports physiotherapy and rehabilitation support—where athletes train, compete and recover.");
  addImageWithOverlay(slide, ASSETS.assessment, 7.75, 2.12, 4.98, 4.5, 7);
  slide.addShape(pptx.ShapeType.roundRect, {
    x: 8.04,
    y: 5.41,
    w: 4.38,
    h: 0.92,
    rectRadius: 0.06,
    fill: { color: C.navy, transparency: 5 },
    line: noLine,
  });
  addText(slide, "From assessment to confident movement", 8.28, 5.57, 3.9, 0.25, {
    fontSize: 13,
    bold: true,
    color: C.white,
  });
  addText(slide, "Personalised, evidence-informed care", 8.28, 5.91, 3.85, 0.18, {
    fontSize: 9.5,
    color: "C8DCEB",
  });

  const pillars = [
    { n: "01", title: "Recover faster", text: "Structured assessment, treatment and progressive rehabilitation." },
    { n: "02", title: "Reduce injury risk", text: "Screening, education, mobility and preventive support." },
    { n: "03", title: "Return with confidence", text: "Personalised exercise and return-to-sport planning." },
  ];
  pillars.forEach((p, i) => {
    const y = 2.12 + i * 1.38;
    addNumberBadge(slide, i + 1, 0.62, y + 0.06, i === 1 ? C.blue : C.teal);
    addText(slide, p.title, 1.32, y, 2.45, 0.36, { fontSize: 16, bold: true, color: C.navy });
    addText(slide, p.text, 1.32, y + 0.42, 5.58, 0.57, { fontSize: 11.5, color: C.slate, breakLine: true });
    if (i < 2) slide.addShape(pptx.ShapeType.line, { x: 1.32, y: y + 1.14, w: 5.7, h: 0, line: { color: C.line, width: 0.8 } });
  });
  addPill(slide, "RACES", 0.62, 6.17, 1.02);
  addPill(slide, "TOURNAMENTS", 1.78, 6.17, 1.68, { fill: C.blueLight, color: C.blue });
  addPill(slide, "FITNESS EVENTS", 3.6, 6.17, 1.78);
  addPill(slide, "SPORTS COMMUNITIES", 5.52, 6.17, 2.18, { fill: C.blueLight, color: C.blue });
}

// 3 — Event need
{
  const slide = pptx.addSlide("GYP_LIGHT");
  addSectionTitle(slide, "The opportunity", "Athlete care is part of the event experience.", "The right support at the right moment helps participants feel safer, more confident and better looked after.");

  const moments = [
    {
      label: "BEFORE",
      title: "Ready to start",
      pain: "Uncertainty around niggles, mobility and taping.",
      response: "Screen • prepare • educate",
      color: C.blue,
    },
    {
      label: "DURING",
      title: "Supported in the moment",
      pain: "Acute discomfort and fast decisions under pressure.",
      response: "Assess • support • coordinate",
      color: C.teal,
    },
    {
      label: "AFTER",
      title: "Recover with purpose",
      pain: "Fatigue, stiffness and unanswered recovery questions.",
      response: "Reset • mobilise • guide",
      color: C.orange,
    },
  ];
  moments.forEach((m, i) => {
    const x = 0.62 + i * 4.18;
    addCard(slide, x, 2.24, 3.72, 3.96, { line: "D6E3EA", shadow: false });
    slide.addShape(pptx.ShapeType.rect, { x, y: 2.24, w: 3.72, h: 0.12, fill: { color: m.color }, line: noLine });
    addPill(slide, m.label, x + 0.28, 2.61, 1.06, { fill: i === 2 ? "FFF1DC" : i === 1 ? C.tealLight : C.blueLight, color: m.color });
    addText(slide, m.title, x + 0.28, 3.14, 3.12, 0.54, { fontSize: 19, bold: true, color: C.navy, breakLine: true });
    addText(slide, m.pain, x + 0.28, 3.92, 3.12, 0.76, { fontSize: 11.5, color: C.slate, breakLine: true });
    slide.addShape(pptx.ShapeType.line, { x: x + 0.28, y: 4.94, w: 3.12, h: 0, line: { color: C.line, width: 0.8 } });
    addText(slide, "OUR ROLE", x + 0.28, 5.18, 1.2, 0.18, { fontSize: 8.5, bold: true, color: m.color, charSpacing: 1.4 });
    addText(slide, m.response, x + 0.28, 5.5, 3.12, 0.28, { fontSize: 12.5, bold: true, color: C.ink });
  });
  addText(slide, "One joined-up care journey—from pre-event preparation to finish-line recovery.", 0.62, 6.48, 12.05, 0.35, {
    fontSize: 13,
    bold: true,
    color: C.navy,
    align: "center",
  });
}

// 4 — Services
{
  const slide = pptx.addSlide("GYP_LIGHT");
  addSectionTitle(
    slide,
    "Event-day physio staffing",
    "We provide qualified physios for your event.",
    "Our on-ground team helps prepare athletes, respond to injuries and coordinate care—so the event keeps moving.",
  );

  const groups = [
    {
      title: "ASSESS & PROTECT",
      color: C.blue,
      items: ["Sports physiotherapy", "Injury assessment & management", "Kinesiology & sports taping"],
    },
    {
      title: "TREAT & RECOVER",
      color: C.teal,
      items: ["Dry needling", "Cupping therapy", "Mobility & recovery sessions"],
    },
    {
      title: "COORDINATE & GUIDE",
      color: C.orange,
      items: ["Event medical coordination", "Return, modify or refer decisions", "Recovery advice & next steps"],
    },
  ];
  groups.forEach((g, i) => {
    const x = 0.62 + i * 3.1;
    addCard(slide, x, 2.09, 2.84, 4.55, { shadow: false });
    slide.addShape(pptx.ShapeType.ellipse, { x: x + 0.26, y: 2.43, w: 0.46, h: 0.46, fill: { color: g.color }, line: noLine });
    addText(slide, String(i + 1), x + 0.26, 2.44, 0.46, 0.41, { fontSize: 11, bold: true, color: C.white, align: "center" });
    addText(slide, g.title, x + 0.26, 3.14, 2.32, 0.5, { fontSize: 11.5, bold: true, color: g.color, charSpacing: 0.6, breakLine: true });
    g.items.forEach((item, j) => addCheck(slide, item, x + 0.26, 3.93 + j * 0.72, 2.32, { fontSize: 10.5, color: g.color, h: 0.52 }));
  });

  const teamX = 9.92;
  addCard(slide, teamX, 2.09, 2.84, 4.55, { shadow: false, line: C.navy });
  slide.addImage({ path: ASSETS.taping, x: teamX, y: 2.09, w: 2.84, h: 2.84 });
  slide.addShape(pptx.ShapeType.rect, {
    x: teamX,
    y: 4.93,
    w: 2.84,
    h: 1.71,
    fill: { color: C.navy },
    line: noLine,
  });
  addText(slide, "PHYSIOS FOR\nYOUR EVENT", teamX + 0.22, 5.16, 2.4, 0.54, {
    fontSize: 15,
    bold: true,
    color: C.white,
    breakLine: true,
    align: "center",
  });
  addText(slide, "Staffing scaled to the sport,\nvenue and participant volume.", teamX + 0.25, 5.82, 2.34, 0.48, {
    fontSize: 9.2,
    color: "C8DCEB",
    breakLine: true,
    align: "center",
  });
}

// 5 — Event delivery timeline
{
  const slide = pptx.addSlide("GYP_LIGHT");
  addSectionTitle(slide, "Event support capabilities", "From planning call to post-race reset.", "A modular service that fits alongside the organiser’s operations and medical teams.");
  slide.addShape(pptx.ShapeType.line, { x: 1.15, y: 3.23, w: 10.98, h: 0, line: { color: "B7CBD8", width: 2.2 } });
  const stages = [
    {
      phase: "PRE-EVENT",
      title: "Prepare",
      items: ["Musculoskeletal screening", "Mobility checks", "Taping preparation"],
      color: C.blue,
    },
    {
      phase: "EVENT-DAY",
      title: "Support",
      items: ["Sports taping station", "Acute injury assessment", "Medical-team coordination"],
      color: C.teal,
    },
    {
      phase: "POST-RACE",
      title: "Recover",
      items: ["Athlete recovery zone", "Mobility sessions", "Recovery education"],
      color: C.orange,
    },
  ];
  stages.forEach((s, i) => {
    const x = 0.74 + i * 4.18;
    slide.addShape(pptx.ShapeType.ellipse, {
      x: x + 1.28,
      y: 2.87,
      w: 0.72,
      h: 0.72,
      fill: { color: s.color },
      line: { color: C.white, width: 3 },
      shadow: { ...shadow },
    });
    addText(slide, String(i + 1), x + 1.28, 2.9, 0.72, 0.62, { fontSize: 14, bold: true, color: C.white, align: "center" });
    addText(slide, s.phase, x, 2.17, 3.25, 0.24, { fontSize: 9, bold: true, color: s.color, charSpacing: 1.5, align: "center" });
    addText(slide, s.title, x, 3.85, 3.25, 0.42, { fontSize: 20, bold: true, color: C.navy, align: "center" });
    addCard(slide, x, 4.48, 3.25, 1.72, { shadow: false });
    s.items.forEach((item, j) => addCheck(slide, item, x + 0.24, 4.78 + j * 0.42, 2.78, { fontSize: 10.2, color: s.color, h: 0.3 }));
  });
  addPill(slide, "SCOPE • STAFFING • EQUIPMENT • REPORTING", 4.25, 6.48, 4.83, { fill: C.navy, color: C.white, line: C.navy });
}

// 6 — Recovery zone concept
{
  const slide = pptx.addSlide("GYP_LIGHT");
  addSectionTitle(slide, "The on-ground experience", "A recovery zone athletes can navigate in seconds.", "A clear, professional flow helps participants find the right support while keeping the event moving.");

  addCard(slide, 0.62, 2.13, 8.18, 4.36, { fill: C.white, shadow: false });
  addText(slide, "ILLUSTRATIVE RECOVERY ZONE", 0.98, 2.44, 2.8, 0.24, { fontSize: 9, bold: true, color: C.slate, charSpacing: 1.3 });
  slide.addShape(pptx.ShapeType.line, { x: 2.42, y: 3.6, w: 4.54, h: 0, line: { color: C.line, width: 5, beginArrowType: "none", endArrowType: "triangle" } });

  const zones = [
    { x: 1.04, y: 3.15, w: 1.5, h: 1.28, label: "WELCOME\n& CHECK-IN", color: C.blue, n: "01" },
    { x: 3.01, y: 3.15, w: 1.5, h: 1.28, label: "SCREENING\n& TRIAGE", color: C.teal, n: "02" },
    { x: 4.98, y: 3.15, w: 1.5, h: 1.28, label: "TAPING /\nTREATMENT", color: C.navy2, n: "03" },
    { x: 6.95, y: 3.15, w: 1.5, h: 1.28, label: "MOBILITY\n& RECOVERY", color: C.orange, n: "04" },
  ];
  zones.forEach((z) => {
    slide.addShape(pptx.ShapeType.roundRect, {
      x: z.x,
      y: z.y,
      w: z.w,
      h: z.h,
      rectRadius: 0.06,
      fill: { color: z.color },
      line: { color: z.color },
      shadow: { ...shadow },
    });
    addText(slide, z.n, z.x + 0.13, z.y + 0.1, 0.42, 0.22, { fontSize: 8.5, bold: true, color: "DDECF5" });
    addText(slide, z.label, z.x + 0.13, z.y + 0.5, z.w - 0.26, 0.54, { fontSize: 10.5, bold: true, color: C.white, align: "center", breakLine: true });
  });
  addText(slide, "Escalation / referral → event medical team", 2.98, 4.91, 3.55, 0.24, { fontSize: 9.5, bold: true, color: C.red, align: "center" });
  slide.addShape(pptx.ShapeType.line, { x: 4.75, y: 4.5, w: 0, h: 0.38, line: { color: C.red, width: 1.6, endArrowType: "triangle" } });
  addText(slide, "Signage-ready", 1.04, 5.63, 1.65, 0.25, { fontSize: 10.5, bold: true, color: C.navy });
  addText(slide, "Clear zones and participant flow", 1.04, 5.96, 2.1, 0.23, { fontSize: 9.5, color: C.slate });
  addText(slide, "Brand-friendly", 3.55, 5.63, 1.65, 0.25, { fontSize: 10.5, bold: true, color: C.navy });
  addText(slide, "Space for organiser / sponsor visibility", 3.55, 5.96, 2.38, 0.23, { fontSize: 9.5, color: C.slate });
  addText(slide, "Operationally aligned", 6.22, 5.63, 1.85, 0.25, { fontSize: 10.5, bold: true, color: C.navy });
  addText(slide, "Coordinated with event teams", 6.22, 5.96, 2.1, 0.23, { fontSize: 9.5, color: C.slate });

  addImageWithOverlay(slide, ASSETS.mobility, 9.19, 2.13, 3.56, 4.36, 8);
  slide.addShape(pptx.ShapeType.roundRect, {
    x: 9.52,
    y: 5.44,
    w: 2.9,
    h: 0.72,
    rectRadius: 0.05,
    fill: { color: C.navy, transparency: 6 },
    line: noLine,
  });
  addText(slide, "Designed around athlete flow,\nnot just a treatment table.", 9.74, 5.55, 2.46, 0.43, {
    fontSize: 10.8,
    bold: true,
    color: C.white,
    align: "center",
    breakLine: true,
  });
}

// 7 — Athlete support pathway
{
  const slide = pptx.addSlide("GYP_LIGHT");
  addSectionTitle(slide, "Athlete support pathway", "Fast decisions. Clear next steps.", "Every interaction follows a simple care pathway—with escalation aligned to the event medical plan.");
  const steps = [
    { title: "Listen", copy: "Quick history and event context", color: C.blue },
    { title: "Assess", copy: "Movement, symptoms and red flags", color: C.teal },
    { title: "Act", copy: "Taping, mobility or recovery support", color: C.navy2 },
    { title: "Guide", copy: "Return, modify, recover or refer", color: C.orange },
  ];
  steps.forEach((s, i) => {
    const x = 0.7 + i * 3.13;
    addCard(slide, x, 2.38, 2.54, 2.38, { shadow: false });
    slide.addShape(pptx.ShapeType.ellipse, { x: x + 0.86, y: 2.02, w: 0.82, h: 0.82, fill: { color: s.color }, line: { color: C.white, width: 3 }, shadow: { ...shadow } });
    addText(slide, String(i + 1), x + 0.86, 2.06, 0.82, 0.7, { fontSize: 16, bold: true, color: C.white, align: "center" });
    addText(slide, s.title, x + 0.2, 3.15, 2.14, 0.4, { fontSize: 18, bold: true, color: C.navy, align: "center" });
    addText(slide, s.copy, x + 0.25, 3.72, 2.04, 0.6, { fontSize: 10.8, color: C.slate, align: "center", breakLine: true });
    if (i < 3) {
      slide.addShape(pptx.ShapeType.line, {
        x: x + 2.62,
        y: 3.58,
        w: 0.37,
        h: 0,
        line: { color: C.teal, width: 2, endArrowType: "triangle" },
      });
    }
  });
  addCard(slide, 0.7, 5.17, 12.0, 1.2, { fill: C.navy, line: C.navy, shadow: false });
  addText(slide, "SAFETY FIRST", 1.04, 5.45, 1.55, 0.23, { fontSize: 9, bold: true, color: C.teal, charSpacing: 1.5 });
  addText(slide, "Red flags, emergencies and cases outside physiotherapy scope are escalated to the event medical team.", 2.72, 5.37, 8.98, 0.45, {
    fontSize: 13.5,
    bold: true,
    color: C.white,
    breakLine: true,
  });
  addText(slide, "Exact protocols are agreed with the organiser before event day.", 2.72, 5.87, 7.15, 0.22, { fontSize: 9.5, color: "C2D6E5" });
}

// 8 — Partnership value
{
  const slide = pptx.addSlide("GYP_LIGHT");
  addSectionTitle(slide, "Why partner with us", "Value for athletes. Confidence for organisers.", "We combine professional care delivery with an experience designed to complement the event brand.");
  const columns = [
    {
      title: "FOR ATHLETES",
      color: C.teal,
      big: "Feel looked after",
      items: ["Fast access to qualified support", "Practical recovery guidance", "Education to reduce future injury risk"],
    },
    {
      title: "FOR ORGANISERS",
      color: C.blue,
      big: "Run a stronger event",
      items: ["Defined physiotherapy support pathway", "Coordination with medical operations", "Professional recovery-zone management"],
    },
    {
      title: "FOR PARTNERS",
      color: C.orange,
      big: "Create visible impact",
      items: ["Useful participant touchpoint", "Brand-friendly zone design", "A wellbeing story athletes can feel"],
    },
  ];
  columns.forEach((c, i) => {
    const x = 0.62 + i * 4.18;
    addCard(slide, x, 2.2, 3.72, 4.2, { shadow: false });
    slide.addShape(pptx.ShapeType.rect, { x, y: 2.2, w: 3.72, h: 0.11, fill: { color: c.color }, line: noLine });
    addText(slide, c.title, x + 0.28, 2.62, 3.14, 0.22, { fontSize: 9, bold: true, color: c.color, charSpacing: 1.5 });
    addText(slide, c.big, x + 0.28, 3.07, 3.14, 0.74, { fontSize: 20, bold: true, color: C.navy, breakLine: true });
    c.items.forEach((item, j) => addCheck(slide, item, x + 0.28, 4.14 + j * 0.55, 3.08, { fontSize: 10.6, color: c.color, h: 0.4 }));
  });
  addText(slide, "The result: a more complete participant experience—from preparation to recovery.", 0.62, 6.6, 12.08, 0.28, {
    fontSize: 12.5,
    bold: true,
    color: C.navy,
    align: "center",
  });
}

// 9 — Operating model
{
  const slide = pptx.addSlide("GYP_LIGHT");
  addSectionTitle(slide, "How we work", "Ready to plug into your event plan.", "A professional, adaptable delivery model built around clear responsibilities and athlete communication.");
  addImageWithOverlay(slide, ASSETS.manual, 0.62, 2.14, 4.5, 4.45, 6);
  const principles = [
    ["Qualified care", "Sports physiotherapy expertise at the point of need."],
    ["Evidence-informed", "Structured assessment and treatment protocols."],
    ["Fast on-site support", "Focused interactions designed for event conditions."],
    ["Team coordination", "Clear hand-offs with organiser and medical teams."],
    ["Athlete education", "Simple guidance participants can act on."],
    ["Adaptable setup", "Scope scaled to format, venue and participant needs."],
  ];
  principles.forEach((p, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const x = 5.52 + col * 3.56;
    const y = 2.14 + row * 1.36;
    addCard(slide, x, y, 3.18, 1.08, { shadow: false });
    slide.addShape(pptx.ShapeType.rect, { x, y, w: 0.09, h: 1.08, fill: { color: i % 3 === 0 ? C.teal : i % 3 === 1 ? C.blue : C.orange }, line: noLine });
    addText(slide, p[0], x + 0.28, y + 0.17, 2.62, 0.27, { fontSize: 13.2, bold: true, color: C.navy });
    addText(slide, p[1], x + 0.28, y + 0.5, 2.62, 0.4, { fontSize: 9.5, color: C.slate, breakLine: true });
  });
  addPill(slide, "FINAL SCOPE AGREED PER EVENT", 7.03, 6.28, 3.8, { fill: C.navy, color: C.white, line: C.navy });
}

// 10 — Event formats
{
  const slide = pptx.addSlide("GYP_LIGHT");
  addSectionTitle(slide, "Scalable event coverage", "Coverage built around your event.", "The service model can be configured for the sport, venue, participant volume, schedule and existing medical setup.");
  addImageWithOverlay(slide, ASSETS.movement, 0.62, 2.15, 6.18, 4.43, 5);
  slide.addShape(pptx.ShapeType.roundRect, {
    x: 0.93,
    y: 5.55,
    w: 5.56,
    h: 0.7,
    rectRadius: 0.05,
    fill: { color: C.navy, transparency: 5 },
    line: noLine,
  });
  addText(slide, "EVENT-READY COVERAGE  •  TEAM  •  STATIONS  •  FLOW", 1.2, 5.67, 5.0, 0.27, {
    fontSize: 10.5,
    bold: true,
    color: C.white,
    charSpacing: 0.6,
    align: "center",
  });

  const eventFormats = [
    ["RACES & MARATHONS", "Start-line preparation, route-side coordination and finish-zone recovery."],
    ["TOURNAMENTS & LEAGUES", "Match-day assessment, taping and support across multiple fixtures."],
    ["FITNESS COMPETITIONS", "Movement checks, acute injury support and recovery between heats."],
    ["SPORTS DAYS & COMMUNITY EVENTS", "Visible, approachable physiotherapy support for mixed participant groups."],
  ];
  eventFormats.forEach((item, i) => {
    const y = 2.15 + i * 1.03;
    addText(slide, item[0], 7.26, y + 0.02, 2.3, 0.22, { fontSize: 9, bold: true, color: i % 2 === 0 ? C.teal : C.blue, charSpacing: 1.1 });
    addText(slide, item[1], 7.26, y + 0.33, 5.16, 0.48, { fontSize: 11.2, color: C.ink, breakLine: true });
    if (i < 3) slide.addShape(pptx.ShapeType.line, { x: 7.26, y: y + 0.91, w: 5.12, h: 0, line: { color: C.line, width: 0.8 } });
  });
}

// 11 — Founder + mission
{
  const slide = pptx.addSlide();
  slide.background = { color: C.navy };
  addImageWithOverlay(slide, ASSETS.sportsReturn, 7.76, 0, 5.57, 7.5, 28);
  slide.addShape(pptx.ShapeType.rect, { x: 7.47, y: 0, w: 0.3, h: 7.5, fill: { color: C.teal }, line: noLine });
  addPill(slide, "ILLUSTRATIVE SERVICE VISUAL", 10.03, 0.48, 2.52, { fill: C.navy, color: C.white, line: C.navy });
  addText(slide, "FOUNDER", 0.7, 0.67, 2.2, 0.25, { fontSize: 9.5, bold: true, color: C.teal, charSpacing: 2 });
  addText(slide, "Dr. Kandarp\nSharma (PT)", 0.7, 1.08, 5.55, 1.38, {
    fontFace: "Aptos Display",
    fontSize: 31,
    bold: true,
    color: C.white,
    breakLine: true,
  });
  addText(slide, "Sports Physiotherapist\nFounder — GetYourPhysio.in", 0.73, 2.63, 4.8, 0.66, {
    fontSize: 15,
    bold: true,
    color: "C8DCEB",
    breakLine: true,
  });
  slide.addShape(pptx.ShapeType.line, { x: 0.73, y: 3.65, w: 1.28, h: 0, line: { color: C.teal, width: 3 } });
  addText(slide, "PARTNERSHIP VISION", 0.73, 4.03, 2.55, 0.22, { fontSize: 9, bold: true, color: C.teal, charSpacing: 1.5 });
  addText(
    slide,
    "Support every athlete with professional physiotherapy and recovery services that enhance performance, reduce injury risk and improve the overall event experience.",
    0.73,
    4.45,
    5.92,
    1.52,
    { fontSize: 19, bold: true, color: C.white, breakLine: true },
  );
  addText(slide, "Evidence-informed care • Athlete education • Confident recovery", 0.73, 6.47, 5.93, 0.28, {
    fontSize: 9.5,
    bold: true,
    color: "A8C1D5",
    charSpacing: 0.8,
  });
}

// 12 — Contact / CTA
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
  addTightLogo(slide, 10.05, 0.8, 1.82);
  addPill(slide, "LET’S PARTNER", 0.72, 0.78, 1.78, { fill: C.teal, color: C.white, line: C.teal });
  addText(slide, "Let’s make recovery\npart of the event experience.", 0.72, 1.43, 8.34, 1.54, {
    fontFace: "Aptos Display",
    fontSize: 31,
    bold: true,
    color: C.navy,
    breakLine: true,
  });
  addText(slide, "Tell us about your sport, venue, participant profile and event-day goals.\nWe’ll shape a physiotherapy support plan around them.", 0.74, 3.28, 7.55, 0.82, {
    fontSize: 14,
    color: C.slate,
    breakLine: true,
  });
  addCard(slide, 0.72, 4.55, 11.86, 1.52, { fill: C.navy, line: C.navy, shadow: false });
  const contacts = [
    ["CALL", "+91 99193 87585"],
    ["EMAIL", "getyourphysio.in@gmail.com"],
    ["WEB", "www.getyourphysio.in"],
  ];
  contacts.forEach((c, i) => {
    const x = 1.06 + i * 3.82;
    addText(slide, c[0], x, 4.88, 1.1, 0.18, { fontSize: 8.5, bold: true, color: C.teal, charSpacing: 1.5 });
    addText(slide, c[1], x, 5.25, 3.4, 0.31, { fontSize: i === 1 ? 11.2 : 12.5, bold: true, color: C.white });
    if (i < 2) slide.addShape(pptx.ShapeType.line, { x: x + 3.47, y: 4.88, w: 0, h: 0.84, line: { color: "36536E", width: 0.8 } });
  });
  addText(slide, "GetYourPhysio.in  •  Gurugram", 0.74, 6.7, 3.7, 0.25, { fontSize: 9.5, bold: true, color: C.navy, charSpacing: 0.7 });
  addText(slide, "ATHLETE CARE. EVENT READY.", 8.65, 6.7, 3.9, 0.25, { fontSize: 9.5, bold: true, color: C.tealDark, charSpacing: 1.5, align: "right" });
}

const slideLimit = Number.parseInt(process.env.DECK_SLIDE_LIMIT ?? "", 10);
if (Number.isInteger(slideLimit) && slideLimit > 0) {
  pptx._slides = pptx._slides.slice(0, slideLimit);
}
const finalOut = process.env.DECK_TEST_OUT ? path.resolve(ROOT, process.env.DECK_TEST_OUT) : OUT;
fs.mkdirSync(path.dirname(finalOut), { recursive: true });
await pptx.writeFile({ fileName: finalOut });
console.log(`Created ${finalOut}`);
