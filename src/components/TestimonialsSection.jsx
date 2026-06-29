import { Box, Card, CardContent, Container, Rating, Typography } from "@mui/material";
import { Quote } from "lucide-react";
import { testimonials } from "../data/testimonials.js";
import SectionHeading from "./SectionHeading.jsx";

export default function TestimonialsSection() {
  return (
    <Box component="section" className="section-block">
      <Container maxWidth="xl">
        <SectionHeading
          eyebrow="Patient Testimonials"
          title="Athletes, patients, and families value clear, steady care"
          description="Real recovery feels more confident when the plan is explained and the progress is visible."
        />
        <Box className="testimonial-grid">
          {testimonials.map((testimonial) => (
            <Card key={testimonial.name} className="testimonial-card" elevation={0}>
              <CardContent>
                <Box className="quote-icon">
                  <Quote size={24} />
                </Box>
                <Rating value={5} readOnly size="small" aria-label="5 star rating" />
                <Typography className="testimonial-quote">"{testimonial.quote}"</Typography>
                <Typography variant="h6" component="h3">
                  {testimonial.name}
                </Typography>
                <Typography color="text.secondary">{testimonial.role}</Typography>
              </CardContent>
            </Card>
          ))}
        </Box>
      </Container>
    </Box>
  );
}
