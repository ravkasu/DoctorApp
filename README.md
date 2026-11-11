# MedPulse Pro &mdash; Next-Gen Clinical & Telehealth Operating System
### Built with Angular 22, Ionic Framework 9 & Ionicons

![MedPulse Pro Hero](https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=1200&q=80)

**MedPulse Pro** is an enterprise-grade, responsive, and animated Doctor Web & Mobile Clinical Application. Designed with modern medical glassmorphism, real-time physiological vitals telemetry, electronic health records (EHR), automated drug contraindication safety alerts, digital e-Prescriptions with verification QR codes, and simulated high-definition telehealth video consultations.

---

## 🌟 Key Features & Architectural Blocks

### 1. 🩺 Doctor Command Center & Dashboard (`/tabs/dashboard`)
* **Live Status & Availability**: Instant status toggle between **🟢 Available & Online**, **🟡 In Consultation**, **☕ Short Break**, and **⚪ Offline / Rounds**.
* **Real-Time Patient Vitals Alerts (RPM)**: Instant alert ticker for patients experiencing telemetry anomalies (e.g., BP 165/102 mmHg, HR 104 bpm) with 1-click chart triage and telehealth room entry.
* **Key Performance Metric Cards**:
  - Today's Appointments with completion progress indicator
  - Telehealth Encounters waiting in lobby
  - Priority Emergency Triage counters
  - Estimated Daily Revenue ($) & Patient Satisfaction rating (4.96/5.0 from 380+ reviews)
* **Today's Patient Schedule & Queue**: Filterable by **All**, **In-Clinic**, **Video Call**, and **Urgent / Emergency** with live status badges (`CHECKED-IN`, `IN-ROOM`, `SCHEDULED`, `COMPLETED`).
* **Continuous RPM Telemetry HUD**: Live simulated ECG wave heartbeat animation with wearable sensor syncing (Apple Watch, Omron BP, Dexcom CGM).

### 2. 📅 Appointments & Teleconsultation Scheduling (`/tabs/appointments`)
* **Interactive Date & Calendar Filter**: One-click filters for *Today*, *Tomorrow*, or custom date selection.
* **Status Filter Segments**: *All*, *Scheduled*, *Checked-In*, *In-Room*, *Completed*.
* **Triage Urgency Flags**: *Routine*, *Moderate*, *Urgent*, *Emergency*.
* **Comprehensive Appointment Booking Modal**:
  - Auto-fill from registered patient directory or new patient entry
  - Patient demographics (Full Name, Age, Gender, Blood Group, Phone)
  - Date & Time slot picker (Morning, Afternoon, Evening)
  - Consultation Mode: In-Clinic ($150), Video Call ($120), Emergency ($250), Lab Review ($80)
  - Chief complaint, symptoms tags, clinical triage notes
  - Fee and payment status tracking (`PAID` / `PENDING`)

### 3. 📁 Patient Directory & Electronic Health Records (EHR) (`/tabs/patients`)
* **Search & Condition Filters**: Instant search by Name, Medical Record Number (MRN), or Phone, plus filters by condition (*Critical Alert*, *Hypertension*, *Diabetes*, *Cardiac/Valve*).
* **Comprehensive Patient Chart & EHR Workspace Modal**:
  - **Vitals & Monitoring**: Current vitals (BP, Heart Rate, SpO2, Temperature, Blood Glucose, BMI calculator) + historical telemetry timeline table + "Log New Reading" form.
  - **History & Allergies**: Active allergies with severity tags (*Mild*, *Moderate*, *Severe*) and contraindication alerts + chronic conditions manager.
  - **Lab & Diagnostic Reports**: Category tags (*Biochemistry*, *Cardiology*, *Hematology*), observed values, normal reference ranges, and result status badges (*Normal*, *Borderline*, *Abnormal*, *Critical*).
  - **SOAP Clinical Notes**: Subjective, Objective, Assessment, and Plan documentation timeline with "+ New Clinical Note" form.
  - **Past Prescriptions Archive**: 1-click access to all prior e-Rx issued for the patient.

### 4. 💊 Digital Prescription (e-Rx) Generator (`/tabs/prescriptions`)
* **Dual-Mode Clinical System**:
  - **Interactive Rx Builder**: Auto-fills patient vitals & highlights contraindication allergies; medication item builder with drug name, formulation (Tablet, Capsule, Syrup, Inhaler, Injection), dosage, frequency (OD, BD, TDS, QID, PRN), timing (Before/After meals, Bedtime), duration in days, and special directions. Quick-pick drug selector for common medications.
  - **Official Printable / Shareable Digital Rx Sheet**: Authentic medical letterhead for *Metropolitan Heart & Vascular Institute*, doctor credentials, NY State Medical Board registration number, demographic banner, Latin medical ℞ symbol, structured medication schedule, dietary precautions, doctor's cursive digital signature stamp, and pharmacy authentication QR code.
* One-click **Print / Save as PDF** (`window.print()` with dedicated print CSS media query) and **Send to Patient via SMS/Email**.

### 5. 🎥 Telehealth HD Live Video Consultation Room (`/consultation/:id`)
* **Encrypted High-Definition Telemedicine Canvas**:
  - Real-time consultation duration timer with animated recording beacon (`09:42`)
  - Full-screen patient video stream with audio wave HUD and connection telemetry
  - Picture-in-Picture (PiP) Doctor self-view with camera pause overlay
  - **Floating Glass Dock Controls**: Mute Mic, Pause Camera, Screen Share, Open Clinical Workspace, Issue Rx, and End Consultation with summary dialog.
* **Integrated In-Call Drawer**:
  - **Live Vitals HUD**: Real-time sensor stream while speaking with the patient
  - **Encrypted Live Chat**: In-call text messages with pre-populated medical history and one-click quick replies (*"Take deep breaths"*, *"Drafting Rx"*, *"Re-check BP"*)
  - **Live SOAP Notes Scratchpad**: Saves consultation diagnosis and notes directly to the patient's EHR record during the call!

### 6. ⚙️ Doctor Profile, Clinic Settings & Earnings Analytics (`/tabs/profile`)
* **Doctor Profile Hero**: Board certifications, license registration, experience, rating (4.96/5.0), and availability switcher.
* **Consultation Fee Schedule Configuration**: Editable in-clinic, telehealth, and emergency rates with instant persistence.
* **Practice Information**: Hospital affiliation, clinic suite, phone, and clinical email.
* **Monthly Financial & Volume Analytics**: Revenue summary ($18,450), completed consults breakdown (77% in-clinic vs. 23% video).
* **System Settings**: High-contrast Dark / Light theme toggle, telemetry sound alerts, and demo dataset reset.

---

## 🚀 Quick Start & Development

### Prerequisites
- Node.js (v18, v20, v22, or v24 LTS recommended)
- npm (v9+)
- Ionic CLI (`npm install -g @ionic/cli`) [Optional]

### 1. Run Development Server
```bash
npm start
# or
ionic serve
```
Open your browser at `http://localhost:8100/` or `http://localhost:4200/`.

### 2. Build for Production / Web Deployment
```bash
npm run build
```
The optimized production bundle will be generated in the `www/` directory.

---

## 🌐 Deployment Options

### Option A: Firebase Hosting
```bash
npm install -g firebase-tools
firebase login
firebase init hosting
# Specify 'www' as the public directory and configure as a single-page app (y)
firebase deploy --only hosting
```

### Option B: Vercel / Netlify
1. Connect your repository to Vercel or Netlify.
2. Build Command: `npm run build`
3. Output Directory: `www`

### Option C: Docker (Nginx)
```dockerfile
FROM nginx:alpine
COPY www /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

---

## 📱 Mobile App Deployment (iOS & Android via Capacitor)

To package MedPulse Pro as native iOS and Android apps:

```bash
# 1. Install Capacitor Core & CLI
npm install @capacitor/core @capacitor/cli @capacitor/ios @capacitor/android

# 2. Initialize Capacitor
npx cap init "MedPulse Pro" "com.medpulse.doctorapp" --web-dir=www

# 3. Add iOS and Android native platforms
npx cap add ios
npx cap add android

# 4. Copy build assets and sync plugins
npm run build
npx cap sync

# 5. Open in Xcode (Mac) or Android Studio
npx cap open ios
npx cap open android
```

---

## 📁 Project Architecture

```
src/
├── app/
│   ├── components/
│   │   ├── appointment-modal/       # Comprehensive Appointment Scheduling Modal
│   │   ├── patient-modal/           # Full EHR & Vitals Historical Viewer Modal
│   │   ├── prescription-modal/      # Interactive Rx Builder & Official Printable Sheet
│   │   └── shared-components.module.ts
│   ├── models/
│   │   └── doctor-app.models.ts     # TypeScript interfaces (Vitals, Rx, EHR, Appointments)
│   ├── services/
│   │   ├── doctor-data.service.ts   # Reactive data store with LocalStorage persistence
│   │   └── theme.service.ts         # Dark/Light mode theme state manager
│   ├── tab1/                        # Command Center & Clinical Dashboard
│   ├── tab2/                        # Appointments & Scheduling Calendar
│   ├── tab3/                        # Patient Directory & Complete EHR
│   ├── prescriptions/               # Digital Rx Center & Archives
│   ├── profile/                     # Doctor Credentials, Fees & Analytics
│   ├── consultation/                # Live HD Telehealth Video Consultation Room
│   └── tabs/                        # Responsive Glassmorphic Tab Bar & Routing
├── theme/
│   └── variables.scss               # Medical color palette & design tokens
├── global.scss                      # Global animations, glassmorphism & print styles
└── index.html                       # HTML5 entry with Plus Jakarta Sans & typography
```

---

## 🔒 Clinical Data Privacy & Security Note
* MedPulse Pro uses local reactive client state and browser storage encryption abstractions.
* When integrating with backend EHR systems (Epic, Cerner, FHIR APIs), replace `DoctorDataService` with your authenticated REST/GraphQL endpoints.
