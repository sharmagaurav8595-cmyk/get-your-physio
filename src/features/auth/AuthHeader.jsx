import { Box, Button, Container, Stack, Typography } from "@mui/material";
import { ArrowLeft, Headphones } from "lucide-react";
import logo from "../../assets/logoNew.jpg";
import { goTo } from "./authStore.js";

export default function AuthHeader({ backTo = "/", backLabel = "Back to home" }) {
  return (
    <Box component="header" className="auth-header">
      <Container maxWidth="xl" className="auth-header-inner">
        <Box component="button" className="auth-brand" onClick={() => goTo("/")}>
          <span className="auth-brand-logo"><img src={logo} alt="" /></span>
          <span>
            <Typography component="span" className="auth-brand-name">GetYourPhysio.in</Typography>
            <Typography component="span" className="auth-brand-caption">Care that moves with you</Typography>
          </span>
        </Box>
        <Stack direction="row" spacing={1} alignItems="center">
          <Button className="auth-help-button" startIcon={<Headphones size={17} />}>Need help?</Button>
          <Button variant="outlined" startIcon={<ArrowLeft size={17} />} onClick={() => goTo(backTo)}>
            {backLabel}
          </Button>
        </Stack>
      </Container>
    </Box>
  );
}
