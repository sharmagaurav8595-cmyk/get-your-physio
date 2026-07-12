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
import PageLoader from "./animations/PageLoader.jsx";
import MotionController from "./animations/MotionController.jsx";
import AthleteGatewaySection from "./components/AthleteGatewaySection.jsx";
import AthletePage from "./pages/AthletePage.jsx";

export default function App() {
  const route = window.location.pathname.replace(/\/+$/, "") || "/";

  return (
    <Box>
      <PageLoader />
    
      <MotionController />
{/* {route === "/athletes" ? (
      <AthletePage />
    ) : ( */}
      <>
      <Header />
      <main>
          {/* <AthletePage /> */}
        <Hero />
        <HowItWorks />
        <ServicesSection />
        <AboutSection />
        <WhyChooseUs />
        <ConditionsSection />
        <TestimonialsSection />
        <FaqSection />
        <ContactSection />
      </main>
      <Footer />
      <StickyActions />
</>
    {/* )
  } */}
    </Box>
  );
}
