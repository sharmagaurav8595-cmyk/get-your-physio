import { useState } from "react";
import {
  Box,
  Button,
  Card,
  CardActionArea,
  CardContent,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";
import { CalendarCheck, X } from "lucide-react";
import { services } from "../data/services.js";
import SectionHeading from "./SectionHeading.jsx";

export default function ServicesSection() {
  const [selectedService, setSelectedService] = useState(null);

  const closeDialog = () => setSelectedService(null);
  const SelectedIcon = selectedService?.icon;

  return (
    <Box id="services" component="section" className="section-block">
      <Container maxWidth="xl">
        <SectionHeading
          eyebrow="Our Services"
          title="Physiotherapy and Sports recovery support built around your goals"
          description="Start with athlete-focused recovery, sports injury rehab, strength, mobility, posture, and home Physiotherapy care for every stage of movement."
        />
        <Box className="service-grid">
          {services.map(({ title, description, icon: Icon, bestFor }) => (
            <Card key={title} className="service-card" elevation={0}>
              <CardActionArea
                className="service-action"
                onClick={() => setSelectedService({ title, description, icon: Icon, bestFor })}
                aria-label={`View details for ${title}`}
              >
                <CardContent>
                  <Box className="service-icon">
                    <Icon size={28} />
                  </Box>
                  <Typography variant="h6" component="h3">
                    {title}
                  </Typography>
                  <Typography color="text.secondary">{description}</Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          ))}
        </Box>
      </Container>

      <Dialog
        open={Boolean(selectedService)}
        onClose={closeDialog}
        fullWidth
        maxWidth="sm"
        aria-labelledby="service-dialog-title"
        PaperProps={{ className: "service-dialog" }}
      >
        <DialogTitle id="service-dialog-title" className="service-dialog-title">
          <Stack direction="row" spacing={1.5} alignItems="center">
            {SelectedIcon ? (
              <Box className="service-icon service-dialog-icon">
                <SelectedIcon size={28} />
              </Box>
            ) : null}
            <Typography variant="h5" component="span">
              {selectedService?.title}
            </Typography>
          </Stack>
          <IconButton onClick={closeDialog} aria-label="Close service details">
            <X size={20} />
          </IconButton>
        </DialogTitle>
        <DialogContent className="service-dialog-content">
          <Typography color="text.secondary">{selectedService?.description}</Typography>
          <Box className="best-for-panel">
            <Typography variant="subtitle2" component="h3">
              Best for
            </Typography>
            <Typography>{selectedService?.bestFor}</Typography>
          </Box>
        </DialogContent>
        <DialogActions className="service-dialog-actions">
          <Button onClick={closeDialog} color="inherit">
            Close
          </Button>
          <Button
            component="a"
            href="#contact"
            variant="contained"
            startIcon={<CalendarCheck size={18} />}
            onClick={closeDialog}
          >
            Book Consultation
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
