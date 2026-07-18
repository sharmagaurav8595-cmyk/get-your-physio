import { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogContent,
  IconButton,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { BadgeCheck, MailCheck, RefreshCw, X } from "lucide-react";

export default function OtpDialog({ open, target, type = "email", developmentOtp, onClose, onVerified, onResend }) {
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [seconds, setSeconds] = useState(30);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return undefined;
    setOtp("");
    setError("");
    setSeconds(30);
    const timer = window.setInterval(() => setSeconds((value) => Math.max(0, value - 1)), 1000);
    return () => window.clearInterval(timer);
  }, [open]);

  const verify = async () => {
    if (otp.length !== 6) {
      setError("Enter the complete 6-digit OTP.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await onVerified(otp);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  };

  const resend = async () => {
    setLoading(true);
    setError("");
    try {
      await onResend?.();
      setSeconds(30);
      setOtp("");
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogContent className="otp-dialog">
        <IconButton className="otp-close" onClick={onClose} aria-label="Close"><X size={20} /></IconButton>
        <Box className="otp-icon"><MailCheck size={30} /></Box>
        <Typography variant="h5" mt={2}>Check your {type}</Typography>
        <Typography color="text.secondary" mt={1}>
          We sent a verification code to <strong>{target || `your ${type}`}</strong>.
        </Typography>
        {developmentOtp && <Alert severity="info" className="demo-otp-alert">Development mode OTP: <strong>{developmentOtp}</strong>. Configure SMTP to deliver it by email.</Alert>}
        <TextField
          autoFocus
          label="6-digit OTP"
          value={otp}
          error={Boolean(error)}
          helperText={error}
          inputProps={{ maxLength: 6, inputMode: "numeric" }}
          onChange={(event) => setOtp(event.target.value.replace(/\D/g, ""))}
          onKeyDown={(event) => event.key === "Enter" && verify()}
        />
        <Button disabled={loading} fullWidth variant="contained" size="large" startIcon={<BadgeCheck size={19} />} onClick={verify}>
          {loading ? "Verifying..." : "Verify securely"}
        </Button>
        <Button
          fullWidth
          color="inherit"
          startIcon={<RefreshCw size={16} />}
          disabled={seconds > 0 || loading}
          onClick={resend}
        >
          {seconds > 0 ? `Resend code in ${seconds}s` : "Resend verification code"}
        </Button>
        <Stack direction="row" spacing={1} justifyContent="center" alignItems="center" className="secure-note">
          <BadgeCheck size={15} />
          <Typography variant="caption">Your details are protected and never shared.</Typography>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}
