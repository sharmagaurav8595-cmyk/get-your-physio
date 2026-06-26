import { Box } from "@mui/material";
import Header from "./components/Header.jsx";
import Hero from "./components/Hero.jsx";
import ServicesSection from "./components/ServicesSection.jsx";
import AboutSection from "./components/AboutSection.jsx";
import WhyChooseUs from "./components/WhyChooseUs.jsx";
import HowItWorks from "./components/HowItWorks.jsx";
import ConditionsSection from "./components/ConditionsSection.jsx";
import TestimonialsSection from "./components/TestimonialsSection.jsx";
import FaqSection from "./components/FaqSection.jsx";
import ContactSection from "./components/ContactSection.jsx";
import Footer from "./components/Footer.jsx";
import StickyActions from "./components/StickyActions.jsx";

export default function App() {
  return (
    <Box>
      <Header />
      <main>
        <Hero />
        <ServicesSection />
        <AboutSection />
        <WhyChooseUs />
        <HowItWorks />
        <ConditionsSection />
        <TestimonialsSection />
        <FaqSection />
        <ContactSection />
      </main>
      <Footer />
      <StickyActions />
    </Box>
  );
}
