import { Box, Button } from "@mui/material";
import { Phone } from "lucide-react";
import whatsappLogo from "../assets/whatsapp.svg";
import { contactDetails } from "../data/contact.js";

export default function StickyActions() {
  return (
    <Box className="sticky-actions" aria-label="Quick contact actions">
      <Button
        component="a"
        href={contactDetails.whatsappHref}
        variant="contained"
        color="secondary"
        className="sticky-actions__whatsapp"
        aria-label="Chat on WhatsApp"
        title="Chat on WhatsApp"
      >
        <img src={whatsappLogo} width="26" height="26" alt="" aria-hidden="true" />
      </Button>
      <Button
        component="a"
        href={contactDetails.phoneHref}
        variant="contained"
        color="primary"
        aria-label="Call GetYourPhysio"
        title="Call GetYourPhysio"
      >
        <Phone size={24} aria-hidden="true" />
      </Button>
    </Box>
  );
}
