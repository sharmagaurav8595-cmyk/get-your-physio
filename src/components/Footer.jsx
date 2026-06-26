import { Box, Container, Link, Stack, Typography } from "@mui/material";
import logo from "../assets/logo.svg";
import { contactDetails } from "../data/contact.js";

const footerLinks = [
  { label: "Services", href: "#services" },
  { label: "About", href: "#about" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "FAQ", href: "#faq" },
  { label: "Contact", href: "#contact" },
];

export default function Footer() {
  return (
    <Box component="footer" className="site-footer">
      <Container maxWidth="xl">
        <Box className="footer-grid">
          <Box>
            <Box className="brand-link footer-brand">
              <img src={logo} alt="" className="brand-logo" />
              <Box>
                <Typography variant="h6" className="brand-name">
                  GetMyPhysio.in
                </Typography>
                <Typography className="brand-tagline">Move better. Feel stronger.</Typography>
              </Box>
            </Box>
            <Typography color="text.secondary" mt={2} maxWidth={460}>
              Professional physiotherapy for pain relief, rehabilitation, senior care, sports
              recovery, and home treatment support.
            </Typography>
          </Box>
          <Stack spacing={1}>
            <Typography variant="h6">Quick Links</Typography>
            {footerLinks.map((link) => (
              <Link key={link.href} href={link.href} underline="hover" color="inherit">
                {link.label}
              </Link>
            ))}
          </Stack>
          <Stack spacing={1}>
            <Typography variant="h6">Contact</Typography>
            <Link href={contactDetails.phoneHref} underline="hover" color="inherit">
              {contactDetails.phoneDisplay}
            </Link>
            <Link href={`mailto:${contactDetails.publicEmail}`} underline="hover" color="inherit">
              {contactDetails.publicEmail}
            </Link>
            <Typography color="text.secondary">Clinic and home physiotherapy appointments</Typography>
          </Stack>
        </Box>
        <Box className="footer-bottom">
          <Typography color="text.secondary">
            Copyright {new Date().getFullYear()} GetMyPhysio.in. All rights reserved.
          </Typography>
          <Typography color="text.secondary">
            This website is for appointment requests and general care information.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}
