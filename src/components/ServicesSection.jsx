import { Box, Card, CardContent, Container, Typography } from "@mui/material";
import { services } from "../data/services.js";
import SectionHeading from "./SectionHeading.jsx";

export default function ServicesSection() {
  return (
    <Box id="services" component="section" className="section-block">
      <Container maxWidth="xl">
        <SectionHeading
          eyebrow="Our Services"
          title="Complete physiotherapy support for everyday recovery"
          description="Choose evidence-informed care for pain relief, strength, flexibility, balance, and long-term function."
        />
        <Box className="service-grid">
          {services.map(({ title, description, icon: Icon }) => (
            <Card key={title} className="service-card" elevation={0}>
              <CardContent>
                <Box className="service-icon">
                  <Icon size={28} />
                </Box>
                <Typography variant="h6" component="h3">
                  {title}
                </Typography>
                <Typography color="text.secondary">{description}</Typography>
              </CardContent>
            </Card>
          ))}
        </Box>
      </Container>
    </Box>
  );
}
