import { Box, Chip, Typography } from "@mui/material";

export default function SectionHeading({ eyebrow, title, description, align = "center" }) {
  return (
    <Box className="section-heading" sx={{ textAlign: align }}>
      {eyebrow && (
        <Chip
          label={eyebrow}
          color="secondary"
          variant="outlined"
          className="eyebrow-chip"
        />
      )}
      <Typography component="h2" variant="h3" className="section-title">
        {title}
      </Typography>
      {description && (
        <Typography variant="body1" color="text.secondary" className="section-description">
          {description}
        </Typography>
      )}
    </Box>
  );
}
