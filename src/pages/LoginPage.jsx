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
  Stethoscope,
  UserRound,
} from "lucide-react";
import AuthHeader from "../features/auth/AuthHeader.jsx";
import OtpDialog from "../features/auth/OtpDialog.jsx";
import { goTo } from "../features/auth/authStore.js";
import { requestOtp, setSessionToken, verifyOtp } from "../features/auth/api.js";

const roles = {
  physio: {
    title: "I'm a Physio",
    description: "Manage your profile, patients, visits and professional journey.",
    icon: Stethoscope,
    accent: "teal",
  },
  patient: {
    title: "I'm a Patient",
    description: "Book care, follow your recovery and keep health details together.",
    icon: UserRound,
    accent: "blue",
  },
};

export default function LoginPage() {
  const [role, setRole] = useState("physio");
  const [email, setEmail] = useState("");
  const [otpOpen, setOtpOpen] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [developmentOtp, setDevelopmentOtp] = useState("");

  const sendOtp = async () => {
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const result = await requestOtp(email, role, "login");
      setDevelopmentOtp(result.developmentOtp || "");
      setOtpOpen(true);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  };

  const completeLogin = async (otp) => {
    const result = await verifyOtp(email, role, "login", otp);
    setSessionToken(result.token);
    goTo(`/dashboard/${role}`);
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
            Whether you provide care or receive it, GetYourPhysio.in helps every recovery feel more personal, simple and connected.
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
          <Typography variant="h4">Welcome back</Typography>
          <Typography color="text.secondary" mt={0.75}>Choose how you want to continue.</Typography>

          <Box className="role-selector" role="radiogroup" aria-label="Select account type">
            {Object.entries(roles).map(([key, item]) => {
              const Icon = item.icon;
              return (
                <button
                  type="button"
                  key={key}
                  className={`role-option role-option-${item.accent} ${role === key ? "is-active" : ""}`}
                  onClick={() => setRole(key)}
                  role="radio"
                  aria-checked={role === key}
                >
                  <span className="role-icon"><Icon size={23} /></span>
                  <span><strong>{item.title}</strong><small>{item.description}</small></span>
                  <span className="role-check"><BadgeCheck size={18} /></span>
                </button>
              );
            })}
          </Box>

          <Stack spacing={2}>
            <TextField
              label="Email address"
              value={email}
              error={Boolean(error)}
              helperText={error || "We'll send a one-time password to this email."}
              onChange={(event) => setEmail(event.target.value)}
              onKeyDown={(event) => event.key === "Enter" && sendOtp()}
              InputProps={{ startAdornment: <InputAdornment position="start"><Mail size={19} /></InputAdornment> }}
            />
            <Button disabled={loading} variant="contained" size="large" endIcon={<ArrowRight size={19} />} onClick={sendOtp}>
              {loading ? "Sending secure OTP..." : "Continue with email OTP"}
            </Button>
          </Stack>

          <Box className="signup-divider"><span>New to GetYourPhysio.in?</span></Box>
          <Alert severity="success" icon={<BadgeCheck size={20} />} className="signup-prompt">
            Create your {role === "physio" ? "professional" : "patient"} profile in a few guided steps.
          </Alert>
          <Button
            fullWidth
            variant="outlined"
            size="large"
            endIcon={<ArrowRight size={18} />}
            onClick={() => goTo(`/${role}/register`)}
          >
            Sign up as {role === "physio" ? "a Physio" : "a Patient"}
          </Button>
          <Typography variant="caption" className="terms-copy">
            By continuing, you agree to our Terms of Service and Privacy Policy.
          </Typography>
        </Paper>
      </Container>
      <OtpDialog
        open={otpOpen}
        target={email}
        developmentOtp={developmentOtp}
        onClose={() => setOtpOpen(false)}
        onVerified={completeLogin}
        onResend={async () => {
          const result = await requestOtp(email, role, "login");
          setDevelopmentOtp(result.developmentOtp || "");
        }}
      />
    </Box>
  );
}
