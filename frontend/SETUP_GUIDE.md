# Quick Start: Firebase Authentication Setup

## What Was Implemented

✅ **Complete Authentication System** with:
- Email/Password Sign Up & Login
- Real-time Password Validation (8+ chars, uppercase, lowercase, number, special character)
- Forgot Password functionality
- Firebase Integration
- Role-Based Access Control (Candidate/Recruiter)
- Protected Routes for Dashboards
- Automatic Redirects Based on User Role
- User data stored in Firestore

## Files Created/Modified

### New Files:
1. **`src/services/authService.js`** - Authentication service with all auth functions
2. **`src/components/ProtectedRoute.jsx`** - Component to protect dashboard routes
3. **`src/pages/ForgotPassword.jsx`** - Forgot password page
4. **`AUTHENTICATION.md`** - Full documentation
5. **`.env.example`** - Environment variables template

### Modified Files:
1. **`src/services/firebaseConfig.js`** - Firebase initialization with Vite env vars
2. **`src/pages/GetStarted.jsx`** - Complete auth UI with validation & Firebase integration
3. **`src/App.jsx`** - Added routes for ForgotPassword and ProtectedRoute wrappers

## Setup Instructions

### Step 1: Create Firebase Project
1. Go to https://console.firebase.google.com
2. Create a new project
3. Enable Email/Password authentication (Authentication > Sign-in method)
4. Create a Firestore database

### Step 2: Copy Environment Variables
```bash
cp .env.example .env.local
```

### Step 3: Add Firebase Credentials
Edit `.env.local` with your Firebase credentials:
```env
VITE_REACT_APP_FIREBASE_API_KEY=your-key-here
VITE_REACT_APP_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_REACT_APP_FIREBASE_PROJECT_ID=your-project-id
VITE_REACT_APP_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your-id
VITE_REACT_APP_FIREBASE_APP_ID=your-app-id
```

### Step 4: Set Up Firestore Security Rules
In Firebase Console > Firestore > Rules, add:
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{uid} {
      allow read, write: if request.auth.uid == uid;
    }
  }
}
```

### Step 5: Test the Application
```bash
npm run dev
```

Navigate to `http://localhost:5173/getstarted` and test sign up/login!

## Features Overview

### 1. Sign Up Page
- Real-time password validation with visual feedback (✓/✗)
- Shows all password requirements:
  - At least 8 characters
  - One uppercase letter (A-Z)
  - One lowercase letter (a-z)
  - One number (0-9)
  - One special character (!@#$%^& etc.)
- Select role: Candidate or Recruiter
- Data stored in Firebase

### 2. Login Page
- Simple email/password authentication
- "Forgot Password?" link
- Automatic redirect to dashboard based on role

### 3. Forgot Password
- Email-based password reset
- Firebase handles email verification

### 4. Protected Dashboards
- `/candidateDashboard` - Only accessible by candidates
- `/recruiterDashboard` - Only accessible by recruiters
- Unauthenticated users redirected to login
- Wrong role users redirected to home

## Password Requirements

Users must create passwords with:
✓ Minimum 8 characters
✓ At least 1 UPPERCASE letter (A-Z)
✓ At least 1 lowercase letter (a-z)
✓ At least 1 number (0-9)
✓ At least 1 special character (!@#$%^&*-+=[]{}etc.)

Example valid password: `MyPassword123!`

## API Functions

### Sign Up
```javascript
import { signUp } from '../services/authService';

const result = await signUp(email, password, name, role);
if (result.success) {
  // User created and logged in
  navigate('/candidateDashboard');
} else {
  console.error(result.error);
}
```

### Login
```javascript
import { signIn } from '../services/authService';

const result = await signIn(email, password);
if (result.success) {
  // User logged in
  navigate(result.user.role === 'recruiter' ? 
    '/recruiterDashboard' : '/candidateDashboard');
}
```

### Check Auth State
```javascript
import { onAuthChange } from '../services/authService';

useEffect(() => {
  const unsubscribe = onAuthChange((user) => {
    if (user) {
      console.log('Logged in as:', user.name, user.role);
    } else {
      console.log('Not logged in');
    }
  });

  return () => unsubscribe();
}, []);
```

### Logout
```javascript
import { logOut } from '../services/authService';

await logOut();
navigate('/getstarted');
```

## Routes

| Route | Description | Protected |
|-------|-------------|-----------|
| `/` | Home page | No |
| `/getstarted` | Login/Sign Up | No |
| `/forgot-password` | Password reset | No |
| `/features` | Features page | No |
| `/about` | About page | No |
| `/contact` | Contact page | No |
| `/candidateDashboard` | Candidate dashboard | Yes (candidate only) |
| `/recruiterDashboard` | Recruiter dashboard | Yes (recruiter only) |

## Firestore Database Structure

```
firestore/
└── users/
    └── {uid}/
        ├── uid: string
        ├── email: string
        ├── name: string
        ├── role: "candidate" | "recruiter"
        ├── createdAt: timestamp
        └── updatedAt: timestamp
```

## Troubleshooting

### "Cannot find module" error
- Make sure all imports use correct paths
- Run `npm install` to ensure all dependencies are installed

### "Cannot read property of undefined" on Firebase config
- Verify `.env.local` exists with Firebase credentials
- Restart dev server after adding `.env.local`

### Password validation not working
- Ensure all 5 requirements are met
- Check special character list: `!@#$%^&*()_+-=[]{}';:"\\|,.<>/?`

### User not redirected after login
- Check browser console for errors
- Verify Firestore has users collection with proper structure
- Ensure user role is correctly stored

### 404 on forgot-password link
- Verify the route is added in `App.jsx` (already done)
- Clear browser cache and hard refresh

## Next Steps

1. ✅ Test sign up with various passwords
2. ✅ Test login with created account
3. ✅ Test forgot password flow
4. ✅ Test role-based redirects
5. Add additional user fields (profile picture, phone, etc.)
6. Implement email verification
7. Add Google OAuth option
8. Add two-factor authentication

## Support

For detailed documentation, see `AUTHENTICATION.md`

For Firebase docs, visit: https://firebase.google.com/docs
