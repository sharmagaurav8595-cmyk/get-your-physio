import { Box, Button, Container, Typography } from "@mui/material";
import { ArrowRight, Flag, ShieldCheck, Stethoscope, Trophy } from "lucide-react";

export default function EventCoverageTeaser() {
  return (
    <Box id="event-coverage" component="section" className="event-teaser" aria-labelledby="event-teaser-title">
      <Container maxWidth="xl">
        <Box className="event-teaser-card">
          <Box className="event-teaser-copy" data-reveal>
            <span><Flag size={16} /> For organisers, leagues & academies</span>
            <Typography component="h2" id="event-teaser-title">Professional Physios for every sporting event.</Typography>
            <Typography>From local tournaments to major endurance events, deploy a qualified clinical team wherever your athletes compete.</Typography>
            <Button component="a" href="/event-coverage" endIcon={<ArrowRight size={18} />}>Explore event coverage</Button>
          </Box>
          <Box className="event-teaser-visual" data-reveal>
            <span className="event-teaser-line" />
            <Box className="event-teaser-badge event-teaser-badge-one"><Stethoscope size={22} /><span><strong>On-site care</strong><small>Where athletes compete</small></span></Box>
            <Box className="event-teaser-badge event-teaser-badge-two"><ShieldCheck size={22} /><span><strong>Qualified teams</strong><small>Planned around your event</small></span></Box>
            <Box className="event-teaser-badge event-teaser-badge-three"><Trophy size={22} /><span><strong>All sports</strong><small>One clinical standard</small></span></Box>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}
