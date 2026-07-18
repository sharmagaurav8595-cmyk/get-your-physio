import { useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  Container,
  LinearProgress,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  BriefcaseMedical,
  Check,
  FileCheck2,
  GraduationCap,
  LocateFixed,
  Mail,
  MapPin,
  ShieldCheck,
  Smartphone,
  Sparkles,
  UploadCloud,
  UserRound,
} from "lucide-react";
import AuthHeader from "../features/auth/AuthHeader.jsx";
import OtpDialog from "../features/auth/OtpDialog.jsx";
import { goTo } from "../features/auth/authStore.js";
import { registerAccount, requestOtp, verifyOtp } from "../features/auth/api.js";

const physioSteps = [
  { label: "Personal info", caption: "Tell us about you", icon: UserRound },
  { label: "Address", caption: "Where you practise", icon: MapPin },
  { label: "Qualification", caption: "Professional details", icon: GraduationCap },
];

const patientSteps = [
  { label: "Basic info", caption: "Let's know you", icon: UserRound },
  { label: "Care & location", caption: "Personalise your care", icon: MapPin },
];

const initialForm = {
  name: "",
  age: "",
  gender: "",
  mobile: "",
  email: "",
  address: "",
  city: "",
  state: "",
  pincode: "",
  landmark: "",
  qualification: "",
  degree: "",
  registrationNumber: "",
  degreeFile: "",
  concern: "",
  preferredCare: "Home visit",
};

function FormField({ name, form, setForm, ...props }) {
  return (
    <TextField
      name={name}
      value={form[name]}
      onChange={(event) => setForm((current) => ({ ...current, [name]: event.target.value }))}
      {...props}
    />
  );
}

export default function OnboardingPage({ role }) {
  const isPhysio = role === "physio";
  const steps = isPhysio ? physioSteps : patientSteps;
  const [activeStep, setActiveStep] = useState(0);
  const [form, setForm] = useState(initialForm);
  const [verified, setVerified] = useState({ email: false });
  const [otpType, setOtpType] = useState(null);
  const [developmentOtp, setDevelopmentOtp] = useState("");
  const [emailVerificationToken, setEmailVerificationToken] = useState("");
  const [degreeDocument, setDegreeDocument] = useState(null);
  const [location, setLocation] = useState(null);
  const [locationStatus, setLocationStatus] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const progress = ((activeStep + 1) / steps.length) * 100;
  const currentStep = steps[activeStep];
  const CurrentIcon = currentStep.icon;

  const title = useMemo(() => {
    if (activeStep === 0) return isPhysio ? "Build your professional profile" : "Tell us a little about yourself";
    if (activeStep === 1) return isPhysio ? "Where can patients find you?" : "Help us personalise your care";
    return "Add your professional credentials";
  }, [activeStep, isPhysio]);

  const openOtp = async () => {
    if (!form.email.trim()) {
      setError("Please enter your email first.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const result = await requestOtp(form.email, role, "registration");
      setDevelopmentOtp(result.developmentOtp || "");
      setOtpType("email");
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  };

  const detectLocation = () => {
    setLocationStatus("Locating you...");
    if (!navigator.geolocation) {
      setLocationStatus("Location is not supported in this browser. Please type your address.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setLocation({ lat: coords.latitude.toFixed(5), lng: coords.longitude.toFixed(5) });
        setLocationStatus("Location pinned successfully. Add the address details for accuracy.");
      },
      () => setLocationStatus("We couldn't access your location. You can type it manually instead."),
      { enableHighAccuracy: true, timeout: 8000 },
    );
  };

  const validateStep = () => {
    let required = [];
    if (activeStep === 0) required = ["name", "age", "gender", "mobile", "email"];
    if (activeStep === 1) required = isPhysio ? ["address", "city", "state", "pincode"] : ["concern", "address", "city"];
    if (isPhysio && activeStep === 2) required = ["qualification", "degree", "registrationNumber", "degreeFile"];
    const missing = required.find((field) => !String(form[field] || "").trim());
    if (missing) {
      setError("Please complete all required details before continuing.");
      return false;
    }
    if (activeStep === 0 && !verified.email) {
      setError("Please verify your email before continuing.");
      return false;
    }
    setError("");
    return true;
  };

  const next = async () => {
    if (!validateStep()) return;
    if (activeStep < steps.length - 1) {
      setActiveStep((step) => step + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    setLoading(true);
    try {
      await registerAccount(role, { ...form, location }, emailVerificationToken, degreeDocument);
      goTo(`/dashboard/${role}`);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box className="auth-page onboarding-page">
      <AuthHeader backTo="/login" backLabel="Back to login" />
      <Container maxWidth="xl" className="onboarding-layout">
        <Box className="onboarding-aside auth-enter">
          <Chip
            icon={isPhysio ? <BriefcaseMedical size={16} /> : <Sparkles size={16} />}
            label={isPhysio ? "Join our trusted care network" : "Your recovery starts here"}
            className="auth-eyebrow"
          />
          <Typography component="h1">
            {isPhysio ? "Create a profile patients can trust." : "Care shaped around your life."}
          </Typography>
          <Typography color="text.secondary">
            {isPhysio
              ? "Complete your verified profile and bring your expertise closer to people who need it."
              : "Share only what helps us connect you with the right Physiotherapy support."}
          </Typography>
          <Box className="onboarding-benefits">
            {(isPhysio
              ? ["Verified professional identity", "Simple patient and visit management", "A profile you can update anytime"]
              : ["Faster appointment requests", "Your visits and recovery in one view", "Location-aware home care support"]
            ).map((benefit) => <span key={benefit}><Check size={17} />{benefit}</span>)}
          </Box>
          <Paper elevation={0} className="privacy-card">
            <ShieldCheck size={24} />
            <Box><strong>Your privacy matters</strong><Typography variant="body2">Your information is used only to support your care experience.</Typography></Box>
          </Paper>
        </Box>

        <Paper elevation={0} className="onboarding-card auth-enter auth-enter-delay">
          <Box className="mobile-progress-copy">
            <span>Step {activeStep + 1} of {steps.length}</span><strong>{Math.round(progress)}% complete</strong>
          </Box>
          <LinearProgress variant="determinate" value={progress} className="onboarding-progress" />
          <Box className="custom-stepper">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const state = index < activeStep ? "done" : index === activeStep ? "active" : "";
              return (
                <Box key={step.label} className={`custom-step ${state}`}>
                  <span>{index < activeStep ? <Check size={18} /> : <Icon size={18} />}</span>
                  <Box><strong>{step.label}</strong><small>{step.caption}</small></Box>
                </Box>
              );
            })}
          </Box>

          <Box className="form-heading">
            <span><CurrentIcon size={24} /></span>
            <Box><Typography variant="h4">{title}</Typography><Typography color="text.secondary">Fields marked with * are required.</Typography></Box>
          </Box>

          {error && <Alert severity="warning" className="form-alert">{error}</Alert>}

          {activeStep === 0 && (
            <Box className="onboarding-form-grid">
              <FormField name="name" form={form} setForm={setForm} label="Full name *" className="field-wide" />
              <FormField name="age" form={form} setForm={setForm} label="Age *" type="number" inputProps={{ min: 1, max: 110 }} />
              <FormField name="gender" form={form} setForm={setForm} label="Gender *" select>
                <MenuItem value="Female">Female</MenuItem><MenuItem value="Male">Male</MenuItem>
              </FormField>
              <Box className="verification-field field-wide">
                <FormField name="mobile" form={form} setForm={setForm} label="Mobile number *" InputProps={{ startAdornment: <Smartphone size={18} className="input-icon" /> }} />
              </Box>
              <Box className="verification-field field-wide">
                <FormField name="email" form={form} setForm={setForm} label="Email address *" InputProps={{ startAdornment: <Mail size={18} className="input-icon" /> }} />
                <Button disabled={loading} variant={verified.email ? "text" : "outlined"} color={verified.email ? "success" : "primary"} startIcon={verified.email ? <BadgeCheck size={17} /> : null} onClick={openOtp}>
                  {verified.email ? "Verified" : "Verify email"}
                </Button>
              </Box>
            </Box>
          )}

          {activeStep === 1 && (
            <Box className="onboarding-form-grid">
              {!isPhysio && (
                <>
                  <FormField name="concern" form={form} setForm={setForm} label="What would you like help with? *" placeholder="For example: back pain or sports recovery" className="field-wide" />
                  <FormField name="preferredCare" form={form} setForm={setForm} label="Preferred care" select className="field-wide">
                    <MenuItem value="Home visit">Home consultation</MenuItem><MenuItem value="Online consultation">Online consultation</MenuItem>
                  </FormField>
                </>
              )}
              <Box className="map-picker field-wide">
                <Box className="map-grid-lines" />
                <span className="map-pin-pulse"><MapPin size={24} /></span>
                <Box className="map-copy">
                  <strong>{location ? "Location pinned" : "Set your location"}</strong>
                  <small>{location ? `${location.lat}, ${location.lng}` : "Use your current location or type the address below"}</small>
                </Box>
                <Button variant="contained" startIcon={<LocateFixed size={17} />} onClick={detectLocation}>Use current location</Button>
              </Box>
              {locationStatus && <Alert severity={location ? "success" : "info"} className="field-wide">{locationStatus}</Alert>}
              <FormField name="address" form={form} setForm={setForm} label={`${isPhysio ? "Clinic / practice address" : "Address"} *`} multiline minRows={2} className="field-wide" />
              <FormField name="city" form={form} setForm={setForm} label="City *" />
              <FormField name="state" form={form} setForm={setForm} label={isPhysio ? "State *" : "State"} />
              <FormField name="pincode" form={form} setForm={setForm} label={isPhysio ? "PIN code *" : "PIN code"} inputProps={{ maxLength: 6 }} />
              <FormField name="landmark" form={form} setForm={setForm} label="Nearby landmark" />
            </Box>
          )}

          {isPhysio && activeStep === 2 && (
            <Box className="onboarding-form-grid">
              <FormField name="qualification" form={form} setForm={setForm} label="Highest qualification *" select className="field-wide">
                <MenuItem value="Bachelor of Physiotherapy">Bachelor of Physiotherapy (BPT)</MenuItem>
                <MenuItem value="Master of Physiotherapy">Master of Physiotherapy (MPT)</MenuItem>
                <MenuItem value="Doctor of Physiotherapy">Doctor of Physiotherapy (DPT)</MenuItem>
                <MenuItem value="Other">Other recognised qualification</MenuItem>
              </FormField>
              <FormField name="degree" form={form} setForm={setForm} label="Degree / specialisation *" placeholder="For example: MPT - Sports" />
              <FormField name="registrationNumber" form={form} setForm={setForm} label="Registration number *" />
              <Box component="label" className={`degree-upload field-wide ${form.degreeFile ? "has-file" : ""}`}>
                <input
                  type="file"
                  accept="application/pdf,.pdf"
                  onChange={(event) => {
                    const file = event.target.files?.[0] || null;
                    setDegreeDocument(file);
                    setForm((current) => ({ ...current, degreeFile: file?.name || "" }));
                  }}
                />
                <span>{form.degreeFile ? <FileCheck2 size={28} /> : <UploadCloud size={28} />}</span>
                <Box>
                  <strong>{form.degreeFile || "Upload degree certificate (PDF) *"}</strong>
                  <small>{form.degreeFile ? "Document ready for verification" : "Click to choose a PDF, up to 10 MB"}</small>
                </Box>
                <Chip label={form.degreeFile ? "Selected" : "Choose PDF"} color={form.degreeFile ? "success" : "primary"} variant="outlined" />
              </Box>
              <Alert severity="info" className="field-wide">Your profile will display a verification badge after the credentials are reviewed.</Alert>
            </Box>
          )}

          <Stack direction="row" justifyContent="space-between" className="onboarding-actions">
            <Button
              color="inherit"
              startIcon={<ArrowLeft size={18} />}
              onClick={() => activeStep === 0 ? goTo("/login") : setActiveStep((step) => step - 1)}
            >
              {activeStep === 0 ? "Back to login" : "Previous"}
            </Button>
            <Button disabled={loading} variant="contained" size="large" endIcon={activeStep === steps.length - 1 ? <BadgeCheck size={18} /> : <ArrowRight size={18} />} onClick={next}>
              {loading ? "Saving..." : activeStep === steps.length - 1 ? "Complete profile" : "Save & continue"}
            </Button>
          </Stack>
        </Paper>
      </Container>
      <OtpDialog
        open={Boolean(otpType)}
        type={otpType}
        target={otpType ? form[otpType] : ""}
        developmentOtp={developmentOtp}
        onClose={() => setOtpType(null)}
        onVerified={async (otp) => {
          const result = await verifyOtp(form.email, role, "registration", otp);
          setEmailVerificationToken(result.verificationToken);
          setVerified({ email: true });
          setOtpType(null);
        }}
        onResend={async () => {
          const result = await requestOtp(form.email, role, "registration");
          setDevelopmentOtp(result.developmentOtp || "");
        }}
      />
    </Box>
  );
}
