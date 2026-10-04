import { Box, Button, Chip, Container, Stack, Typography } from "@mui/material";
import { CalendarCheck, CheckCircle2, Flag, Phone, ShieldCheck } from "lucide-react";
import HeroImageSlider from "./HeroImageSlider.jsx";
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
              <span>Expert </span>
              <span>Physiotherapy </span>
              <span>for Home, Athletes </span>
              <span>&amp; Events</span>
            </Typography>
            <Typography variant="h5" color="text.secondary" className="hero-subtitle">
              Professional Physiotherapy at your doorstep to relieve pain, restore movement, and recover faster.
            </Typography>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} className="hero-actions">
              <Button
                component="a"
                href={contactDetails.whatsappHref}
                variant="contained"
                size="large"
                startIcon={<CalendarCheck size={20} />}
              >
               Book Appointment 
              </Button>
              {/* <Button
                component="a"
                href="/event-coverage"
                variant="outlined"
                size="large"
                startIcon={<Flag size={20} />}
              >
               Event Coverage
              </Button> */}
              <Button
                component="a"
                href={contactDetails.phoneHref}
                variant="outlined"
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
            <HeroImageSlider />
            <Typography component="p" className="hero-photo-caption">
              HYROX Mumbai | Physiotherapy Partner
            </Typography>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}
