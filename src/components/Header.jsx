import { useState } from "react";
import {
  AppBar,
  Box,
  Button,
  Container,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemText,
  Stack,
  Toolbar,
  Typography,
} from "@mui/material";
import { CalendarCheck, Menu, Phone, X } from "lucide-react";
import logo from "../assets/logo.svg";
import logo3 from "../assets/logo3.jpg";
import { contactDetails } from "../data/contact.js";

const navLinks = [
  { label: "How It Works", href: "#how-it-works" },
  { label: "Services", href: "#services" },
  { label: "About", href: "#about" },
  { label: "FAQ", href: "#faq" },
  { label: "Contact", href: "#contact" },
];

export default function Header() {
  const [open, setOpen] = useState(false);

  const closeDrawer = () => setOpen(false);

  return (
    <AppBar position="sticky" color="inherit" elevation={0} className="site-header">
      <Container maxWidth="xl">
        <Toolbar disableGutters className="header-toolbar">
          <Box component="a" href="#home" className="brand-link" aria-label="GetYourPhysio.in home">
            <img src={logo3} alt="" className="brand-logo" />
            <Box>
              <Typography variant="h6" className="brand-name">
                GetYourPhysio.in
              </Typography>
              <Typography className="brand-tagline">  Healing at your doorstep</Typography>
            </Box>
          </Box>

          <Stack direction="row" spacing={0.5} className="desktop-nav">
            {navLinks.map((link) => (
              <Button key={link.href} component="a" href={link.href} color="inherit">
                {link.label}
              </Button>
            ))}
          </Stack>

          <Stack direction="row" spacing={1} className="desktop-actions">
            <Button
              component="a"
              href={contactDetails.phoneHref}
              variant="outlined"
              color="primary"
              startIcon={<Phone size={18} />}
            >
              Call Now
            </Button>
            <Button
              component="a"
              href="#contact"
              variant="contained"
              color="primary"
              startIcon={<CalendarCheck size={18} />}
            >
              Book Appointment
            </Button>
          </Stack>

          <IconButton
            className="mobile-menu-button"
            onClick={() => setOpen(true)}
            aria-label="Open navigation menu"
            aria-expanded={open}
            aria-controls="mobile-navigation"
          >
            <Menu />
          </IconButton>
        </Toolbar>
      </Container>

      <Drawer anchor="right" open={open} onClose={closeDrawer}>
        <Box id="mobile-navigation" className="mobile-drawer" role="navigation" aria-label="Mobile navigation">
          <Stack direction="row" alignItems="center" justifyContent="space-between" mb={2}>
            <Box className="brand-link">
              <img src={logo3} alt="" className="brand-logo" />
              <Typography variant="h6" className="brand-name">
                GetYourPhysio.in
              </Typography>
            </Box>
            <IconButton onClick={closeDrawer} aria-label="Close navigation menu">
              <X />
            </IconButton>
          </Stack>
          <List>
            {navLinks.map((link) => (
              <ListItemButton
                key={link.href}
                component="a"
                href={link.href}
                onClick={closeDrawer}
              >
                <ListItemText primary={link.label} />
              </ListItemButton>
            ))}
          </List>
          <Stack spacing={1.5} mt={2}>
            <Button
              component="a"
              href="#contact"
              variant="contained"
              startIcon={<CalendarCheck size={18} />}
              onClick={closeDrawer}
            >
              Book Appointment
            </Button>
            <Button
              component="a"
              href={contactDetails.phoneHref}
              variant="outlined"
              startIcon={<Phone size={18} />}
              onClick={closeDrawer}
            >
              Call Now
            </Button>
          </Stack>
        </Box>
      </Drawer>
    </AppBar>
  );
}
