import { Box, Button, Container, Stack, Typography } from "@mui/material";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { images } from "../assets/images.js";
import SectionHeading from "./SectionHeading.jsx";

const points = [
  "Clear explanation before every treatment plan",
  "Hands-on therapy with guided exercise progression",
  "Comfortable care options for senior citizens and families",
  "Home visit support when travel is difficult",
];

export default function AboutSection() {
  return (
    <Box id="about" component="section" className="section-block muted-section">
      <Container maxWidth="xl">
        <Box className="split-grid">
          <Box className="image-panel">
            <img src={images.therapy} alt="Physiotherapy assessment and rehabilitation session" />
          </Box>
          <Box>
            <SectionHeading
              align="left"
              eyebrow="About Us"
              title="A calm, practical path from pain to movement"
              description="GetMyPhysio.in is built for people who want professional physiotherapy without confusion. We focus on clear assessment, safe exercises, and practical recovery plans that fit daily life."
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
