import { Box, Button } from "@mui/material";
import { MessageCircle, Phone } from "lucide-react";
import { contactDetails } from "../data/contact.js";

export default function StickyActions() {
  return (
    <Box className="sticky-actions" aria-label="Quick contact actions">
      <Button
        component="a"
        href={contactDetails.whatsappHref}
        variant="contained"
        color="secondary"
        startIcon={<MessageCircle size={19} />}
      >
        WhatsApp
      </Button>
      <Button
        component="a"
        href={contactDetails.phoneHref}
        variant="contained"
        color="primary"
        startIcon={<Phone size={19} />}
      >
        Call
      </Button>
    </Box>
  );
}
