import { useState } from "react";
import { Alert, Box, Button, Chip, Container, InputAdornment, Paper, Stack, TextField, Typography } from "@mui/material";
import { ArrowRight, LockKeyhole, Mail, ShieldCheck, Sparkles } from "lucide-react";
import AuthHeader from "../features/auth/AuthHeader.jsx";
import { goTo } from "../features/auth/authStore.js";
import { loginAccount, setAdminSessionToken } from "../features/auth/api.js";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const login = async () => {
    if (!/^\S+@\S+\.\S+$/.test(email)) return setError("Enter the Admin email address.");
    setLoading(true); setError("");
    try {
      const result = await loginAccount(email, "admin");
      setAdminSessionToken(result.token);
      goTo("/admin");
    } catch (requestError) { setError(requestError.message); }
    finally { setLoading(false); }
  };

  return (
    <Box className="auth-page admin-login-page">
      <AuthHeader />
      <Container maxWidth="lg" className="admin-login-layout">
        <Box className="admin-login-story auth-enter">
          <Chip icon={<Sparkles size={15} />} label="GetYourPhysio operations" className="auth-eyebrow" />
          <Typography component="h1">A clear view of every care connection.</Typography>
          <Typography color="text.secondary">Review appointment requests, find patients by location, and manage the growing Physio network from one protected workspace.</Typography>
          <Stack spacing={1.5} className="admin-security-list">
            <span><ShieldCheck size={19} />Separate Admin-only access</span>
            <span><LockKeyhole size={19} />Direct email sign-in</span>
            <span><LockKeyhole size={19} />12-hour expiring Admin session</span>
          </Stack>
        </Box>
        <Paper elevation={0} className="login-card admin-login-card auth-enter auth-enter-delay">
          <Box className="login-card-icon"><ShieldCheck size={25} /></Box>
          <Typography variant="h4" mt={2}>Admin sign in</Typography>
          <Typography color="text.secondary" mt={1}>Use an email registered through the server Admin command.</Typography>
          {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
          <Stack spacing={2} mt={3}>
            <TextField label="Admin email" value={email} onChange={(event) => setEmail(event.target.value)} onKeyDown={(event) => event.key === "Enter" && login()} InputProps={{ startAdornment: <InputAdornment position="start"><Mail size={18} /></InputAdornment> }} />
            <Button disabled={loading} variant="contained" size="large" endIcon={<ArrowRight size={18} />} onClick={login}>{loading ? "Signing in..." : "Login"}</Button>
          </Stack>
          <Button color="inherit" fullWidth sx={{ mt: 2 }} onClick={() => goTo("/login")}>Physio login</Button>
        </Paper>
      </Container>
    </Box>
  );
}
