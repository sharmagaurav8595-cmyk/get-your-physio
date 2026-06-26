import { Box, Container, Typography } from "@mui/material";
import { BadgeCheck, HeartPulse, Home, TimerReset } from "lucide-react";
import SectionHeading from "./SectionHeading.jsx";

const reasons = [
  {
    title: "Qualified Care",
    description: "Structured assessments and treatment plans led by trained physiotherapy professionals.",
    icon: BadgeCheck,
  },
  {
    title: "Patient First",
    description: "Sessions are paced with comfort, safety, and confidence in mind, especially for seniors.",
    icon: HeartPulse,
  },
  {
    title: "Home Convenience",
    description: "Book home physiotherapy when clinic travel is painful, tiring, or inconvenient.",
    icon: Home,
  },
  {
    title: "Recovery Tracking",
    description: "Progress is reviewed through pain levels, mobility, strength, and daily function.",
    icon: TimerReset,
  },
];

export default function WhyChooseUs() {
  return (
    <Box component="section" className="section-block">
      <Container maxWidth="xl">
        <SectionHeading
          eyebrow="Why Choose Us"
          title="Professional care that feels easy to trust"
          description="Everything is designed to make booking, treatment, and recovery feel clear for patients and families."
        />
        <Box className="reason-grid">
          {reasons.map(({ title, description, icon: Icon }) => (
            <Box key={title} className="reason-item">
              <Box className="reason-icon">
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
