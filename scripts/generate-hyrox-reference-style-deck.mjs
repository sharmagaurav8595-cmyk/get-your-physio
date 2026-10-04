import path from "node:path";
import { fileURLToPath } from "node:url";
import pptxgen from "pptxgenjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const OUT = path.join(ROOT, "docs", "GetYourPhysio_HYROX_Mumbai_Recovery_Proposal.pptx");

const A = {
  logo: path.join(ROOT, "src", "assets", "logoNew2.jpg"),
  shield: path.join(ROOT, "src", "assets", "myphysio-shield-logo.png"),
  recoveryZone: path.join(ROOT, "src", "assets", "generated", "event-recovery-zone-team.png"),
  assessment: path.join(ROOT, "src", "assets", "generated", "event-race-injury-assessment.png"),
  taping: path.join(ROOT, "src", "assets", "generated", "event-pre-race-taping.png"),
  temp2: path.join(ROOT, "src", "assets", "temp2.jpg"),
};

const C = {
  teal: "087F7B",
  teal2: "0A9892",
  tealLight: "E7F2F1",
  tealPale: "F2F8F7",
  black: "090D0F",
  charcoal: "171C1F",
  white: "FFFFFF",
  paper: "F7F8F7",
  ink: "111719",
  muted: "536064",
  line: "C9D2D2",
  yellow: "F1DC37",
  orange: "EFA235",
};

const pptx = new pptxgen();
pptx.layout = "LAYOUT_WIDE";
pptx.author = "GetYourPhysio.in";
pptx.company = "GetYourPhysio.in";
pptx.title = "GetYourPhysio.in × HYROX Mumbai — Proposed Recovery Zone Plan";
pptx.subject = "Physiotherapy & Athlete Recovery Deployment Proposal";
pptx.lang = "en-IN";
pptx.theme = {
  headFontFace: "Bahnschrift SemiCondensed",
  bodyFontFace: "Aptos",
  lang: "en-IN",
};

function shape(slide, type, x, y, w, h, options = {}) {
  slide.addShape(type, {
    x, y, w, h,
    fill: options.fill ? { color: options.fill, transparency: options.transparency ?? 0 } : { color: C.white, transparency: 100 },
    line: options.line === false ? { color: C.white, transparency: 100 } : { color: options.line ?? C.line, width: options.lineWidth ?? 0.7 },
    rotate: options.rotate,
    radius: options.radius,
  });
}

function text(slide, value, x, y, w, h, options = {}) {
  slide.addText(value, {
    x, y, w, h,
    fontFace: options.fontFace ?? "Aptos",
    fontSize: options.fontSize ?? 13,
    color: options.color ?? C.ink,
    bold: options.bold ?? false,
    italic: options.italic ?? false,
    align: options.align ?? "left",
    valign: options.valign ?? "mid",
    margin: options.margin ?? 0,
    breakLine: options.breakLine ?? false,
    fit: "shrink",
    charSpacing: options.charSpacing,
    fill: options.fill ? { color: options.fill, transparency: options.transparency ?? 0 } : undefined,
    line: options.line ? { color: options.line, width: options.lineWidth ?? 0.7 } : undefined,
    isTextBox: true,
  });
}

function cropRegion(imagePath, imageWidth, imageHeight, x, y, w, h, region) {
  const sx = w / region.w;
  const sy = h / region.h;
  return {
    path: imagePath,
    x,
    y,
    w: imageWidth * sx,
    h: imageHeight * sy,
    sizing: { type: "crop", x: region.x * sx, y: region.y * sy, w, h },
  };
}

function header(slide, section, page) {
  shape(slide, pptx.ShapeType.rect, 0, 0, 13.333, 0.05, { fill: C.teal, line: false });

  shape(slide, pptx.ShapeType.roundRect, 0.28, 0.14, 1.72, 1.28, { fill: C.white, line: C.line, lineWidth: 0.7 });
  if (page !== 2) {
    slide.addImage({ path: A.logo, x: 0.58, y: 0.19, w: 1.12, h: 1.12 });
    text(slide, "Healing at your doorstep.", 0.40, 1.20, 1.48, 0.14, { fontSize: 6.6, color: C.muted, align: "center" });
  }
  shape(slide, pptx.ShapeType.line, 2.23, 0.18, 0, 1.20, { line: "697275", lineWidth: 0.8 });

  slide.addText([
    { text: "GETYOURPHYSIO.IN", options: { color: C.teal, bold: true } },
    { text: "  ×  ", options: { color: C.black, bold: true } },
    { text: "HYROX MUMBAI", options: { color: C.black, bold: true } },
  ], {
    x: 2.58, y: 0.23, w: 7.95, h: 0.48,
    fontFace: "Bahnschrift SemiCondensed", fontSize: 24.5, margin: 0,
    align: "center", valign: "mid", fit: "shrink",
  });
  text(slide, "PHYSIOTHERAPY & ATHLETE RECOVERY", 3.42, 0.73, 6.30, 0.25, {
    fontFace: "Bahnschrift SemiCondensed", fontSize: 13.2, bold: true, color: C.black, align: "center", charSpacing: 0.6,
  });

  shape(slide, pptx.ShapeType.parallelogram, 3.75, 1.06, 5.92, 0.38, { fill: C.teal, line: false });
  text(slide, section.toUpperCase(), 4.03, 1.07, 5.35, 0.34, {
    fontFace: "Bahnschrift SemiCondensed", fontSize: 16.3, bold: true, color: C.white, align: "center", charSpacing: 0.5,
  });

  shape(slide, pptx.ShapeType.rect, 10.72, 0, 2.613, 1.56, { fill: C.black, line: false });
  shape(slide, pptx.ShapeType.triangle, 10.22, 0, 0.58, 1.56, { fill: C.black, line: false, rotate: 270 });
  shape(slide, pptx.ShapeType.triangle, 12.76, 0, 0.57, 0.78, { fill: C.teal, line: false, rotate: 180 });
  text(slide, String(page).padStart(2, "0"), 12.82, 0.12, 0.38, 0.27, {
    fontFace: "Bahnschrift SemiCondensed", fontSize: 15, bold: true, color: C.white, align: "center",
  });
  if (page !== 2) {
    text(slide, "H Y R O X", 10.92, 0.26, 1.86, 0.26, {
      fontFace: "Aptos", fontSize: 13.2, bold: true, color: C.white, align: "center", charSpacing: 4.1,
    });
    shape(slide, pptx.ShapeType.line, 11.10, 0.60, 1.48, 0, { line: C.yellow, lineWidth: 1.1 });
    text(slide, "M U M B A I", 10.97, 0.66, 1.76, 0.22, {
      fontFace: "Aptos", fontSize: 10.4, bold: true, color: C.yellow, align: "center", charSpacing: 2.0,
    });
    text(slide, "17–20 SEPT 2026\nNESCO CENTRE", 10.86, 0.95, 2.00, 0.46, {
      fontFace: "Bahnschrift SemiCondensed", fontSize: 10.2, bold: true, color: C.white, align: "center", breakLine: true,
    });
  }
  text(slide, "PROPOSED", 9.90, 0.14, 0.68, 0.18, {
    fontFace: "Bahnschrift SemiCondensed", fontSize: 7.0, bold: true, color: C.teal, align: "center", charSpacing: 1.1,
  });
}

function checkBullet(slide, x, y, boldLead, tail, w = 4.55) {
  shape(slide, pptx.ShapeType.ellipse, x, y + 0.04, 0.25, 0.25, { fill: C.teal, line: false });
  text(slide, "✓", x, y + 0.02, 0.25, 0.26, { fontSize: 10.8, bold: true, color: C.white, align: "center" });
  slide.addText([
    { text: boldLead, options: { bold: true, color: C.black } },
    { text: tail, options: { bold: false, color: C.ink } },
  ], {
    x: x + 0.42, y, w, h: 0.46, fontFace: "Aptos", fontSize: 11.5,
    margin: 0, valign: "top", breakLine: true, fit: "shrink",
  });
}

function tableRow(slide, y, role, deployment, accent = false) {
  shape(slide, pptx.ShapeType.rect, 6.15, y, 6.57, 0.64, { fill: accent ? "064B49" : "F1F3F2", line: "758083", lineWidth: 0.45 });
  shape(slide, pptx.ShapeType.line, 10.85, y, 0, 0.64, { line: accent ? "759B99" : "758083", lineWidth: 0.45 });
  text(slide, role, 6.45, y + 0.07, 4.00, 0.48, {
    fontFace: "Bahnschrift SemiCondensed", fontSize: accent ? 14.0 : 12.2, bold: true, color: accent ? C.white : C.black,
  });
  text(slide, deployment, 10.94, y + 0.05, 1.55, 0.50, {
    fontFace: "Bahnschrift SemiCondensed", fontSize: accent ? 18 : 17, bold: true, color: accent ? C.white : C.black, align: "center",
  });
}

function badge(slide, x, y, code, label) {
  shape(slide, pptx.ShapeType.ellipse, x + 0.34, y, 0.46, 0.46, { fill: C.teal, line: false });
  text(slide, code, x + 0.34, y + 0.01, 0.46, 0.43, {
    fontFace: "Bahnschrift SemiCondensed", fontSize: 9.3, bold: true, color: C.white, align: "center",
  });
  text(slide, label, x, y + 0.52, 1.14, 0.44, {
    fontFace: "Bahnschrift SemiCondensed", fontSize: 9.6, bold: true, color: C.white, align: "center", breakLine: true,
  });
}

function flowNode(slide, x, code, titleValue, subtitle) {
  shape(slide, pptx.ShapeType.ellipse, x + 0.72, 1.78, 0.43, 0.43, { fill: C.teal, line: false });
  text(slide, code, x + 0.72, 1.79, 0.43, 0.41, {
    fontFace: "Bahnschrift SemiCondensed", fontSize: 10, bold: true, color: C.white, align: "center",
  });
  text(slide, titleValue, x + 0.10, 2.24, 1.68, 0.24, {
    fontFace: "Bahnschrift SemiCondensed", fontSize: 9.7, bold: true, color: C.teal, align: "center",
  });
  text(slide, subtitle, x + 0.08, 2.48, 1.72, 0.30, {
    fontSize: 7.8, color: C.black, align: "center", breakLine: true,
  });
}

function serviceSection(slide, y, code, heading, bullets) {
  shape(slide, pptx.ShapeType.ellipse, 0.52, y + 0.10, 0.54, 0.54, { fill: C.teal, line: false });
  text(slide, code, 0.52, y + 0.11, 0.54, 0.51, {
    fontFace: "Bahnschrift SemiCondensed", fontSize: 10.5, bold: true, color: C.white, align: "center",
  });
  text(slide, heading, 1.24, y + 0.01, 2.90, 0.25, {
    fontFace: "Bahnschrift SemiCondensed", fontSize: 10.8, bold: true, color: C.teal,
  });
  bullets.forEach((item, i) => {
    text(slide, `•  ${item}`, 1.24, y + 0.29 + i * 0.19, 2.92, 0.19, {
      fontSize: 8.2, color: C.black,
    });
  });
}

function equipmentTile(slide, x, y, code, label) {
  shape(slide, pptx.ShapeType.roundRect, x, y, 1.08, 0.87, { fill: C.white, line: "D0D7D6", lineWidth: 0.45 });
  shape(slide, pptx.ShapeType.roundRect, x + 0.34, y + 0.09, 0.40, 0.32, { fill: C.tealLight, line: C.teal, lineWidth: 0.7 });
  text(slide, code, x + 0.34, y + 0.10, 0.40, 0.30, {
    fontFace: "Bahnschrift SemiCondensed", fontSize: code.length > 3 ? 7.2 : 8.6, bold: true, color: C.teal, align: "center",
  });
  text(slide, label, x + 0.07, y + 0.47, 0.94, 0.32, {
    fontFace: "Bahnschrift SemiCondensed", fontSize: 7.4, bold: true, color: C.black, align: "center", breakLine: true,
  });
}

function stageCard(slide, x, accent, num, titleValue, bullets) {
  shape(slide, pptx.ShapeType.roundRect, x, 2.02, 2.94, 4.17, { fill: C.white, line: "BAC5C4", lineWidth: 0.65 });
  shape(slide, pptx.ShapeType.rect, x, 2.02, 2.94, 0.12, { fill: accent, line: false });
  shape(slide, pptx.ShapeType.ellipse, x + 0.18, 2.28, 0.61, 0.61, { fill: accent, line: false });
  text(slide, num, x + 0.18, 2.29, 0.61, 0.58, {
    fontFace: "Bahnschrift SemiCondensed", fontSize: 15, bold: true, color: C.white, align: "center",
  });
  text(slide, "STAGE", x + 0.98, 2.26, 0.72, 0.19, {
    fontFace: "Bahnschrift SemiCondensed", fontSize: 7.4, bold: true, color: accent, charSpacing: 1.2,
  });
  text(slide, titleValue, x + 0.98, 2.47, 1.86, 0.45, {
    fontFace: "Bahnschrift SemiCondensed", fontSize: 14.2, bold: true, color: C.black, breakLine: true,
  });
  shape(slide, pptx.ShapeType.line, x + 0.20, 3.08, 2.50, 0, { line: C.line, lineWidth: 0.6 });
  bullets.forEach((item, index) => {
    shape(slide, pptx.ShapeType.ellipse, x + 0.24, 3.38 + index * 0.39, 0.07, 0.07, { fill: accent, line: false });
    text(slide, item, x + 0.43, 3.28 + index * 0.39, 2.17, 0.29, {
      fontSize: 8.9, color: C.ink, breakLine: true,
    });
  });
}

// Slide 1 — deployment plan
{
  const slide = pptx.addSlide();
  slide.background = { color: C.paper };
  slide.addImage({ path: A.recoveryZone, x: 0, y: 0, w: 13.333, h: 7.5 });
  shape(slide, pptx.ShapeType.rect, 0, 0, 13.333, 7.5, { fill: C.white, transparency: 8, line: false });
  header(slide, "Deployment Plan", 1);

  text(slide, "PROPOSED TEAM", 0.62, 1.82, 4.85, 0.32, {
    fontFace: "Bahnschrift SemiCondensed", fontSize: 16.2, bold: true, color: C.teal,
  });
  checkBullet(slide, 0.67, 2.26, "10–14 Sports Physiotherapists", " deployed across the event");
  checkBullet(slide, 0.67, 2.91, "2 Senior Physiotherapy Leads", " for clinical supervision & coordination");
  checkBullet(slide, 0.67, 3.56, "Dedicated Operations Coordinator", " for smooth execution");
  checkBullet(slide, 0.67, 4.21, "Deployment across active shifts", " and operating hours");
  checkBullet(slide, 0.67, 4.86, "Uniformed, professional and athlete-focused", " recovery team");

  shape(slide, pptx.ShapeType.roundRect, 6.15, 1.78, 6.57, 0.48, { fill: C.teal, line: false });
  text(slide, "TEAM COMPOSITION & DEPLOYMENT", 6.35, 1.82, 6.15, 0.36, {
    fontFace: "Bahnschrift SemiCondensed", fontSize: 15, bold: true, color: C.white, align: "center",
  });
  shape(slide, pptx.ShapeType.rect, 6.15, 2.25, 6.57, 0.42, { fill: C.black, line: "758083", lineWidth: 0.45 });
  shape(slide, pptx.ShapeType.line, 10.85, 2.25, 0, 0.42, { line: "758083", lineWidth: 0.45 });
  text(slide, "ROLE", 6.36, 2.28, 4.20, 0.30, { fontFace: "Bahnschrift SemiCondensed", fontSize: 12.6, bold: true, color: C.white, align: "center" });
  text(slide, "DEPLOYMENT", 10.98, 2.28, 1.49, 0.30, { fontFace: "Bahnschrift SemiCondensed", fontSize: 12.6, bold: true, color: C.white, align: "center" });
  tableRow(slide, 2.67, "Senior Physiotherapy Leads", "2");
  tableRow(slide, 3.31, "Sports Physiotherapists", "10–14");
  tableRow(slide, 3.95, "Event Operations Coordinator", "1");
  tableRow(slide, 4.59, "TOTAL PROPOSED TEAM", "13–17", true);
  text(slide, "* Final strength aligned with athlete footfall, recovery-zone capacity and operating hours.", 6.30, 5.26, 6.10, 0.24, {
    fontSize: 8.4, italic: true, color: C.black,
  });

  shape(slide, pptx.ShapeType.roundRect, 0.58, 5.63, 12.17, 1.36, { fill: C.black, line: false });
  text(slide, "EVENT EXPERIENCE", 4.95, 5.74, 3.42, 0.24, {
    fontFace: "Bahnschrift SemiCondensed", fontSize: 13.6, bold: true, color: C.teal, align: "center",
  });
  badge(slide, 0.84, 6.02, "FF", "Functional\nFitness");
  badge(slide, 3.10, 6.02, "MR", "Marathons &\nEndurance");
  badge(slide, 5.36, 6.02, "RZ", "Athlete\nRecovery Zones");
  badge(slide, 7.62, 6.02, "SP", "Sports\nPhysiotherapy");
  badge(slide, 9.88, 6.02, "OP", "Organised Team\nProven Execution");
  text(slide, "Structured deployment for efficient athlete flow, clinical supervision and seamless event coordination.", 0.78, 7.14, 11.78, 0.18, {
    fontFace: "Bahnschrift SemiCondensed", fontSize: 8.7, bold: true, color: C.teal, align: "center",
  });
}

// Slide 2 — recovery experience and equipment
{
  const slide = pptx.addSlide();
  slide.background = { color: C.paper };
  header(slide, "Athlete Recovery Experience", 2);

  shape(slide, pptx.ShapeType.roundRect, 0.36, 1.65, 12.61, 1.18, { fill: C.white, line: "9CA8A8", lineWidth: 0.55 });
  const flowX = [0.46, 2.96, 5.46, 7.96, 10.46];
  flowNode(slide, flowX[0], "1", "ARRIVAL", "Athlete check-in\n& guidance");
  flowNode(slide, flowX[1], "2", "QUICK ASSESSMENT", "Rapid screening &\nneeds assessment");
  flowNode(slide, flowX[2], "3", "RECOVERY", "Targeted recovery\ninterventions");
  flowNode(slide, flowX[3], "4", "REASSESSMENT", "Post-treatment review\n& guidance");
  flowNode(slide, flowX[4], "5", "EXIT / REFERRAL", "Safe exit or escalation\nwhen required");
  [2.42, 4.92, 7.42, 9.92].forEach((x) => {
    text(slide, "→", x, 1.89, 0.36, 0.32, { fontSize: 20, color: C.teal, bold: true, align: "center" });
  });

  shape(slide, pptx.ShapeType.roundRect, 0.35, 2.96, 4.18, 3.38, { fill: C.white, line: C.line, lineWidth: 0.55 });
  shape(slide, pptx.ShapeType.rect, 0.35, 2.96, 4.18, 0.34, { fill: C.teal, line: false });
  text(slide, "SERVICES WE PROVIDE", 0.53, 2.98, 3.82, 0.29, {
    fontFace: "Bahnschrift SemiCondensed", fontSize: 12.2, bold: true, color: C.white, align: "center",
  });
  serviceSection(slide, 3.37, "01", "PRE / POST-RACE SUPPORT", [
    "Rapid screening & mobility assessment",
    "Assisted stretching & dynamic recovery",
    "Mobility guidance",
  ]);
  shape(slide, pptx.ShapeType.line, 0.54, 4.36, 3.72, 0, { line: C.line, lineWidth: 0.5 });
  serviceSection(slide, 4.44, "02", "RECOVERY INTERVENTIONS", [
    "Manual / soft-tissue techniques",
    "Joint and muscle mobility",
    "Cupping / dry needling when indicated",
  ]);
  shape(slide, pptx.ShapeType.line, 0.54, 5.43, 3.72, 0, { line: C.line, lineWidth: 0.5 });
  serviceSection(slide, 5.49, "03", "CLINICAL SUPPORT", [
    "Identify athletes needing medical attention",
    "Appropriate escalation / referral",
    "Hygiene, safety & clear communication",
  ]);

  slide.addImage({ path: A.assessment, x: 4.72, y: 2.96, w: 2.92, h: 1.64 });
  shape(slide, pptx.ShapeType.rect, 4.72, 4.30, 2.92, 0.30, { fill: C.black, transparency: 18, line: false });
  text(slide, "ASSESS • TRIAGE • SUPPORT", 4.85, 4.34, 2.66, 0.18, {
    fontFace: "Bahnschrift SemiCondensed", fontSize: 8.3, bold: true, color: C.white, align: "center",
  });
  slide.addImage({ path: A.taping, x: 4.72, y: 4.70, w: 2.92, h: 1.64 });
  shape(slide, pptx.ShapeType.rect, 4.72, 6.04, 2.92, 0.30, { fill: C.black, transparency: 18, line: false });
  text(slide, "RECOVER • MOBILISE • RETURN", 4.85, 6.08, 2.66, 0.18, {
    fontFace: "Bahnschrift SemiCondensed", fontSize: 8.3, bold: true, color: C.white, align: "center",
  });

  shape(slide, pptx.ShapeType.roundRect, 7.83, 2.96, 5.14, 3.38, { fill: C.white, line: C.line, lineWidth: 0.55 });
  shape(slide, pptx.ShapeType.rect, 7.83, 2.96, 5.14, 0.34, { fill: C.teal, line: false });
  text(slide, "EQUIPMENT & RECOVERY SETUP", 8.05, 2.98, 4.70, 0.29, {
    fontFace: "Bahnschrift SemiCondensed", fontSize: 12.2, bold: true, color: C.white, align: "center",
  });
  const tiles = [
    ["TT", "Treatment\nTables"], ["MG", "Massage\nGuns"], ["CUP", "Cupping\nEquipment"], ["DN", "Dry Needling\nEquipment"],
    ["RB", "Resistance\nBands"], ["MT", "Mobility\nTools"], ["FR", "Foam\nRollers"], ["TB", "Therapy\nBalls"],
    ["H/C", "Hot / Cold\nSupplies"], ["SAN", "Sanitisation\nSupplies"], ["CON", "Clinical\nConsumables"], ["DOC", "Assessment\nMaterial"],
  ];
  tiles.forEach(([code, label], index) => {
    const col = index % 4;
    const row = Math.floor(index / 4);
    equipmentTile(slide, 8.10 + col * 1.18, 3.42 + row * 0.94, code, label);
  });

  shape(slide, pptx.ShapeType.roundRect, 0.36, 6.48, 12.61, 0.74, { fill: C.tealPale, line: C.teal, lineWidth: 0.65 });
  text(slide, "SAFE, EFFICIENT AND PROFESSIONAL ATHLETE SUPPORT — FROM ARRIVAL TO RECOVERY OR REFERRAL.", 0.83, 6.61, 7.18, 0.27, {
    fontFace: "Bahnschrift SemiCondensed", fontSize: 11.3, bold: true, color: C.black,
  });
  [
    [8.30, "SAFE"], [9.40, "PROFESSIONAL"], [10.67, "ATHLETE-FIRST"], [11.91, "EFFICIENT"],
  ].forEach(([x, label]) => {
    shape(slide, pptx.ShapeType.ellipse, x, 6.57, 0.28, 0.28, { fill: C.teal, line: false });
    text(slide, "✓", x, 6.57, 0.28, 0.27, { fontSize: 10, bold: true, color: C.white, align: "center" });
    text(slide, label, x - 0.20, 6.89, 0.70, 0.16, {
      fontFace: "Bahnschrift SemiCondensed", fontSize: 6.9, bold: true, color: C.teal, align: "center",
    });
  });

  // Use an alternate logo asset and re-add the event lockup at the end of the
  // image-heavy slide so PowerPoint keeps these header elements frontmost.
  slide.addImage({ path: A.shield, x: 0.78, y: 0.21, w: 0.70, h: 0.70 });
  slide.addText([
    { text: "Get", options: { color: C.black, bold: true } },
    { text: "Your", options: { color: C.teal, bold: true } },
    { text: "Physio", options: { color: C.black, bold: true } },
    { text: ".in", options: { color: C.teal, bold: true } },
  ], {
    x: 0.48, y: 0.91, w: 1.30, h: 0.22, fontFace: "Aptos", fontSize: 9.4,
    margin: 0, align: "center", valign: "mid", fit: "shrink",
  });
  text(slide, "Healing at your doorstep.", 0.40, 1.20, 1.48, 0.14, { fontSize: 6.6, color: C.muted, align: "center" });
  slide.addImage(cropRegion(A.temp2, 1536, 1024, 10.48, 0, 2.853, 1.60, {
    x: 1200, y: 0, w: 336, h: 184,
  }));
  text(slide, "PROPOSED", 9.90, 0.14, 0.68, 0.18, {
    fontFace: "Bahnschrift SemiCondensed", fontSize: 7.0, bold: true, color: C.teal, align: "center", charSpacing: 1.1,
  });
  text(slide, "GETYOURPHYSIO.IN  •  HYROX MUMBAI  •  PROPOSED RECOVERY ZONE", 3.60, 7.30, 6.15, 0.10, {
    fontFace: "Bahnschrift SemiCondensed", fontSize: 5.2, bold: true, color: C.teal, align: "center",
  });
}

// Slide 3 — plan of action
{
  const slide = pptx.addSlide();
  slide.background = { color: C.paper };
  header(slide, "Plan of Action", 3);

  shape(slide, pptx.ShapeType.line, 0.95, 1.84, 11.36, 0, { line: "9BCBC8", lineWidth: 1.7 });
  [1.14, 4.20, 7.27, 10.34].forEach((x, index) => {
    const accent = index === 2 ? C.orange : C.teal;
    shape(slide, pptx.ShapeType.ellipse, x, 1.71, 0.27, 0.27, { fill: accent, line: C.white, lineWidth: 1.0 });
  });

  stageCard(slide, 0.43, C.teal, "01", "BEFORE THE EVENT", [
    "Team selection & briefing",
    "Role and shift allocation",
    "Equipment / consumables checklist",
    "Recovery-zone setup planning",
    "Coordination with HYROX team",
    "Clinical & escalation protocols",
  ]);
  stageCard(slide, 3.50, "167DB7", "02", "DURING THE EVENT", [
    "Dedicated recovery stations",
    "Athlete assessment & triage",
    "Efficient treatment workflow",
    "Team-lead supervision",
    "Event-management coordination",
    "Hygiene & equipment control",
    "Basic documentation",
  ]);
  stageCard(slide, 6.57, C.orange, "03", "ATHLETE EXPERIENCE", [
    "Efficient athlete movement",
    "Minimised waiting time",
    "Consistent recovery support",
    "Clear athlete communication",
    "Athlete-first approach",
    "Referral when required",
  ]);
  stageCard(slide, 9.64, C.teal, "04", "AFTER THE EVENT", [
    "Team debrief",
    "Recovery-zone utilisation summary",
    "Athlete feedback where available",
    "Operational observations",
    "Recommendations for future events",
  ]);

  shape(slide, pptx.ShapeType.roundRect, 0.43, 6.42, 12.15, 0.66, { fill: C.black, line: false });
  text(slide, "OUR OBJECTIVE", 0.72, 6.54, 1.22, 0.18, {
    fontFace: "Bahnschrift SemiCondensed", fontSize: 8.1, bold: true, color: C.teal, charSpacing: 1.0,
  });
  text(slide, "Deliver a professionally managed athlete recovery experience that integrates seamlessly into the HYROX event environment.", 2.04, 6.49, 9.95, 0.29, {
    fontFace: "Bahnschrift SemiCondensed", fontSize: 11.2, bold: true, color: C.white, align: "center",
  });
  text(slide, "GetYourPhysio.in  •  Expert Physiotherapy  •  Sports Recovery  •  Event Support", 0.70, 7.18, 11.95, 0.16, {
    fontFace: "Bahnschrift SemiCondensed", fontSize: 7.8, bold: true, color: C.teal, align: "center", charSpacing: 0.4,
  });
}

await pptx.writeFile({ fileName: OUT });
console.log(`Created ${OUT}`);
