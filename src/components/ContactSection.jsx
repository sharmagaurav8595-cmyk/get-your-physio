import { useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Container,
  FormControlLabel,
  MenuItem,
  Paper,
  Snackbar,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { Laptop, MapPin, Phone, Send, ShieldCheck } from "lucide-react";
import SectionHeading from "./SectionHeading.jsx";
import { contactDetails } from "../data/contact.js";

const concernOptions = [
  "Sports injury rehabilitation",
  "Post exercise recovery",
  "Knee pain management",
  "Back pain and sciatica",
  "Neck and shoulder pain",
  "Post-surgery rehab",
  "Posture correction",
  "Senior citizen Physiotherapy",
  "Home Physiotherapy",
  "Cupping / taping / needling",
  "Other",
];

const initialForm = {
  name: "",
  phone: "",
  age: "",
  concern: "",
  preferredDate: "",
  homeVisit: false,
  message: "",
};

export default function ContactSection() {
  const [form, setForm] = useState(initialForm);
  const [success, setSuccess] = useState(false);

  const minDate = useMemo(() => new Date().toISOString().split("T")[0], []);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setForm((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const subject = encodeURIComponent("New appointment request - GetYourPhysio.in");
    const body = encodeURIComponent(
      [
        "New appointment request from GetYourPhysio.in",
        "",
        `Name: ${form.name}`,
        `Phone: ${form.phone}`,
        `Age: ${form.age}`,
        `Issue / Concern: ${form.concern}`,
        `Preferred date: ${form.preferredDate}`,
        `Home Physiotherapy preferred: ${form.homeVisit ? "Yes" : "No"}`,
        `Message: ${form.message || "No message provided"}`,
      ].join("\n"),
    );

    window.location.href = `mailto:${contactDetails.appointmentEmail}?subject=${subject}&body=${body}`;
    setSuccess(true);
    setForm(initialForm);
  };

  return (
    <Box id="contact" component="section" className="section-block contact-section">
      <Container maxWidth="xl">
        <Box className="contact-grid">
          <Box>
            <SectionHeading
              align="left"
              eyebrow="Contact"
              title="Book a consultation with GetYourPhysio.in"
              description="Share your details and our team will call you to understand your recovery goal, issue, and best Physiotherapy support option."
            />
            <Stack spacing={2} className="contact-info">
              <Box className="contact-info-item">
                <Phone size={24} />
                <Box>
                  <Typography variant="h6">Call for quick support</Typography>
                  <Typography component="a" href={contactDetails.phoneHref}>
                    {contactDetails.phoneDisplay}
                  </Typography>
                </Box>
              </Box>
              <Box className="contact-info-item">
                <MapPin size={24} />
                <Box>
                  <Typography variant="h6">Home Physiotherapy support</Typography>
                  <Typography color="text.secondary">
                    Flexible home visit slots for recovery, mobility, posture, and senior care.
                  </Typography>
                </Box>
              </Box>
              <Box className="contact-info-item">
                <Laptop size={24} />
                <Box>
                  <Typography variant="h6">Online guidance available</Typography>
                  <Typography color="text.secondary">
                    Consultation-style support for exercise review, posture correction, and follow-up.
                  </Typography>
                </Box>
              </Box>
              <Box className="contact-info-item">
                <ShieldCheck size={24} />
                <Box>
                  <Typography variant="h6">Safe care for senior citizens</Typography>
                  <Typography color="text.secondary">
                    Treatment plans are adapted for comfort, balance, and medical history.
                  </Typography>
                </Box>
              </Box>
            </Stack>
          </Box>

          <Paper component="form" className="appointment-form" elevation={0} onSubmit={handleSubmit}>
            <Typography variant="h5" component="h3">
              Appointment Request
            </Typography>
            <Typography color="text.secondary" mb={2}>
              We will call you shortly after submission.
            </Typography>
            <Box className="form-grid">
              <TextField
                label="Full name"
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                autoComplete="name"
              />
              <TextField
                label="Phone number"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                required
                autoComplete="tel"
                inputProps={{ inputMode: "tel" }}
              />
              <TextField
                label="Age"
                name="age"
                type="number"
                value={form.age}
                onChange={handleChange}
                required
                inputProps={{ min: 1, max: 120 }}
              />
              <TextField
                select
                label="Your Issue / Concern"
                name="concern"
                value={form.concern}
                onChange={handleChange}
                required
              >
                {concernOptions.map((area) => (
                  <MenuItem key={area} value={area}>
                    {area}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                className="date-field"
                label="Preferred date"
                name="preferredDate"
                type="date"
                value={form.preferredDate}
                onChange={handleChange}
                required
                InputLabelProps={{ shrink: true }}
                inputProps={{ min: minDate }}
              />
              <FormControlLabel
                className="home-visit-check"
                control={
                  <Checkbox
                    name="homeVisit"
                    checked={form.homeVisit}
                    onChange={handleChange}
                    color="secondary"
                  />
                }
                label="Home Physiotherapy preferred"
              />
            </Box>
            <TextField
              label="Message"
              name="message"
              value={form.message}
              onChange={handleChange}
              multiline
              minRows={4}
              sx={{ mt: 2 }}
            />
            <Button
              type="submit"
              variant="contained"
              size="large"
              fullWidth
              startIcon={<Send size={19} />}
              sx={{ mt: 2.5 }}
            >
              Submit Request
            </Button>
          </Paper>
        </Box>
      </Container>

      <Snackbar
        open={success}
        autoHideDuration={5000}
        onClose={() => setSuccess(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity="success" variant="filled" onClose={() => setSuccess(false)}>
          Thank you! Our team will contact you shortly.
        </Alert>
      </Snackbar>
    </Box>
  );
}
