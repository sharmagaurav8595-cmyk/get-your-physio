import { useEffect, useState } from "react";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Chip,
  CircularProgress,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  LinearProgress,
  MenuItem,
  Paper,
  Popover,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import {
  Activity,
  BadgeCheck,
  Bell,
  CalendarDays,
  ChevronRight,
  CircleUserRound,
  Clock3,
  Edit3,
  FileText,
  HeartPulse,
  Home,
  LogOut,
  MapPin,
  Menu,
  MessageCircle,
  Search,
  Sparkles,
  Stethoscope,
  TrendingUp,
  Users,
  X,
} from "lucide-react";
import logo from "../assets/logoNew.jpg";
import { contactDetails } from "../data/contact.js";
import { goTo } from "../features/auth/authStore.js";
import { createAppointment, getDashboard, logout, updateProfile } from "../features/auth/api.js";

const emptyProfile = { name: "", email: "", age: "", gender: "", mobile: "", address: "" };

function DashboardSidebar({ role, activeView, mobileOpen, onClose, onLogout, onNavigate }) {
  const items = role === "physio"
    ? [["overview", Home, "Overview"], ["patients", Users, "My patients"], ["schedule", CalendarDays, "Schedule"], ["reports", FileText, "Reports"], ["messages", MessageCircle, "Messages"]]
    : [["overview", Home, "Overview"], ["appointments", CalendarDays, "Appointments"], ["recovery", Activity, "My recovery"], ["health", FileText, "Health details"], ["messages", MessageCircle, "Messages"]];
  return (
    <aside className={`dashboard-sidebar ${mobileOpen ? "is-open" : ""}`}>
      <Box className="dashboard-brand" onClick={() => goTo("/")}>
        <span><img src={logo} alt="" /></span><Box><strong>GetYourPhysio.in</strong><small>{role === "physio" ? "Physio workspace" : "Patient care"}</small></Box>
      </Box>
      <IconButton className="sidebar-close" onClick={onClose}><X /></IconButton>
      <nav className="dashboard-nav">
        {items.map(([key, Icon, label]) => <button className={activeView === key ? "is-active" : ""} key={key} onClick={() => { onNavigate(key); onClose(); }}><Icon size={19} /><span>{label}</span>{key !== "overview" && <ChevronRight size={16} />}</button>)}
      </nav>
      <Paper elevation={0} className="sidebar-support">
        <span><HeartPulse size={21} /></span><strong>Need support?</strong><small>Our care team is here to help.</small><Button component="a" href={contactDetails.whatsappHref} target="_blank" rel="noreferrer" size="small">Contact support</Button>
      </Paper>
      <button className="sidebar-logout" onClick={onLogout}><LogOut size={18} />Log out</button>
    </aside>
  );
}

function StatCard({ icon: Icon, label, value, note, tone }) {
  return <Paper elevation={0} className={`dashboard-stat stat-${tone}`}><span><Icon size={22} /></span><Box><Typography color="text.secondary">{label}</Typography><Typography variant="h4">{value}</Typography><small>{note}</small></Box></Paper>;
}

function ProfileDialog({ open, role, profile, onClose, onSave }) {
  const [draft, setDraft] = useState(profile);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => setDraft(profile), [profile, open]);
  const update = (field) => (event) => setDraft((current) => ({ ...current, [field]: event.target.value }));
  const save = async () => {
    setSaving(true); setError("");
    try { await onSave(draft); } catch (requestError) { setError(requestError.message); }
    finally { setSaving(false); }
  };
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle className="profile-dialog-title"><Box><Typography variant="h5">Edit your profile</Typography><Typography color="text.secondary" variant="body2">Changes are saved securely to your account.</Typography></Box><IconButton onClick={onClose}><X /></IconButton></DialogTitle>
      <DialogContent className="profile-dialog-content">
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <Box className="profile-form-grid">
          <TextField label="Full name" value={draft.name || ""} onChange={update("name")} className="field-wide" />
          <TextField label="Age" value={draft.age || ""} onChange={update("age")} />
          <TextField select label="Gender" value={draft.gender || ""} onChange={update("gender")}><MenuItem value="Female">Female</MenuItem><MenuItem value="Male">Male</MenuItem><MenuItem value="Non-binary">Non-binary</MenuItem><MenuItem value="Prefer not to say">Prefer not to say</MenuItem></TextField>
          <TextField label="Mobile" value={draft.mobile || ""} onChange={update("mobile")} />
          <TextField label="Email" value={draft.email || ""} disabled helperText="Email changes require reverification." />
          <TextField label="Address" value={draft.address || ""} onChange={update("address")} multiline minRows={2} className="field-wide" />
          {role === "physio" ? <><TextField label="Qualification" value={draft.qualification || ""} onChange={update("qualification")} /><TextField label="Registration number" value={draft.registrationNumber || ""} onChange={update("registrationNumber")} /></> : <TextField label="Primary concern" value={draft.concern || ""} onChange={update("concern")} className="field-wide" />}
        </Box>
      </DialogContent>
      <DialogActions className="profile-dialog-actions"><Button onClick={onClose}>Cancel</Button><Button disabled={saving} variant="contained" startIcon={<BadgeCheck size={18} />} onClick={save}>{saving ? "Saving..." : "Save changes"}</Button></DialogActions>
    </Dialog>
  );
}

function PatientBookingDialog({ open, onClose, onCreated }) {
  const [form, setForm] = useState({ careType: "Home visit", scheduledAt: "" });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const field = (name) => ({ value: form[name], onChange: (event) => setForm((current) => ({ ...current, [name]: event.target.value })) });
  const submit = async () => {
    setSaving(true); setError("");
    try {
      await createAppointment(form);
      setForm({ careType: "Home visit", scheduledAt: "" });
      await onCreated();
      onClose();
    } catch (requestError) { setError(requestError.message); }
    finally { setSaving(false); }
  };
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle className="profile-dialog-title"><Box><Typography variant="h5">Request a session</Typography><Typography color="text.secondary" variant="body2">Choose how you want the consultation and your preferred time. The care team will assign the appropriate Physio.</Typography></Box><IconButton onClick={onClose}><X /></IconButton></DialogTitle>
      <DialogContent className="profile-dialog-content">
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <Box className="profile-form-grid">
          <TextField select label="Consultation type *" {...field("careType")} className="field-wide"><MenuItem value="Home visit">Home consultation</MenuItem><MenuItem value="Online consultation">Online consultation</MenuItem></TextField>
          <TextField type="datetime-local" label="Preferred date and time *" {...field("scheduledAt")} InputLabelProps={{ shrink: true }} inputProps={{ min: new Date().toISOString().slice(0, 16) }} className="field-wide" />
        </Box>
      </DialogContent>
      <DialogActions className="profile-dialog-actions"><Button onClick={onClose}>Cancel</Button><Button disabled={saving} variant="contained" onClick={submit}>{saving ? "Saving..." : "Request session"}</Button></DialogActions>
    </Dialog>
  );
}

function EmptyDashboardList({ role, onAction }) {
  const isPhysio = role === "physio";
  return <Box className="dashboard-empty"><span>{isPhysio ? <Users size={28} /> : <CalendarDays size={28} />}</span><Typography variant="h6">{isPhysio ? "No assigned bookings yet" : "No appointments yet"}</Typography><Typography color="text.secondary">{isPhysio ? "Bookings assigned to you by the Admin will appear here." : "Request your first session and it will appear here."}</Typography>{!isPhysio && <Button variant="outlined" onClick={onAction}>Request a session</Button>}</Box>;
}

function DashboardWorkspace({ view, isPhysio, visits, appointments, onBook }) {
  const records = isPhysio ? visits : appointments;
  const completed = records.filter((item) => item.status === "completed");
  const patients = Array.from(new Map(visits.map((visit) => [visit.patient_email || visit.patient_name, visit])).values());
  const config = {
    patients: ["My patients", "Patients assigned to you through confirmed bookings"],
    schedule: ["Schedule", "All your assigned consultations in one place"],
    reports: ["Visit reports", "Completed consultations and saved care history"],
    appointments: ["Appointments", "Your requested and confirmed Physiotherapy sessions"],
    recovery: ["My recovery", "Your completed sessions and recovery activity"],
    health: ["Health details", "Your recorded care history and consultation details"],
    messages: ["Support & messages", "Connect directly with the GetYourPhysio.in care team"],
  }[view];

  if (view === "messages") return (
    <Paper elevation={0} className="dashboard-panel dashboard-workspace auth-enter">
      <Box className="workspace-heading"><span><MessageCircle size={24} /></span><Box><Typography variant="h4">{config[0]}</Typography><Typography color="text.secondary">{config[1]}</Typography></Box></Box>
      <Box className="dashboard-support-view">
        <Box><Typography variant="h5">How can we help?</Typography><Typography color="text.secondary">For booking changes, patient assignments, profile verification, or account assistance, contact our care team.</Typography></Box>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
          <Button component="a" href={contactDetails.whatsappHref} target="_blank" rel="noreferrer" variant="contained" startIcon={<MessageCircle size={18} />}>Chat on WhatsApp</Button>
          <Button component="a" href={`mailto:${contactDetails.publicEmail}`} variant="outlined">Email support</Button>
        </Stack>
      </Box>
    </Paper>
  );

  const displayRecords = view === "patients" ? patients : (["reports", "recovery", "health"].includes(view) ? completed : records);
  return (
    <Paper elevation={0} className="dashboard-panel dashboard-workspace auth-enter">
      <Box className="workspace-heading"><span>{view === "patients" ? <Users size={24} /> : view === "schedule" || view === "appointments" ? <CalendarDays size={24} /> : <FileText size={24} />}</span><Box><Typography variant="h4">{config[0]}</Typography><Typography color="text.secondary">{config[1]}</Typography></Box>{!isPhysio && view === "appointments" && <Button variant="contained" onClick={onBook}>Book a session</Button>}</Box>
      {displayRecords.length ? <Box className="workspace-list">
        {displayRecords.map((item, index) => {
          const name = view === "patients" ? item.patient_name : (isPhysio ? item.patient_name : item.title);
          const subtitle = view === "patients" ? item.patient_email : (isPhysio ? item.patient_email : `Physio: ${item.physio_name || "Not assigned yet"}`);
          return <Box className="workspace-row" key={item.id || `${name}-${index}`}>
            <Box className="workspace-person"><Avatar className={`avatar-${["blue", "teal", "purple", "orange"][index % 4]}`}>{name?.slice(0, 1) || "P"}</Avatar><Box><strong>{name || "Patient"}</strong><small>{subtitle}</small></Box></Box>
            <Box className="workspace-detail"><small>{view === "patients" ? "Latest consultation" : "Consultation"}</small><strong>{item.care_type || item.concern || "Physiotherapy session"}</strong></Box>
            <Box className="workspace-detail"><small>Date & time</small><strong>{item.scheduled_at ? formatDate(item.scheduled_at) : "To be scheduled"}</strong></Box>
            <Chip size="small" label={item.status || "active"} color={item.status === "completed" ? "success" : "primary"} variant="outlined" />
          </Box>;
        })}
      </Box> : <Box className="dashboard-empty"><span>{view === "patients" ? <Users size={28} /> : <FileText size={28} />}</span><Typography variant="h6">Nothing to show yet</Typography><Typography color="text.secondary">{view === "patients" ? "Patients will appear after the Admin assigns bookings to you." : "Your records will appear here as consultations are scheduled and completed."}</Typography></Box>}
    </Paper>
  );
}

const formatDate = (value) => new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
const credentialBadge = {
  verified: { label: "Credentials verified", color: "success" },
  rejected: { label: "Credentials rejected", color: "error" },
  pending: { label: "Verification pending", color: "warning" },
};

export default function DashboardPage({ role }) {
  const isPhysio = role === "physio";
  const [profile, setProfile] = useState(emptyProfile);
  const [dashboard, setDashboard] = useState({ stats: {}, visits: [], appointments: [] });
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState("");
  const [editOpen, setEditOpen] = useState(false);
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeView, setActiveView] = useState("overview");
  const [notificationAnchor, setNotificationAnchor] = useState(null);
  const [notificationsSeen, setNotificationsSeen] = useState(false);

  const load = async () => {
    try {
      const result = await getDashboard();
      if (result.profile.role !== role) return goTo(`/dashboard/${result.profile.role}`);
      setProfile(result.profile);
      setDashboard(result);
      setPageError("");
    } catch (error) {
      if (error.status === 401) return goTo("/login");
      setPageError(error.message);
    } finally { setLoading(false); }
  };
  useEffect(() => {
    load();
    const refresh = () => load();
    const refreshWhenVisible = () => document.visibilityState === "visible" && load();
    const refreshFromAdminTab = (event) => {
      if (event.key === "gyp-credential-status-updated-at") load();
    };
    const refreshTimer = window.setInterval(load, 15_000);
    window.addEventListener("focus", refresh);
    window.addEventListener("storage", refreshFromAdminTab);
    document.addEventListener("visibilitychange", refreshWhenVisible);
    return () => {
      window.clearInterval(refreshTimer);
      window.removeEventListener("focus", refresh);
      window.removeEventListener("storage", refreshFromAdminTab);
      document.removeEventListener("visibilitychange", refreshWhenVisible);
    };
  }, [role]);

  const firstName = profile.name?.replace(/^Dr\.\s*/i, "").split(" ")[0] || (isPhysio ? "Doctor" : "there");
  const initials = profile.name?.split(" ").filter((word) => !word.includes(".")).slice(0, 2).map((word) => word[0]).join("") || "GY";
  const persist = async (next) => { const result = await updateProfile(next); setProfile(result.user); setEditOpen(false); };
  const signOut = async () => { await logout(); goTo("/login"); };

  if (loading) return <Box className="dashboard-loading"><CircularProgress /><Typography>Loading your secure dashboard...</Typography></Box>;

  const stats = dashboard.stats || {};
  const visits = dashboard.visits || [];
  const appointments = dashboard.appointments || [];
  const credential = credentialBadge[profile.credentialStatus] || credentialBadge.pending;

  return (
    <Box className="dashboard-shell">
      <DashboardSidebar role={role} activeView={activeView} mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} onLogout={signOut} onNavigate={setActiveView} />
      {mobileOpen && <button className="sidebar-scrim" aria-label="Close menu" onClick={() => setMobileOpen(false)} />}
      <Box className="dashboard-main">
        <Box component="header" className="dashboard-topbar">
          <IconButton className="dashboard-menu" onClick={() => setMobileOpen(true)}><Menu /></IconButton>
          <Box className="dashboard-search"><Search size={18} /><input placeholder={isPhysio ? "Search patients, visits or reports" : "Search your care details"} /></Box>
          <Stack direction="row" spacing={1} alignItems="center"><IconButton className="notification-button" aria-label="Open notifications" onClick={(event) => { setNotificationAnchor(event.currentTarget); setNotificationsSeen(true); }}><Bell size={20} />{!notificationsSeen && <i />}</IconButton><Divider orientation="vertical" flexItem /><button className="topbar-profile" onClick={() => setEditOpen(true)}><Avatar>{initials}</Avatar><span><strong>{profile.name}</strong><small>{isPhysio ? "Physio account" : "Patient account"}</small></span><ChevronRight size={17} /></button></Stack>
        </Box>

        <Container maxWidth="xl" className="dashboard-content">
          {pageError && <Alert severity="error" sx={{ mb: 2 }}>{pageError}</Alert>}
          {activeView === "overview" ? <>
          <Box className="dashboard-welcome auth-enter">
            <Box><Chip icon={<Sparkles size={15} />} label={isPhysio ? "Your practice at a glance" : "Your care at a glance"} /><Typography component="h1">Good morning, {isPhysio ? "Dr. " : ""}{firstName}</Typography><Typography color="text.secondary">{isPhysio ? "Here’s what’s happening with your patients today." : "Your appointments and care details are securely connected."}</Typography></Box>
            {!isPhysio && <Button variant="contained" startIcon={<CalendarDays size={18} />} onClick={() => setScheduleOpen(true)}>Book a session</Button>}
          </Box>

          <Box className="dashboard-stats auth-enter auth-enter-delay">
            {isPhysio ? <><StatCard icon={Users} label="Total patients" value={stats.totalPatients || 0} note="Unique patient records" tone="blue" /><StatCard icon={CalendarDays} label="Today's visits" value={stats.todayVisits || 0} note="Scheduled for today" tone="teal" /><StatCard icon={BadgeCheck} label="Completed visits" value={stats.completedVisits || 0} note="Saved care history" tone="purple" /><StatCard icon={Clock3} label="Hours of care" value={`${stats.careHours || 0}h`} note="From completed visits" tone="orange" /></> : <><StatCard icon={CalendarDays} label="Upcoming visits" value={stats.upcomingVisits || 0} note="Scheduled sessions" tone="blue" /><StatCard icon={BadgeCheck} label="Sessions completed" value={stats.completedSessions || 0} note="Your care history" tone="teal" /><StatCard icon={TrendingUp} label="Recovery progress" value={`${stats.recoveryProgress || 0}%`} note="Based on sessions" tone="purple" /><StatCard icon={FileText} label="Care reports" value={stats.careReports || 0} note="Completed sessions" tone="orange" /></>}
          </Box>

          <Box className="dashboard-grid">
            <Paper elevation={0} className="dashboard-panel dashboard-primary-panel">
              <Box className="panel-heading"><Box><Typography variant="h5">{isPhysio ? "Assigned bookings" : "Upcoming appointments"}</Typography><Typography color="text.secondary">Stored securely in your account</Typography></Box>{!isPhysio && <Button onClick={() => setScheduleOpen(true)} endIcon={<CalendarDays size={17} />}>Book session</Button>}</Box>
              {isPhysio ? (visits.length ? <Box className="patient-table"><Box className="patient-table-head"><span>Patient</span><span>Consultation</span><span>Date & time</span><span>Status</span><span /></Box>{visits.map((visit, index) => { const name = visit.patient_name; const letters = name.split(" ").slice(0,2).map((part) => part[0]).join(""); return <Box className="patient-row" key={visit.id}><Box className="patient-name"><Avatar className={`avatar-${["blue","teal","purple","orange"][index % 4]}`}>{letters}</Avatar><Box><strong>{name}</strong><small>{visit.patient_email || `Patient #${visit.id}`}</small></Box></Box><span>{visit.care_type || visit.concern}</span><span>{formatDate(visit.scheduled_at)}</span><Chip size="small" label={visit.status} color={visit.status === "completed" ? "success" : "primary"} variant="outlined" /><IconButton size="small"><ChevronRight size={17} /></IconButton></Box>; })}</Box> : <EmptyDashboardList role={role} onAction={() => setScheduleOpen(true)} />) : (appointments.length ? <Box className="appointment-list">{appointments.map((item) => <Box className="appointment-item" key={item.id}><span className="appointment-date"><strong>{new Date(item.scheduled_at).toLocaleDateString("en-IN", { day:"2-digit", month:"short" })}</strong><small>{new Date(item.scheduled_at).toLocaleTimeString("en-IN", { hour:"2-digit", minute:"2-digit" })}</small></span><span className="appointment-line" /><Box><strong>{item.title}</strong><small><Stethoscope size={14} />Assigned Physio: {item.physio_name || "Not assigned yet"}</small><small><MapPin size={14} />{item.care_type || "Care location pending"}</small></Box><Chip label={item.status} size="small" color="primary" variant="outlined" /><IconButton><ChevronRight /></IconButton></Box>)}</Box> : <EmptyDashboardList role={role} onAction={() => setScheduleOpen(true)} />)}
            </Paper>

            <Stack spacing={2.5}>
              <Paper elevation={0} className="dashboard-panel profile-summary"><Box className="profile-cover"><span /></Box><Avatar className="profile-avatar">{initials}</Avatar><IconButton className="profile-edit" onClick={() => setEditOpen(true)}><Edit3 size={17} /></IconButton><Typography variant="h5">{profile.name}</Typography><Typography color="text.secondary">{isPhysio ? profile.degree || profile.qualification : profile.concern}</Typography>{isPhysio && <Chip icon={<BadgeCheck size={15} />} label={credential.label} color={credential.color} size="small" />}<Divider /><span className="profile-detail"><MapPin size={16} />{profile.address || "Add your location"}</span><span className="profile-detail"><CircleUserRound size={16} />{isPhysio ? profile.registrationNumber || "Registration number not provided" : "Patient profile"}</span><Button fullWidth variant="outlined" startIcon={<Edit3 size={16} />} onClick={() => setEditOpen(true)}>Edit profile</Button></Paper>
              <Paper elevation={0} className="dashboard-panel progress-card"><Box className="panel-heading compact"><Box><Typography variant="h6">{isPhysio ? "Profile strength" : "Recovery activity"}</Typography><Typography color="text.secondary" variant="body2">{isPhysio ? "Your professional information" : "Completed care sessions"}</Typography></Box><strong>{isPhysio ? "90%" : `${stats.recoveryProgress || 0}%`}</strong></Box><LinearProgress variant="determinate" value={isPhysio ? 90 : stats.recoveryProgress || 0} /><Typography variant="caption">{isPhysio ? "Credentials will be reviewed by the care team." : "Progress grows as sessions are completed."}</Typography></Paper>
            </Stack>
          </Box>
          </> : <DashboardWorkspace view={activeView} isPhysio={isPhysio} visits={visits} appointments={appointments} onBook={() => setScheduleOpen(true)} />}
        </Container>
      </Box>
      <Popover open={Boolean(notificationAnchor)} anchorEl={notificationAnchor} onClose={() => setNotificationAnchor(null)} anchorOrigin={{ vertical: "bottom", horizontal: "right" }} transformOrigin={{ vertical: "top", horizontal: "right" }} slotProps={{ paper: { className: "notification-popover" } }}>
        <Box className="notification-heading"><Box><Typography variant="h6">Notifications</Typography><Typography variant="caption" color="text.secondary">Your latest account updates</Typography></Box><IconButton size="small" onClick={() => setNotificationAnchor(null)}><X size={17} /></IconButton></Box>
        <Box className="notification-item"><span><BadgeCheck size={18} /></span><Box><strong>{isPhysio ? credential.label : "Profile connected"}</strong><small>{isPhysio ? "Your credential status is synced with the Admin dashboard." : "Your care profile is ready for bookings."}</small></Box></Box>
        <Box className="notification-item"><span><CalendarDays size={18} /></span><Box><strong>{isPhysio ? `${visits.length} assigned booking${visits.length === 1 ? "" : "s"}` : `${appointments.length} appointment${appointments.length === 1 ? "" : "s"}`}</strong><small>Dashboard data refreshes automatically when new updates arrive.</small></Box></Box>
      </Popover>
      <ProfileDialog open={editOpen} role={role} profile={profile} onClose={() => setEditOpen(false)} onSave={persist} />
      {!isPhysio && <PatientBookingDialog open={scheduleOpen} onClose={() => setScheduleOpen(false)} onCreated={load} />}
    </Box>
  );
}
