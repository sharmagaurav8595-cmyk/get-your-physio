import { Box, Chip, Container } from "@mui/material";
import { conditions } from "../data/conditions.js";
import { images } from "../assets/images.js";
import SectionHeading from "./SectionHeading.jsx";

export default function ConditionsSection() {
  return (
    <Box component="section" className="section-block muted-section">
      <Container maxWidth="xl">
        <Box className="conditions-layout">
          <Box>
            <SectionHeading
              align="left"
              eyebrow="Conditions We Treat"
              title="Expert care for frequent pain, mobility, and rehab needs"
              description="From everyday aches to complex rehabilitation, our personalized home physiotherapy services are designed to reduce pain, restore function, and help you return to the activities you love—comfortably and confidently."
            />
            <Box className="condition-list">
              {conditions.map((condition) => (
                <Chip key={condition} label={condition} className="condition-chip" />
              ))}
            </Box>
          </Box>
          <Box className="condition-gallery" aria-label="Physiotherapy treatment gallery">
            {images.conditionGallery.map((image) => (
              <img key={image.src} src={image.src} alt={image.alt} />
            ))}
          </Box>
        </Box>
      </Container>
    </Box>
  );
}
