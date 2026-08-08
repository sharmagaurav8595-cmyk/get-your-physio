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
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import {
  BadgeCheck,
  CalendarCheck2,
  ChevronRight,
  ClipboardList,
  Download,
  Filter,
  LogOut,
  MapPin,
  RefreshCw,
  Search,
  ShieldCheck,
  Stethoscope,
  UserPlus,
  UserRound,
  Users,
  X,
} from "lucide-react";
import logo from "../assets/logoNew.jpg";
import { indiaStatesAndUnionTerritories } from "../data/indiaStates.js";
import { goTo } from "../features/auth/authStore.js";
import { adminLogout, createAdminAppointment, createAdminPatient, downloadAdminPhysioDegreeDocument, getAdminOverview, updateAdminAppointment, updatePhysioVerification } from "../features/auth/api.js";

const formatDate = (value) => new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
const toDateTimeInput = (value) => {
  const date = new Date(value);
  return new Date(date.getTime() - date.getTimezoneOffset() * 60_000).toISOString().slice(0, 16);
};
const initials = (name = "") => name.split(" ").slice(0, 2).map((part) => part[0]).join("").toUpperCase();

function AdminStat({ icon: Icon, label, value, tone, onClick }) {
  return <Paper component="button" onClick={onClick} elevation={0} className={`admin-stat admin-stat-${tone}`}><span><Icon size={22} /></span><Box><small>{label}</small><strong>{value}</strong></Box><ChevronRight size={18} /></Paper>;
}

function EmptyState({ label }) {
  return <Box className="admin-empty"><Search size={30} /><Typography variant="h6">No {label} found</Typography><Typography color="text.secondary">Try clearing or changing the current location filter.</Typography></Box>;
}

const emptyPatientForm = {
  name: "", age: "", gender: "", mobile: "", email: "", concern: "", address: "", city: "", state: "", pincode: "",
};

function AdminPatientDialog({ open, onClose, onCreated }) {
  const [form, setForm] = useState(emptyPatientForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const field = (name) => ({
    value: form[name],
    onChange: (event) => setForm((current) => ({ ...current, [name]: event.target.value })),
  });
  const close = () => {
    setError("");
    onClose();
  };
  const submit = async () => {
    setSaving(true); setError("");
    try {
      await createAdminPatient(form);
      setForm(emptyPatientForm);
      await onCreated();
      onClose();
    } catch (requestError) { setError(requestError.message); }
    finally { setSaving(false); }
  };
  return (
    <Dialog open={open} onClose={close} maxWidth="sm" fullWidth>
      <DialogTitle className="profile-dialog-title"><Box><Typography variant="h5">Add a patient</Typography><Typography color="text.secondary" variant="body2">Create a basic Patient record for bookings and care operations.</Typography></Box><IconButton onClick={close}><X /></IconButton></DialogTitle>
      <DialogContent className="profile-dialog-content">
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <Box className="profile-form-grid">
          <TextField label="Full name *" {...field("name")} className="field-wide" />
          <TextField label="Age *" type="number" {...field("age")} slotProps={{ htmlInput: { min: 1, max: 110 } }} />
          <TextField select label="Gender *" {...field("gender")}><MenuItem value="Female">Female</MenuItem><MenuItem value="Male">Male</MenuItem><MenuItem value="Other">Other</MenuItem><MenuItem value="Prefer not to say">Prefer not to say</MenuItem></TextField>
          <TextField label="Mobile number *" {...field("mobile")} />
          <TextField label="Email address *" type="email" {...field("email")} />
          <TextField label="Care need" placeholder="For example: back pain" {...field("concern")} className="field-wide" />
          <TextField label="Address" multiline minRows={2} {...field("address")} className="field-wide" />
          <TextField label="City" {...field("city")} />
          <TextField select label="State / Union Territory" {...field("state")}>
            {indiaStatesAndUnionTerritories.map((state) => <MenuItem key={state} value={state}>{state}</MenuItem>)}
          </TextField>
          <TextField label="PIN code" {...field("pincode")} slotProps={{ htmlInput: { maxLength: 6 } }} />
        </Box>
      </DialogContent>
      <DialogActions className="profile-dialog-actions"><Button onClick={close}>Cancel</Button><Button variant="contained" disabled={saving} onClick={submit}>{saving ? "Creating..." : "Create patient"}</Button></DialogActions>
    </Dialog>
  );
}

function AdminBookingDialog({ open, patients, physios, onClose, onCreated }) {
  const [form, setForm] = useState({ patientUserId: "", physioUserId: "", careType: "Home visit", scheduledAt: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const field = (name) => ({
    value: form[name],
    onChange: (event) => setForm((current) => ({ ...current, [name]: event.target.value })),
  });
  const submit = async () => {
    setSaving(true); setError("");
    try {
      await createAdminAppointment(form);
      setForm({ patientUserId: "", physioUserId: "", careType: "Home visit", scheduledAt: "" });
      await onCreated();
      onClose();
    } catch (requestError) { setError(requestError.message); }
    finally { setSaving(false); }
  };
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle className="profile-dialog-title"><Box><Typography variant="h5">Add a patient booking</Typography><Typography color="text.secondary" variant="body2">Select the patient and assign the booking directly to a Physio.</Typography></Box><IconButton onClick={onClose}><X /></IconButton></DialogTitle>
      <DialogContent className="profile-dialog-content">
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {!patients.length && <Alert severity="warning" sx={{ mb: 2 }}>Create a Patient account before adding a booking.</Alert>}
        {!physios.length && <Alert severity="warning" sx={{ mb: 2 }}>Create a Physio account before assigning a booking.</Alert>}
        <Box className="profile-form-grid">
          <TextField select label="Patient *" {...field("patientUserId")} className="field-wide">
            {patients.map((patient) => <MenuItem key={patient.id} value={patient.id}>{patient.name} — {patient.email}</MenuItem>)}
          </TextField>
          <TextField select label="Assign Physio *" {...field("physioUserId")} className="field-wide">
            {physios.map((physio) => <MenuItem key={physio.id} value={physio.id}>{physio.name} — {[physio.city, physio.state].filter(Boolean).join(", ") || physio.email}</MenuItem>)}
          </TextField>
          <TextField select label="Consultation type *" {...field("careType")} className="field-wide"><MenuItem value="Home visit">Home consultation</MenuItem><MenuItem value="Online consultation">Online consultation</MenuItem></TextField>
          <TextField
            type="datetime-local"
            label="Booking date and time *"
            {...field("scheduledAt")}
            slotProps={{ inputLabel: { shrink: true } }}
            className="field-wide"
          />
        </Box>
      </DialogContent>
      <DialogActions className="profile-dialog-actions"><Button onClick={onClose}>Cancel</Button><Button variant="contained" disabled={saving || !patients.length || !physios.length} onClick={submit}>{saving ? "Adding..." : "Add and assign booking"}</Button></DialogActions>
    </Dialog>
  );
}

export default function AdminDashboardPage() {
  const [overview, setOverview] = useState(null);
  const [activeTab, setActiveTab] = useState("bookings");
  const [locationInput, setLocationInput] = useState("");
  const [location, setLocation] = useState("");
  const [status, setStatus] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [updatingId, setUpdatingId] = useState(null);
  const [bookingDialogOpen, setBookingDialogOpen] = useState(false);
  const [patientDialogOpen, setPatientDialogOpen] = useState(false);

  const load = async () => {
    setLoading(true); setError("");
    try { setOverview(await getAdminOverview({ location, status })); }
    catch (requestError) {
      if (requestError.status === 401) return goTo("/admin/login");
      setError(requestError.message);
    } finally { setLoading(false); }
  };
  useEffect(() => { load(); }, [location, status]);

  const logout = async () => { await adminLogout(); goTo("/admin/login"); };
  const changeStatus = async (id, nextStatus) => {
    setUpdatingId(`booking-${id}`);
    try { await updateAdminAppointment(id, { status: nextStatus }); await load(); }
    catch (requestError) { setError(requestError.message); }
    finally { setUpdatingId(null); }
  };
  const changePreferredTime = async (id, scheduledAt) => {
    if (!scheduledAt) return;
    setUpdatingId(`booking-${id}`);
    try { await updateAdminAppointment(id, { scheduledAt }); await load(); }
    catch (requestError) { setError(requestError.message); }
    finally { setUpdatingId(null); }
  };
  const changeAssignment = async (id, physioUserId) => {
    setUpdatingId(`booking-${id}`);
    try { await updateAdminAppointment(id, { physioUserId: physioUserId || null }); await load(); }
    catch (requestError) { setError(requestError.message); }
    finally { setUpdatingId(null); }
  };
  const changeVerification = async (id, nextStatus) => {
    setUpdatingId(`physio-${id}`);
    setNotice("");
    try {
      const result = await updatePhysioVerification(id, nextStatus);
      if (result.notification?.mode === "smtp") {
        setNotice(`Verification status updated and email sent to ${result.notification.recipient}.`);
      } else if (result.notification?.mode === "development") {
        setNotice("Verification status updated. Development email was logged in the backend terminal.");
      } else {
        setNotice("Verification status was already up to date.");
      }
      localStorage.setItem("gyp-credential-status-updated-at", String(Date.now()));
      await load();
    }
    catch (requestError) { setError(requestError.message); }
    finally { setUpdatingId(null); }
  };
  const downloadDegreeDocument = async (physio) => {
    setUpdatingId(`document-${physio.id}`);
    try {
      const { blob, filename } = await downloadAdminPhysioDegreeDocument(physio.id);
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = filename;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 1_000);
    } catch (requestError) { setError(requestError.message); }
    finally { setUpdatingId(null); }
  };

  if (loading && !overview) return <Box className="dashboard-loading"><CircularProgress /><Typography>Loading Admin workspace...</Typography></Box>;
  const admin = overview?.admin || {};
  const stats = overview?.stats || {};
  const patients = overview?.patients || [];
  const physios = overview?.physios || [];
  const bookings = overview?.bookings || [];
  const patientOptions = overview?.patientOptions || patients;
  const physioOptions = overview?.physioOptions || physios;

  return (
    <Box className="admin-shell">
      <Box component="header" className="admin-header">
        <Container maxWidth="xl" className="admin-header-inner">
          <Box className="admin-brand" onClick={() => goTo("/")}><span><img src={logo} alt="" /></span><Box><strong>GetYourPhysio.in</strong><small>Admin workspace</small></Box></Box>
          <Stack direction="row" spacing={1.5} alignItems="center"><Chip icon={<ShieldCheck size={15} />} label="Admin-only access" color="success" variant="outlined" /><Divider orientation="vertical" flexItem /><Box className="admin-identity"><Avatar>{initials(admin.name)}</Avatar><span><strong>{admin.name}</strong><small>{admin.email}</small></span></Box><IconButton onClick={logout} title="Log out"><LogOut size={19} /></IconButton></Stack>
        </Container>
      </Box>

      <Container maxWidth="xl" className="admin-content">
        <Box className="admin-welcome auth-enter"><Box><Typography className="admin-kicker"><ShieldCheck size={16} />Care operations</Typography><Typography component="h1">Admin overview</Typography><Typography color="text.secondary">Create bookings, assign Physios, review registered users, and filter your network by location.</Typography></Box><Stack direction="row" spacing={1}><Button variant="contained" startIcon={<UserPlus size={17} />} onClick={() => setPatientDialogOpen(true)}>Add patient</Button><Button variant="outlined" startIcon={<CalendarCheck2 size={17} />} onClick={() => setBookingDialogOpen(true)}>Add booking</Button><Button variant="outlined" startIcon={<RefreshCw size={17} />} onClick={load}>Refresh data</Button></Stack></Box>
        {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
        {notice && <Alert severity="success" sx={{ mt: 2 }} onClose={() => setNotice("")}>{notice}</Alert>}

        <Box className="admin-stats auth-enter auth-enter-delay">
          <AdminStat icon={CalendarCheck2} label="Booking requests" value={stats.bookings || 0} tone="blue" onClick={() => setActiveTab("bookings")} />
          <AdminStat icon={UserRound} label="Registered patients" value={stats.patients || 0} tone="teal" onClick={() => setActiveTab("patients")} />
          <AdminStat icon={Stethoscope} label="Registered Physios" value={stats.physios || 0} tone="purple" onClick={() => setActiveTab("physios")} />
          <AdminStat icon={BadgeCheck} label="Credentials pending" value={stats.pendingCredentials || 0} tone="orange" onClick={() => setActiveTab("physios")} />
        </Box>

        <Paper elevation={0} className="admin-workspace">
          <Box className="admin-tabs" role="tablist">
            <button className={activeTab === "bookings" ? "is-active" : ""} onClick={() => setActiveTab("bookings")}><ClipboardList size={18} />Bookings <span>{stats.bookings || 0}</span></button>
            <button className={activeTab === "patients" ? "is-active" : ""} onClick={() => setActiveTab("patients")}><Users size={18} />Patients <span>{stats.patients || 0}</span></button>
            <button className={activeTab === "physios" ? "is-active" : ""} onClick={() => setActiveTab("physios")}><Stethoscope size={18} />Physios <span>{stats.physios || 0}</span></button>
          </Box>

          <Box className="admin-filters">
            <Box className="admin-location-search"><MapPin size={18} /><input value={locationInput} onChange={(event) => setLocationInput(event.target.value)} onKeyDown={(event) => event.key === "Enter" && setLocation(locationInput.trim())} placeholder="Filter by city, state, PIN code or address" /><Button startIcon={<Filter size={16} />} variant="contained" onClick={() => setLocation(locationInput.trim())}>Apply</Button></Box>
            {activeTab === "bookings" && <TextField select size="small" label="Booking status" value={status} onChange={(event) => setStatus(event.target.value)} className="admin-status-filter"><MenuItem value="all">All statuses</MenuItem><MenuItem value="requested">Requested</MenuItem><MenuItem value="confirmed">Confirmed</MenuItem><MenuItem value="completed">Completed</MenuItem><MenuItem value="cancelled">Cancelled</MenuItem></TextField>}
            {location && <Chip label={`Location: ${location}`} onDelete={() => { setLocation(""); setLocationInput(""); }} color="primary" variant="outlined" />}
          </Box>

          {loading && <Box className="admin-inline-loader"><CircularProgress size={24} />Updating results...</Box>}

          {!loading && activeTab === "bookings" && (bookings.length ? <Box className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Patient</th><th>Consultation</th><th>Location</th><th>Assigned Physio</th><th>Preferred date & time</th><th>Status</th></tr></thead><tbody>{bookings.map((booking) => <tr key={booking.id}><td><Box className="admin-person"><Avatar>{initials(booking.patient_name)}</Avatar><span><strong>{booking.patient_name}</strong><small>{booking.patient_email}</small></span></Box></td><td><strong>{booking.care_type || "Not specified"}</strong><small>{booking.title}</small></td><td><strong>{booking.city || "—"}</strong><small>{[booking.state, booking.pincode].filter(Boolean).join(" · ")}</small></td><td><TextField select size="small" disabled={updatingId === `booking-${booking.id}`} value={booking.physio_user_id || ""} onChange={(event) => changeAssignment(booking.id, event.target.value)} className="booking-status-select"><MenuItem value="">Not assigned</MenuItem>{physioOptions.map((physio) => <MenuItem key={physio.id} value={physio.id}>{physio.name}</MenuItem>)}</TextField>{booking.physio_name && <small>Assigned to {booking.physio_name}</small>}</td><td><TextField type="datetime-local" size="small" disabled={updatingId === `booking-${booking.id}`} defaultValue={toDateTimeInput(booking.scheduled_at)} onBlur={(event) => event.target.value !== toDateTimeInput(booking.scheduled_at) && changePreferredTime(booking.id, event.target.value)} className="booking-date-input" /><small>Currently: {formatDate(booking.scheduled_at)}</small></td><td><TextField select size="small" disabled={updatingId === `booking-${booking.id}`} value={booking.status} onChange={(event) => changeStatus(booking.id, event.target.value)} className="booking-status-select"><MenuItem value="requested">Requested</MenuItem><MenuItem value="confirmed">Confirmed</MenuItem><MenuItem value="completed">Completed</MenuItem><MenuItem value="cancelled">Cancelled</MenuItem></TextField></td></tr>)}</tbody></table></Box> : <EmptyState label="booking requests" />)}

          {!loading && activeTab === "patients" && (patients.length ? <Box className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Patient</th><th>Contact</th><th>Care need</th><th>Location</th><th>Bookings</th><th>Joined</th></tr></thead><tbody>{patients.map((patient) => <tr key={patient.id}><td><Box className="admin-person"><Avatar>{initials(patient.name)}</Avatar><span><strong>{patient.name}</strong><small>{patient.gender}, {patient.age || "Age not added"}</small></span></Box></td><td><strong>{patient.mobile}</strong><small>{patient.email}</small></td><td><strong>{patient.concern || "Not added"}</strong><small>{patient.preferred_care || "No preference"}</small></td><td><strong>{patient.city || "—"}</strong><small>{[patient.state, patient.pincode].filter(Boolean).join(" · ")}</small></td><td><Chip label={patient.appointment_count} color="primary" variant="outlined" size="small" /></td><td>{new Date(patient.created_at).toLocaleDateString("en-IN")}</td></tr>)}</tbody></table></Box> : <EmptyState label="patients" />)}

          {!loading && activeTab === "physios" && (physios.length ? <Box className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Physio</th><th>Contact</th><th>Qualification</th><th>Location</th><th>Registration & document</th><th>Verification status</th></tr></thead><tbody>{physios.map((physio) => <tr key={physio.id}><td><Box className="admin-person"><Avatar className="physio-avatar">{initials(physio.name)}</Avatar><span><strong>{physio.name}</strong><small>{physio.booking_count} assigned bookings</small></span></Box></td><td><strong>{physio.mobile}</strong><small>{physio.email}</small></td><td><strong>{physio.degree || physio.qualification}</strong><small>{physio.qualification}</small></td><td><strong>{physio.city || "—"}</strong><small>{[physio.state, physio.pincode].filter(Boolean).join(" · ")}</small></td><td><strong>{physio.registration_number}</strong>{physio.has_degree_document ? <Button size="small" startIcon={<Download size={14} />} disabled={updatingId === `document-${physio.id}`} onClick={() => downloadDegreeDocument(physio)}>{updatingId === `document-${physio.id}` ? "Preparing..." : "Degree PDF"}</Button> : <small>No document</small>}</td><td><TextField select size="small" disabled={updatingId === `physio-${physio.id}`} value={physio.credential_status} onChange={(event) => changeVerification(physio.id, event.target.value)} className="verification-status-select"><MenuItem value="pending">Pending</MenuItem><MenuItem value="verified">Verified</MenuItem><MenuItem value="rejected">Rejected</MenuItem></TextField></td></tr>)}</tbody></table></Box> : <EmptyState label="Physios" />)}
        </Paper>
      </Container>
      <AdminPatientDialog
        open={patientDialogOpen}
        onClose={() => setPatientDialogOpen(false)}
        onCreated={async () => {
          await load();
          setActiveTab("patients");
          setNotice("Patient created successfully and is ready for booking.");
        }}
      />
      <AdminBookingDialog open={bookingDialogOpen} patients={patientOptions} physios={physioOptions} onClose={() => setBookingDialogOpen(false)} onCreated={load} />
    </Box>
  );
}
