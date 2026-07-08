import { Box, Button, Container, Stack, Typography } from "@mui/material";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { images } from "../assets/images.js";
import { contactDetails } from "../data/contact.js";
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
              title="Expert Home Physiotherapy for Pain Relief, Recovery & Performance Enhancement"
//               description="At GetYourPhysio, we make quality physiotherapy accessible, convenient, and personalized at home.
// Our expert physiotherapists provide one-on-one care tailored to your needs and goals.
// We focus on evidence-based assessment and treatment for injuries, surgery recovery, pain, mobility, and fitness.
// Our approach targets the root cause, not just temporary symptom relief.
// We help restore movement, improve function, prevent future injuries, and support long-term recovery.

// Our Holistic approach also includes <b>Yoga sessions<b>, Breathing exercises that compliment Physiotherapy, helping you remain active, mobile, and pain-free. 
// "
 description={
    <>
      At GetYourPhysio, we make quality Physiotherapy accessible, convenient, and personalized at home.
      Our expert Physiotherapists provide one-on-one care tailored to your needs and goals.
      We focus on evidence-based assessment and treatment for injuries, surgery recovery, pain, mobility, and fitness.
      Our approach targets the root cause, not just temporary symptom relief.
      We help restore movement, improve function, prevent future injuries, and support long-term recovery.

      <br />
      {/* <br /> */}

      Our Holistic approach also includes <b>Yoga sessions</b>, Breathing exercises that complement Physiotherapy, helping you remain active, mobile, and pain-free.
    </>
  }
            />
            {/* <Stack spacing={1.4} className="check-list">
              {points.map((point) => (
                <Box key={point} className="check-item">
                  <CheckCircle2 size={22} />
                  <Typography>{point}</Typography>
                </Box>
              ))}
            </Stack> */}
            <Button
              component="a"
              href={contactDetails.whatsappHref}
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
