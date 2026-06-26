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
              title="Care for common pain, mobility, and rehab needs"
              description="From everyday stiffness to complex recovery, treatment starts with understanding your symptoms, goals, and comfort level."
            />
            <Box className="condition-list">
              {conditions.map((condition) => (
                <Chip key={condition} label={condition} className="condition-chip" />
              ))}
            </Box>
          </Box>
          <Box className="image-panel">
            <img src={images.seniorCare} alt="Senior patient receiving guided physiotherapy care" />
          </Box>
        </Box>
      </Container>
    </Box>
  );
}
