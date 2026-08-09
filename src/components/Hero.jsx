import { Box, Button, Chip, Container, Stack, Typography } from "@mui/material";
import { ArrowRight, CalendarCheck, CheckCircle2, Flag, Phone, ShieldCheck } from "lucide-react";
import { images } from "../assets/images.js";
import { contactDetails } from "../data/contact.js";

const highlights = ["Personalized home care", "On-site event teams", "Flexible coverage planning"];

export default function Hero() {
  return (
    <Box id="home" className="hero-section">
      <Container maxWidth="xl">
        <Box className="hero-grid">
          <Box className="hero-copy">
            <Chip
              color="secondary"
              icon={<ShieldCheck size={18} />}
              label="Home care • Athlete support • Sports event coverage"
              className="hero-chip"
            />
            <Typography component="h1" variant="h1" className="hero-title">
              Expert Physiotherapy for home, Sports & events
            </Typography>
            <Typography variant="h5" color="text.secondary" className="hero-subtitle">
              Personalised care at your doorstep, plus qualified on-site Physio teams for tournaments, leagues and endurance events.
            </Typography>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} className="hero-actions">
              <Button
                component="a"
                href={contactDetails.whatsappHref}
                variant="contained"
                size="large"
                startIcon={<CalendarCheck size={20} />}
              >
                Book Home Physio
              </Button>
              <Button
                component="a"
                href="/event-coverage"
                variant="outlined"
                size="large"
                startIcon={<Flag size={20} />}
              >
                Event Coverage
              </Button>
              <Button
                component="a"
                href={contactDetails.phoneHref}
                variant="text"
                size="large"
                startIcon={<Phone size={20} />}
              >
                Call Now
              </Button>
            </Stack>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} className="hero-highlights">
              {highlights.map((item) => (
                <Box key={item} className="hero-highlight">
                  <CheckCircle2 size={19} />
                  <span>{item}</span>
                </Box>
              ))}
            </Stack>
          </Box>

          <Box className="hero-media">
            <img src={images.hero} alt="Physiotherapist supporting a patient during treatment" />
            <Box component="a" href="/event-coverage" className="hero-stat hero-stat-event">
              <span className="hero-stat-eyebrow"><i /> Sports Event Partnerships</span>
              <Typography variant="h4">Physio teams for your Sports event</Typography>
              <Typography>Get Professional Physiotherapists & Recovery Support for your Events.</Typography>
              <strong>Explore Event Coverage <ArrowRight size={17} /></strong>
            </Box>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}
