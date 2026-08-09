import { Box, Button, Container, Typography } from "@mui/material";
import { Activity, ArrowUpRight, ClipboardCheck, Dumbbell, HeartPulse, ShieldCheck, Siren, Stethoscope, UsersRound } from "lucide-react";
import { contactDetails } from "../data/contact.js";

const sports = ["Football", "Cricket", "Athletics", "Combat sports", "Racquet sports", "Cycling", "Swimming", "Fitness racing", "Marathons", "Triathlons"];

const coverage = [
  { icon: ClipboardCheck, step: "01", title: "Clinical planning", copy: "A coverage plan shaped around your sport, venue, athlete numbers, schedule and risk profile." },
  { icon: Dumbbell, step: "02", title: "Preparation & taping", copy: "Warm-up support, mobility input and sports taping before training, heats and competition." },
  { icon: Siren, step: "03", title: "On-field response", copy: "Qualified Physios available courtside, pitchside, trackside or across designated medical zones." },
  { icon: HeartPulse, step: "04", title: "Recovery & handover", copy: "Post-event assessment, recovery support, injury guidance and a documented clinical handover." },
];

const partnerMarks = [
  { mark: "AR", name: "APEX RACE", type: "Fitness series" },
  { mark: "GG", name: "GRIT GAMES", type: "Multi-sport events" },
  { mark: "VF", name: "VELOCITY", type: "Run festivals" },
  { mark: "ET", name: "ENDURA", type: "Triathlon circuit" },
  { mark: "UC", name: "URBAN CORE", type: "Sports league" },
];

export default function EventPhysioSection() {
  const marqueeMarks = [...partnerMarks, ...partnerMarks];
  const sportMarquee = [...sports, ...sports];

  return (
    <Box component="section" className="event-physio-section" aria-labelledby="event-physio-title">
      <span className="event-physio-orbit event-physio-orbit-one" />
      <span className="event-physio-orbit event-physio-orbit-two" />
      <Container maxWidth="xl" className="event-physio-container">
        <Box className="event-physio-heading">
          <Box data-reveal>
            <span className="event-physio-kicker"><Activity size={16} /> Professional sports event physiotherapy</span>
            <Typography component="h1" id="event-physio-title">
              Physio teams for<br /><em>every sporting event.</em>
            </Typography>
          </Box>
          <Box className="event-physio-intro" data-reveal>
            <Typography>
              We provide qualified, event-ready Physiotherapists for tournaments, leagues, school and academy meets, corporate sports days, endurance events and mass-participation competitions.
            </Typography>
            <Button component="a" href={contactDetails.eventCoverageWhatsappHref} target="_blank" rel="noreferrer" endIcon={<ArrowUpRight size={18} />}>
              Discuss your event
            </Button>
          </Box>
        </Box>

        <Box className="event-sports-marquee" aria-label="Sports and event types we support">
          <Box className="event-sports-track">
            {sportMarquee.map((sport, index) => <span key={`${sport}-${index}`} aria-hidden={index >= sports.length}><i />{sport}</span>)}
          </Box>
        </Box>

        <Box className="event-physio-coverage" data-stagger>
          {coverage.map(({ icon: Icon, step, title, copy }) => (
            <Box className="event-coverage-card" key={title} data-reveal>
              <Box className="event-coverage-card__top"><span>{step}</span><Icon size={24} /></Box>
              <Typography component="h2">{title}</Typography>
              <Typography>{copy}</Typography>
            </Box>
          ))}
        </Box>

        <Box className="event-service-standard" data-reveal>
          <Box className="event-service-standard__icon"><ShieldCheck size={34} /></Box>
          <Box><span>Our service standard</span><Typography component="h2">One clinical team. One clear event plan.</Typography></Box>
          <Box className="event-service-standard__points">
            <span><Stethoscope size={17} /> Qualified Physiotherapists</span>
            <span><UsersRound size={17} /> Scalable team deployment</span>
            <span><ClipboardCheck size={17} /> Organiser-ready reporting</span>
          </Box>
        </Box>

        <Box className="event-partner-panel" data-reveal>
          <Box className="event-partner-copy">
            <span>Event partner network</span>
            <Typography component="h2">Supporting ambitious sports communities.</Typography>
            <small>Placeholder partner marks — official logos will be added after confirmation.</small>
          </Box>
          <Box className="event-partner-marquee" aria-label="Placeholder event partner logos">
            <Box className="event-partner-track">
              {marqueeMarks.map((partner, index) => (
                <Box className="event-partner-mark" key={`${partner.name}-${index}`} aria-hidden={index >= partnerMarks.length}>
                  <strong>{partner.mark}</strong>
                  <span><b>{partner.name}</b><small>{partner.type}</small></span>
                </Box>
              ))}
            </Box>
          </Box>
        </Box>

        <Box className="event-physio-cta" data-reveal>
          <Box><span>Planning a sports event?</span><Typography component="h2">Let’s build the right medical coverage together.</Typography></Box>
          <Button component="a" href={contactDetails.eventCoverageWhatsappHref} target="_blank" rel="noreferrer" endIcon={<ArrowUpRight size={18} />}>Request a coverage plan</Button>
        </Box>
      </Container>
    </Box>
  );
}
