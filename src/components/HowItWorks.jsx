import { Box, Container, Typography } from "@mui/material";
import { steps } from "../data/steps.js";
import SectionHeading from "./SectionHeading.jsx";

export default function HowItWorks() {
  return (
    <Box id="how-it-works" component="section" className="section-block teal-section">
      <Container maxWidth="xl">
        <SectionHeading
          eyebrow="How It Works"
          title="Book care in four simple steps"
          description="A simple process helps you move from first message to a personalized Physiotherapy plan."
        />
        <Box className="steps-grid">
          {steps.map(({ title, description, icon: Icon }, index) => (
            <Box key={title} className="step-item">
              <Box className="step-number">{index + 1}</Box>
              <Box className="step-icon">
                <Icon size={28} />
              </Box>
              <Typography variant="h6" component="h3">
                {title}
              </Typography>
              <Typography color="text.secondary">{description}</Typography>
            </Box>
          ))}
        </Box>
      </Container>
    </Box>
  );
}
