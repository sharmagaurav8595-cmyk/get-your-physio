import { Box, Button, Container, Stack, Typography } from "@mui/material";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { images } from "../assets/images.js";
import SectionHeading from "./SectionHeading.jsx";

const points = [
  "Athlete-first assessment for strength, mobility, and return-to-sport goals",
  "Yoga-informed flexibility, breathing, posture, and recovery support",
  "Clear guidance for working professionals, senior citizens, and families",
  "Home and online Physiotherapy options when travel is difficult",
];

export default function AboutSection() {
  return (
    <Box id="about" component="section" className="section-block muted-section">
      <Container maxWidth="xl">
        <Box className="split-grid">
          <Box className="image-panel about-media">
            <img src={images.therapy} alt="Physiotherapy assessment and rehabilitation session" />
            <Box className="about-gallery" aria-label="Recovery and mobility visuals">
              {images.aboutGallery.map((image) => (
                <img key={image.src} src={image.src} alt={image.alt} />
              ))}
            </Box>
          </Box>
          <Box>
            <SectionHeading
              align="left"
              eyebrow="About Us"
              title="A modern recovery path for athletes, active lives, and families"
              description="At GetYourPhysio, we believe quality physiotherapy should be accessible, convenient, and personalized. That's why we provide expert home physiotherapy designed around your schedule and your goals. Whether you're recovering from an injury, surgery, sports-related pain, or managing chronic conditions, our evidence-based approach focuses on restoring function, improving mobility, and delivering long-term results—not just temporary pain relief."
            />
            <Stack spacing={1.4} className="check-list">
              {points.map((point) => (
                <Box key={point} className="check-item">
                  <CheckCircle2 size={22} />
                  <Typography>{point}</Typography>
                </Box>
              ))}
            </Stack>
            <Button
              component="a"
              href="#contact"
              variant="contained"
              endIcon={<ArrowRight size={18} />}
              sx={{ mt: 3 }}
            >
              Start Your Recovery
            </Button>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}
