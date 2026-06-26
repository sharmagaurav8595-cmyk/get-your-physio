import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Container,
  Typography,
} from "@mui/material";
import { ChevronDown } from "lucide-react";
import { faqs } from "../data/faqs.js";
import SectionHeading from "./SectionHeading.jsx";

export default function FaqSection() {
  return (
    <Box id="faq" component="section" className="section-block muted-section">
      <Container maxWidth="md">
        <SectionHeading
          eyebrow="FAQ"
          title="Common questions before booking"
          description="Simple answers for patients, family members, and caregivers."
        />
        <Box className="faq-list">
          {faqs.map((faq, index) => (
            <Accordion key={faq.question} disableGutters elevation={0} defaultExpanded={index === 0}>
              <AccordionSummary expandIcon={<ChevronDown size={20} />}>
                <Typography variant="h6" component="h3">
                  {faq.question}
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography color="text.secondary">{faq.answer}</Typography>
              </AccordionDetails>
            </Accordion>
          ))}
        </Box>
      </Container>
    </Box>
  );
}
