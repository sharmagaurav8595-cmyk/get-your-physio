import { useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  Container,
  InputAdornment,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import {
  ArrowRight,
  BadgeCheck,
  HeartPulse,
  LockKeyhole,
  Mail,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import AuthHeader from "../features/auth/AuthHeader.jsx";
import { goTo } from "../features/auth/authStore.js";
import { loginAccount, setSessionToken } from "../features/auth/api.js";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const login = async () => {
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const result = await loginAccount(email, "physio");
      setSessionToken(result.token);
      goTo("/dashboard/physio");
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box className="auth-page login-page">
      <AuthHeader />
      <Box className="auth-orb auth-orb-one" />
      <Box className="auth-orb auth-orb-two" />
      <Container maxWidth="xl" className="login-layout">
        <Box className="login-story auth-enter">
          <Chip icon={<Sparkles size={16} />} label="Your care journey, beautifully connected" className="auth-eyebrow" />
          <Typography component="h1" className="login-title">
            One secure place for <span>better movement.</span>
          </Typography>
          <Typography className="login-lead">
            GetYourPhysio.in gives Physiotherapists one simple place to manage their professional profile, patients and visits.
          </Typography>
          <Box className="trust-list">
            <Stack direction="row" spacing={1.5} alignItems="center">
              <span><ShieldCheck size={20} /></span>
              <Box><strong>Private by design</strong><small>Your personal and clinical details stay protected.</small></Box>
            </Stack>
            <Stack direction="row" spacing={1.5} alignItems="center">
              <span><HeartPulse size={20} /></span>
              <Box><strong>Care that remembers</strong><small>Profiles, visits and progress in one simple view.</small></Box>
            </Stack>
            <Stack direction="row" spacing={1.5} alignItems="center">
              <span><BadgeCheck size={20} /></span>
              <Box><strong>Verified professionals</strong><small>Qualification and registration-first onboarding.</small></Box>
            </Stack>
          </Box>
          <Box className="login-proof">
            <Box className="proof-avatars"><i>AS</i><i>RM</i><i>NK</i><i>+</i></Box>
            <Box><strong>Trusted care network</strong><Typography variant="caption">Built for modern Physiotherapy care</Typography></Box>
          </Box>
        </Box>

        <Paper elevation={0} className="login-card auth-enter auth-enter-delay">
          <Box className="login-card-icon"><LockKeyhole size={24} /></Box>
          <Typography variant="h4">Physio login</Typography>
          <Typography color="text.secondary" mt={0.75} mb={3}>Sign in to manage your professional workspace.</Typography>

          <Stack spacing={2}>
            <TextField
              label="Email address"
              value={email}
              error={Boolean(error)}
              helperText={error || "Enter the email used for your account."}
              onChange={(event) => setEmail(event.target.value)}
              onKeyDown={(event) => event.key === "Enter" && login()}
              InputProps={{ startAdornment: <InputAdornment position="start"><Mail size={19} /></InputAdornment> }}
            />
            <Button disabled={loading} variant="contained" size="large" endIcon={<ArrowRight size={19} />} onClick={login}>
              {loading ? "Signing in..." : "Login"}
            </Button>
          </Stack>

          <Box className="signup-divider"><span>New to GetYourPhysio.in?</span></Box>
          <Alert severity="success" icon={<BadgeCheck size={20} />} className="signup-prompt">
            Create your professional Physio profile in a few guided steps.
          </Alert>
          <Button
            fullWidth
            variant="outlined"
            size="large"
            endIcon={<ArrowRight size={18} />}
            onClick={() => goTo("/physio/register")}
          >
            Sign up as a Physio
          </Button>
          <Typography variant="caption" className="terms-copy">
            By continuing, you agree to our Terms of Service and Privacy Policy.
          </Typography>
        </Paper>
      </Container>
    </Box>
  );
}
