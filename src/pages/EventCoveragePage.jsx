import { Box } from "@mui/material";
import MotionController from "../animations/MotionController.jsx";
import EventPhysioSection from "../components/EventPhysioSection.jsx";
import Footer from "../components/Footer.jsx";
import Header from "../components/Header.jsx";
import StickyActions from "../components/StickyActions.jsx";

export default function EventCoveragePage() {
  return (
    <Box className="event-coverage-page">
      <MotionController />
      <Header />
      <main><EventPhysioSection /></main>
      <Footer />
      <StickyActions />
    </Box>
  );
}
