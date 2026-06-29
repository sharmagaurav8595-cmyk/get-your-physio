import { Box, Button, Chip, Container, Stack, Typography } from "@mui/material";
import { CalendarCheck, CheckCircle2, Phone, ShieldCheck } from "lucide-react";
import { images } from "../assets/images.js";
import { contactDetails } from "../data/contact.js";

const highlights = ["Personalized Treatment plan", "Home and online support", "Flexible appointment scheduling"];

export default function Hero() {
  return (
    <Box id="home" className="hero-section">
      <Container maxWidth="xl">
        <Box className="hero-grid">
          <Box className="hero-copy">
            <Chip
              color="secondary"
              icon={<ShieldCheck size={18} />}
              label="Trusted Home Physiotherapy for Pain relief and faster recovery"
              className="hero-chip"
            />
            <Typography component="h1" variant="h1" className="hero-title">
              Expert Physiotherapy care at your Doorstep
            </Typography>
            <Typography variant="h5" color="text.secondary" className="hero-subtitle">
              Get personalised physiotherapy care in the comfort of your home.
            </Typography>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} className="hero-actions">
              <Button
                component="a"
                href="#contact"
                variant="contained"
                size="large"
                startIcon={<CalendarCheck size={20} />}
              >
                Book Appointment
              </Button>
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
            <img src={images.hero} alt="Physiotherapist supporting a patient during treatment" />
            <Box className="hero-stat">
              <Typography variant="h4">Personalized Care Plan</Typography>
              <Typography>From Expert Assessment to Lasting Recovery</Typography>
            </Box>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}
