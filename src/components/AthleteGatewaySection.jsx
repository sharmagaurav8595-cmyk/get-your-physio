import { Box, Button, Container, Typography } from "@mui/material";
import { ArrowRight, Dumbbell, Gauge, ShieldCheck } from "lucide-react";
import { images } from "../assets/images.js";

export default function AthleteGatewaySection() {
  return (
    <Box component="section" className="athlete-gateway">
      <Container maxWidth="xl" className="athlete-gateway__grid">
        <div className="athlete-gateway__media" data-reveal>
          <img src={images.sports} alt="Athlete completing sports rehabilitation with a physiotherapist" />
          <span><Gauge size={18} /> Performance-led rehab</span>
        </div>
        <div className="athlete-gateway__copy">
          <span className="athlete-gateway__eyebrow" data-reveal><Dumbbell size={17} /> For athletes & active people</span>
          <Typography component="h2" data-reveal>Recover from injury.<br />Return ready.</Typography>
          <Typography data-reveal>Explore our athlete-focused space for sports rehabilitation, strength rebuilding, movement performance and return-to-play support.</Typography>
          <div className="athlete-gateway__points" data-stagger>
            <span data-reveal><ShieldCheck /> Criteria-led recovery</span>
            <span data-reveal><Gauge /> Performance progressions</span>
          </div>
          <Button component="a" href="/athletes" className="athlete-gateway__button" endIcon={<ArrowRight />}>Explore Athlete Physiotherapy</Button>
        </div>
      </Container>
    </Box>
  );
}
