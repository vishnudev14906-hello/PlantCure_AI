# PlantCure AI — Full-Stack Plant Disease Detection Web Application

![PlantCure AI Banner](https://images.unsplash.com/photo-1592417817098-8f3d6910985c?w=1200&auto=format&fit=crop&q=80)

**PlantCure AI** is an agricultural-grade, full-stack web application designed for farmers, agronomists, and researchers to diagnose crop pathologies in real time across **leaves 🌿, stems 🎋, and roots 🥕**. 

The system features a **Two-Stage Machine Learning Pipeline**:
1. **Stage 1 (Plant Part Validation Model)**: A specialized binary MobileNetV2 CNN classifier validates whether the uploaded image contains authentic plant organ tissue. If confidence is below the **70% threshold** (e.g. human selfies, animals, vehicles, electronics, documents, blank photos), the pipeline returns an immediate **Outcome B (Invalid Image)** response without running disease detection.
2. **Stage 2 (Disease Detection Model)**: A fine-tuned MobileNetV2 Transfer Learning CNN running on verified plant tissue diagnoses specific plant conditions (healthy vs. 40+ fungal, bacterial, viral, and pest pathologies), delivering confidence scores, organic remedies, chemical treatments, and preventive agronomic practices.

---

## Key Features

- 🌿 **Multi-Organ Plant Diagnosis**: Supports leaves (`leaf`), stems (`stem`), and roots (`root`) with automatic botanical feature extraction and organ-specific remedies.
- 🛡️ **Two-Stage Validation Pipeline**: Enforces strict biological validation (70% threshold) preventing irrelevant or corrupted images from producing false disease diagnoses.
- 🎯 **Plant Part Selector**: Select `Auto-Detect Part` or explicitly specify `Leaf 🌿`, `Stem 🎋`, or `Root 🥕`.
- 📖 **Disease Encyclopedia**: 40+ seeded crop pathologies filterable by plant part (`All Parts`, `Leaves`, `Stems`, `Roots`) and crop categories.
- 📜 **Diagnostic History**: Tracks all scans with plant organ badges, confidence percentages, severity indicators, and invalid attempt tags.
- 🔐 **Authentication & Security**: Django REST Framework SimpleJWT session management, Google OAuth 2.0 integration, password strength meters, and show/hide password toggles.
- 🌓 **Modern UI/UX**: Built with React 18, Vite, Tailwind CSS, Lucide icons, Dark/Light mode theme switching, and responsive mobile navigation.

---

## Architecture & Tech Stack

- **Frontend**: React JS (v18), Vite, React Router v6, Tailwind CSS, Lucide Icons, Axios with automatic JWT refresh interceptor, Dark Mode support, Canvas Confetti.
- **Backend**: Django 6.1, Django REST Framework (DRF), `djangorestframework-simplejwt` (Token rotation & blacklisting), `django-allauth` (Google OAuth 2.0 provider), `django-cors-headers`.
- **Database**: SQLite (`db.sqlite3`) for everything — User accounts, UserProfile, Disease Encyclopedia, Scan History, and Password Reset tokens.
- **Machine Learning**: 
  - **Stage 1 Validator**: MobileNetV2 binary classifier + botanical morphology verification (`plant_part_validator.h5` / `.keras`).
  - **Stage 2 Disease Classifier**: MobileNetV2 Transfer Learning classifier (`plant_disease_mobilenetv2.h5` / `.keras`) covering 40 conditions.

---

## Project Structure

```
plant-disease-detection/
├── backend/
│   ├── manage.py
│   ├── requirements.txt
│   ├── .env.example
│   ├── .env
│   ├── db.sqlite3
│   ├── leafcure_backend/          # Django core configuration
│   │   ├── settings.py
│   │   ├── urls.py
│   │   └── wsgi.py
│   ├── accounts/                  # Auth & User Profile app
│   │   ├── models.py              # UserProfile, PasswordResetToken
│   │   ├── serializers.py
│   │   ├── views.py               # Register, Login, Google, Forgot/Reset
│   │   ├── throttling.py          # Rate limiting (brute-force defense)
│   │   ├── urls.py
│   │   └── tests.py
│   ├── diseases/                  # Plant Disease & Prediction app
│   │   ├── models.py              # Disease, ScanHistory (plant_part fields)
│   │   ├── serializers.py
│   │   ├── views.py               # /predict/, /diseases/, /history/
│   │   ├── urls.py
│   │   ├── tests.py
│   │   └── management/commands/seed_diseases.py (40 conditions)
│   ├── ml_engine/                 # Two-Stage Deep Learning subsystem
│   │   ├── model_definition.py    # MobileNetV2 architecture
│   │   ├── predictor.py           # Two-stage inference pipeline
│   │   ├── train_validator.py     # Stage 1 plant validator trainer
│   │   ├── plant_part_validator.h5
│   │   ├── plant_part_validator.keras
│   │   ├── plant_disease_mobilenetv2.h5
│   │   ├── plant_disease_mobilenetv2.keras
│   │   ├── class_indices.json     # 40-class agricultural mapping
│   │   └── export_model.py
│   └── media/                     # Uploaded plant scans & user photos
│
└── frontend/                      # React JS application
    ├── index.html
    ├── package.json
    ├── vite.config.js
    ├── tailwind.config.js
    └── src/
        ├── App.jsx
        ├── main.jsx
        ├── index.css
        ├── api/client.js          # Axios with auto-refresh interceptors
        ├── context/
        │   ├── AuthContext.jsx    # Session & JWT state (plantcure_*)
        │   ├── ToastContext.jsx   # Animated toast alerts
        │   └── ThemeContext.jsx   # Light/Dark mode state
        ├── components/
        │   ├── Navbar.jsx         # Sticky header with PlantCure AI brand
        │   ├── Footer.jsx
        │   ├── ProtectedRoute.jsx
        │   ├── PasswordStrengthBar.jsx
        │   └── GoogleSignInButton.jsx
        ├── data/
        │   └── sampleLeaves.js    # Test samples for leaves, stems, roots
        └── pages/
            ├── HomePage.jsx       # Hero, Two-Stage Pipeline explanation
            ├── UploadPredictPage.jsx # Plant part selector, live step loading
            ├── PredictionResultPage.jsx # Outcome A & Outcome B handling
            ├── ScanHistoryPage.jsx # Filter by organ, invalid tags
            ├── DiseaseEncyclopediaPage.jsx # Tabs for Leaves, Stems, Roots
            ├── UserProfilePage.jsx
            ├── AboutPage.jsx      # Technical Two-Stage ML diagram
            ├── LoginPage.jsx
            ├── SignupPage.jsx
            ├── ForgotPasswordPage.jsx
            └── ResetPasswordPage.jsx
```

---

## Quickstart Setup Guide

### 1-Click Launchers (Windows)
Double-click `run.bat` or execute in PowerShell:
```powershell
.\run.ps1
```
This automatically starts both the Django backend (`http://127.0.0.1:8000`) and the Vite React frontend (`http://127.0.0.1:5173`) and opens your browser.

---

### Manual Setup

#### 1. Backend Setup (Django & ML Pipeline)

1. Open a terminal in `backend/`:
   ```bash
   cd backend
   ```

2. (Optional) Create and activate a virtual environment:
   ```bash
   python -m venv venv
   # On Windows:
   venv\Scripts\activate
   # On Linux/macOS:
   source venv/bin/activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Apply database migrations:
   ```bash
   python manage.py migrate
   ```

5. Seed the plant disease encyclopedia (40 conditions across leaves, stems, and roots):
   ```bash
   python manage.py seed_diseases
   ```

6. Run the Django development server:
   ```bash
   python manage.py runserver 127.0.0.1:8000
   ```
   Backend APIs will be live at `http://127.0.0.1:8000/api/`.

---

#### 2. Frontend Setup (React & Vite)

1. Open a new terminal in `frontend/`:
   ```bash
   cd frontend
   ```

2. Install npm packages:
   ```bash
   npm install
   ```

3. Start the Vite development server:
   ```bash
   npm run dev
   ```
   Open your browser at `http://localhost:5173`.

---

## Two-Stage Machine Learning Pipeline Details

### Stage 1: Plant Part Validation
- **Model**: Binary MobileNetV2 with botanic feature analyzers (Excess Green Index $2G - R - B$, vascular tissue texture analysis, and root epidermal color metrics).
- **Threshold**: **70% Confidence**.
- **Outcome A (Pass)**: If confidence $\ge 70\%$, the detected plant part (`leaf`, `stem`, or `root`) is identified and passed to Stage 2.
- **Outcome B (Reject)**: If confidence $< 70\%$, HTTP 400 is returned with error code `NO_PLANT_PART_DETECTED`. The frontend displays a dedicated invalid image alert ("This doesn't look like a plant part. Please upload a clear photo of a leaf, stem, or root.") and a "Try Again" button.

### Stage 2: Crop Condition Diagnosis
- **Model**: MobileNetV2 Transfer Learning trained on crop pathology imagery.
- **Capabilities**: Classifies 40 conditions across foliar, stem, and root tissues.
- **Output**: Crop name, disease name, confidence percentage, severity level, symptoms, organic remedies, chemical treatments, and preventive agronomic measures.

---

## Google OAuth 2.0 Integration Setup

PlantCure AI includes full integration with Google Sign-In via `django-allauth` and Google Identity Services.

### How to configure production Google credentials:

1. Go to the [Google Cloud Console](https://console.cloud.google.com/).
2. Create a new project (e.g., `PlantCure AI`).
3. Navigate to **APIs & Services** → **OAuth consent screen**:
   - Choose **External**.
   - Fill in App name, User support email, and Developer contact.
4. Navigate to **APIs & Services** → **Credentials**:
   - Click **Create Credentials** → **OAuth client ID**.
   - Application type: **Web application**.
   - Authorized JavaScript origins:
     - `http://localhost:5173`
     - `http://127.0.0.1:5173`
     - `http://127.0.0.1:8000`
   - Authorized redirect URIs:
     - `http://127.0.0.1:8000/accounts/google/login/callback/`
     - `http://localhost:5173/`
5. Copy your **Client ID** and **Client Secret**.
6. In `backend/.env`:
   ```ini
   GOOGLE_OAUTH_CLIENT_ID=your-client-id.apps.googleusercontent.com
   GOOGLE_OAUTH_CLIENT_SECRET=your-client-secret
   ```
7. In `frontend/`: Create `.env` (optional):
   ```ini
   VITE_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
   ```
8. **Dev Mode Note**: Out of the box, clicking "Continue with Google" includes interactive one-click simulated test accounts (e.g. Alex Green, Sarah Jenkins) so you can test the entire Google OAuth session exchange without having to register a Google Cloud project first!

---

## Running Backend Automated Tests

To execute the unit and integration tests:

```bash
cd backend
python manage.py test
```

Verifies:
- User registration with password strength rules
- Login with JWT tokens
- Password reset token generation & email dispatch
- Profile updates & avatar handling
- Stage 1 plant part validation (accepts leaves/stems/roots, rejects non-plant images)
- Stage 2 crop pathology diagnosis & confidence scoring
- Scan history persistence with plant part attributes in SQLite

---

## API Reference

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `POST` | `/api/auth/register/` | Register new user + return JWT | No |
| `POST` | `/api/auth/login/` | Authenticate with email/username | No |
| `POST` | `/api/auth/google/` | Google OAuth token exchange | No |
| `POST` | `/api/auth/forgot-password/` | Send password reset email | No |
| `POST` | `/api/auth/reset-password/` | Reset password via token | No |
| `POST` | `/api/auth/refresh/` | Refresh expired access token | No |
| `POST` | `/api/auth/logout/` | Blacklist refresh token | Yes |
| `GET`  | `/api/user/profile/` | Fetch current user profile | Yes |
| `PUT`  | `/api/user/profile/` | Update profile info & photo | Yes |
| `POST` | `/api/user/change-password/` | Change password | Yes |
| `POST` | `/api/predict/` | Two-Stage prediction (Stage 1 validation + Stage 2 diagnosis). Supports `image` and `plant_part` form fields. | Optional (auto-saves if logged in) |
| `GET`  | `/api/diseases/` | List encyclopedia with search, crop, and `plant_part` filters | No |
| `GET`  | `/api/diseases/<id>/` | Fetch specific disease details | No |
| `GET`  | `/api/history/` | Fetch logged-in user's past scans | Yes |
| `DELETE`| `/api/history/<id>/` | Delete past scan record | Yes |
