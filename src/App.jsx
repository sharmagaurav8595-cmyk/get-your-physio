import { useEffect, useState } from "react";
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
import LoginPage from "./pages/LoginPage.jsx";
import OnboardingPage from "./pages/OnboardingPage.jsx";
import DashboardPage from "./pages/DashboardPage.jsx";
import AdminLoginPage from "./pages/AdminLoginPage.jsx";
import AdminDashboardPage from "./pages/AdminDashboardPage.jsx";

export default function App() {
  const [route, setRoute] = useState(() => window.location.pathname.replace(/\/+$/, "") || "/");

  useEffect(() => {
    const updateRoute = () => setRoute(window.location.pathname.replace(/\/+$/, "") || "/");
    window.addEventListener("popstate", updateRoute);
    return () => window.removeEventListener("popstate", updateRoute);
  }, []);

  if (route === "/login") return <LoginPage />;
  if (route === "/physio/register") return <OnboardingPage role="physio" />;
  if (route === "/patient/register") return <OnboardingPage role="patient" />;
  if (route === "/dashboard/physio") return <DashboardPage role="physio" />;
  if (route === "/dashboard/patient") return <DashboardPage role="patient" />;
  if (route === "/admin/login") return <AdminLoginPage />;
  if (route === "/admin") return <AdminDashboardPage />;

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
