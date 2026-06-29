import { Box, Container, Typography } from "@mui/material";
import { BadgeCheck, HeartPulse, Home, TimerReset } from "lucide-react";
import SectionHeading from "./SectionHeading.jsx";

const reasons = [
  {
    title: "Personalized Care",
    description: "Every treatment plan is tailored to your condition, lifestyle adn recovery goals.",
    icon: BadgeCheck,
  },
  {
    title: "Flexible Scheduling",
    description: "Book appointment at a time that suits you, ensuring focused care, continous progress and better outcomes.",
    icon: BadgeCheck,
  },  
  {
    title: "Patient Education",
    description: "We help you understand your condition empowering you to recover confidently.",
    icon: HeartPulse,
  },
  {
    title: "Qualified Care",
    description: "Structured assessments and treatment plans led by trained Physiotherapy professionals.",
    icon: BadgeCheck,
  },
  
  
];

export default function WhyChooseUs() {
  return (
    <Box component="section" className="section-block">
      <Container maxWidth="xl">
        <SectionHeading
          eyebrow="Why Choose Us"
          title="Professional care that feels clear, steady, and easy to trust"
          description="Everything is designed to make appointments, treatment and recovery fast, simple and convenient for you and your family."
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
