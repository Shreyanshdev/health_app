# Health App - Frontend

A modern, full-featured healthcare platform frontend built with Next.js 16, React 19, and TypeScript. This application provides a comprehensive interface for patients, doctors, and administrators to manage appointments, prescriptions, medical records, and more.

## 📋 Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Features](#features)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Available Scripts](#available-scripts)
- [Project Structure](#project-structure)
- [Key Components](#key-components)
- [API Integration](#api-integration)
- [Authentication](#authentication)
- [Styling](#styling)
- [Development Guidelines](#development-guidelines)
- [Building for Production](#building-for-production)
- [Troubleshooting](#troubleshooting)

## 🎯 Overview

This frontend application is part of a full-stack healthcare platform that enables:

- **Patients**: Book appointments, view prescriptions, manage medical history, find doctors
- **Doctors**: Manage appointments, view patient records, create prescriptions, manage schedules
- **Administrators**: Manage users, appointments, blogs, and system settings

The application uses Next.js 16 with the App Router for optimal performance and SEO, TypeScript for type safety, and Tailwind CSS for modern, responsive styling.

## 🛠 Tech Stack

### Core Technologies
- **Next.js 16.0.3** - React framework with App Router
- **React 19.2.0** - UI library
- **TypeScript 5** - Type safety
- **Tailwind CSS 4** - Utility-first CSS framework

### Key Dependencies
- **axios 1.7.7** - HTTP client for API requests
- **date-fns 4.1.0** - Date manipulation utilities
- **gsap 3.13.0** - Animation library
- **lucide-react 0.554.0** - Icon library
- **react-dropzone 14.3.8** - File upload component
- **react-toastify 11.0.5** - Toast notifications

### Development Tools
- **ESLint** - Code linting
- **TypeScript** - Static type checking

## ✨ Features

### Patient Features
- 🔐 User authentication (login/signup)
- 👨‍⚕️ Doctor search and discovery
- 📅 Appointment booking (online/in-clinic)
- 💳 Payment integration (Razorpay)
- 📋 Prescription viewing
- 📝 Medical history management
- 🔔 Notifications
- ⭐ Doctor reviews and ratings
- ❤️ Favorite doctors
- 📱 Responsive design

### Doctor Features
- 📊 Dashboard with appointment overview
- 📅 Appointment management
- 👥 Patient management
- 📝 Prescription creation
- ⏰ Schedule management
- 📈 Profile management
- 🔔 Notifications

### Admin Features
- 📊 Comprehensive dashboard
- 👥 User management
- 👨‍⚕️ Doctor approval system
- 📅 Appointment oversight
- 📝 Blog management (SEO-friendly)
- 💰 Payment transaction logs
- ⚙️ System settings

### Public Features
- 🏠 Landing page with hero section
- 📖 Blog/articles section
- 👨‍⚕️ Doctor listings
- 📞 Contact forms
- ℹ️ About page
- 🔍 SEO optimization

## 📦 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher)
- **npm** or **yarn** or **pnpm**
- **Git**

## 🚀 Installation

1. **Navigate to the client directory:**
   ```bash
   cd client
   ```

2. **Install dependencies:**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Set up environment variables** (see [Environment Variables](#environment-variables))

4. **Start the development server:**
   ```bash
   npm run dev
   ```

5. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🔐 Environment Variables

Create a `.env.local` file in the `client` directory with the following variables:

```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:5000/api

# Razorpay Configuration
NEXT_PUBLIC_RAZORPAY_KEY_ID=your_razorpay_key_id

# Optional: Add other environment variables as needed
```

**Note:** Make sure the backend server is running and accessible at the `NEXT_PUBLIC_API_URL` endpoint.

## 📜 Available Scripts

### Development
```bash
npm run dev
```
Starts the development server at [http://localhost:3000](http://localhost:3000) with hot-reload enabled.

### Production Build
```bash
npm run build
```
Creates an optimized production build of the application.

### Start Production Server
```bash
npm start
```
Starts the production server (requires `npm run build` to be run first).

### Linting
```bash
npm run lint
```
Runs ESLint to check for code quality and potential errors.

## 📁 Project Structure

```
client/
├── public/                 # Static assets
│   ├── assets/           # Images and media files
│   ├── doctors/          # Doctor profile images
│   └── ...
├── src/
│   ├── app/              # Next.js App Router pages
│   │   ├── (admin)/      # Admin routes (protected)
│   │   │   └── admin/
│   │   │       ├── dashboard/
│   │   │       ├── appointments/
│   │   │       ├── doctors/
│   │   │       ├── blogs/
│   │   │       ├── users/
│   │   │       └── settings/
│   │   ├── (auth)/       # Authentication routes
│   │   │   ├── login/
│   │   │   └── signup/
│   │   ├── (doctor)/     # Doctor routes (protected)
│   │   │   └── doctor/
│   │   │       ├── dashboard/
│   │   │       ├── appointments/
│   │   │       ├── patients/
│   │   │       ├── schedule/
│   │   │       ├── profile/
│   │   │       └── settings/
│   │   ├── (patient)/    # Patient routes (protected)
│   │   │   └── patient/
│   │   │       ├── dashboard/
│   │   │       ├── appointments/
│   │   │       ├── find-doctors/
│   │   │       ├── prescriptions/
│   │   │       ├── notifications/
│   │   │       ├── profile/
│   │   │       └── settings/
│   │   ├── (site)/       # Public site routes
│   │   │   ├── about/
│   │   │   ├── blog/
│   │   │   ├── doctors/
│   │   │   ├── contact/
│   │   │   ├── appointments/
│   │   │   └── prescriptions/
│   │   ├── globals.css   # Global styles
│   │   └── layout.tsx    # Root layout
│   ├── components/       # Reusable React components
│   │   ├── admin/        # Admin-specific components
│   │   ├── doctor/       # Doctor-specific components
│   │   ├── patient/      # Patient-specific components
│   │   ├── forms/        # Form components
│   │   ├── landing/      # Landing page components
│   │   ├── layout/       # Layout components (Header, Footer)
│   │   ├── modals/       # Modal components
│   │   ├── sections/     # Section components
│   │   └── ui/           # UI primitives
│   ├── context/          # React Context providers
│   │   ├── AuthContext.tsx
│   │   └── BookingContext.tsx
│   ├── hooks/            # Custom React hooks
│   │   ├── useRazorpay.ts
│   │   └── useScrollDirection.ts
│   ├── lib/              # Utility libraries
│   │   ├── api.ts        # Axios API client
│   │   ├── apiHealth.ts  # API health checks
│   │   └── utils.ts      # Utility functions
│   └── types/            # TypeScript type definitions
│       └── index.ts      # Shared types
├── .eslintrc.json        # ESLint configuration
├── next.config.ts        # Next.js configuration
├── package.json          # Dependencies and scripts
├── postcss.config.mjs    # PostCSS configuration
├── tsconfig.json         # TypeScript configuration
└── README.md             # This file
```

## 🧩 Key Components

### Layout Components
- **Navigation** - Main navigation bar
- **Footer** - Site footer
- **AdminHeader/AdminSidebar** - Admin dashboard layout
- **DoctorHeader/DoctorSidebar** - Doctor dashboard layout
- **PatientHeader/PatientSidebar** - Patient dashboard layout

### Form Components
- **LoginForm** - User authentication
- **SignupForm** - User registration
- **AppointmentBookingForm** - Appointment creation
- **PrescriptionForm** - Prescription creation (doctor)
- **MedicalHistoryForm** - Medical history management
- **SymptomForm** - Symptom submission
- **ContactForm** - Contact form
- **ReviewForm** - Doctor review submission
- **ProfilePictureUpload** - Profile image upload

### Modal Components
- **AppointmentDetailModal** - Appointment details
- **CancelAppointmentModal** - Appointment cancellation
- **RescheduleModal** - Appointment rescheduling
- **PrescriptionDetailModal** - Prescription details
- **EditProfileModal** - Profile editing
- **LogoutConfirmationModal** - Logout confirmation

### Landing Page Components
- **HeroSection** - Hero banner
- **FeaturesGrid** - Feature showcase
- **TabbedFeatureSection** - Interactive features
- **StatsSection** - Statistics display
- **TestimonialSection** - User testimonials
- **CTASection** - Call-to-action section

## 🔌 API Integration

The application uses a centralized API client located at `src/lib/api.ts`. This client:

- Configures axios with base URL and default headers
- Automatically attaches authentication tokens to requests
- Handles token refresh on expiration
- Manages error responses and redirects

### Usage Example

```typescript
import api from '@/lib/api';

// GET request
const doctors = await api.get('/doctors');

// POST request
const appointment = await api.post('/bookings', {
  doctorId: '123',
  appointmentDate: '2024-01-15',
  appointmentTime: '10:00'
});
```

## 🔒 Authentication

Authentication is handled through:

1. **AuthContext** (`src/context/AuthContext.tsx`) - Manages user authentication state
2. **Token Storage** - JWT tokens stored in localStorage
3. **Protected Routes** - Route groups with authentication middleware
4. **Auto Token Refresh** - Automatic token refresh on expiration

### User Roles
- **patient** - Regular users booking appointments
- **doctor** - Healthcare providers managing appointments
- **admin** - System administrators

## 🎨 Styling

The application uses **Tailwind CSS 4** for styling:

- Utility-first CSS approach
- Responsive design with mobile-first approach
- Custom color schemes and design tokens
- Consistent spacing and typography

### Global Styles
Global styles and CSS variables are defined in `src/app/globals.css`.

## 📝 Development Guidelines

### Code Style
- Use TypeScript for all new files
- Follow React best practices and hooks patterns
- Use functional components with hooks
- Implement proper error handling
- Add loading states for async operations

### File Naming
- Components: PascalCase (e.g., `AppointmentCard.tsx`)
- Utilities: camelCase (e.g., `formatDate.ts`)
- Types: PascalCase interfaces/types (e.g., `User`, `Appointment`)

### Component Structure
```typescript
// Import statements
import React from 'react';
import { ComponentProps } from '@/types';

// Type definitions
interface Props {
  // props definition
}

// Component
export default function ComponentName({ prop1, prop2 }: Props) {
  // Component logic
  return (
    // JSX
  );
}
```

### Best Practices
- Keep components small and focused
- Use custom hooks for reusable logic
- Implement proper error boundaries
- Optimize images and assets
- Use Next.js Image component for images
- Implement proper SEO meta tags

## 🏗 Building for Production

1. **Build the application:**
   ```bash
   npm run build
   ```

2. **Start the production server:**
   ```bash
   npm start
   ```

3. **Or deploy to a platform:**
   - **Vercel** (recommended for Next.js)
   - **Netlify**
   - **AWS Amplify**
   - Any Node.js hosting platform

### Build Optimization
- Automatic code splitting
- Image optimization
- CSS minification
- Tree shaking
- Static page generation where applicable

## 🐛 Troubleshooting

### Common Issues

**Issue: API requests failing**
- Check that `NEXT_PUBLIC_API_URL` is correctly set
- Ensure the backend server is running
- Verify CORS settings on the backend

**Issue: Authentication not working**
- Check localStorage for token
- Verify token format and expiration
- Check AuthContext implementation

**Issue: Build errors**
- Clear `.next` folder: `rm -rf .next`
- Delete `node_modules` and reinstall: `rm -rf node_modules && npm install`
- Check TypeScript errors: `npm run lint`

**Issue: Styling not applying**
- Verify Tailwind CSS configuration
- Check PostCSS configuration
- Ensure classes are not purged incorrectly

### Getting Help
- Check the main project README for backend setup
- Review API documentation in `API_TESTING_GUIDE.md`
- Check Next.js documentation: [nextjs.org/docs](https://nextjs.org/docs)

## 🚀 Deployment

### Deploying to Vercel

This application is configured for deployment on Vercel. For detailed deployment instructions including CORS setup, environment variables, and connecting to a Render backend, see the [Deployment Guide](../DEPLOYMENT_GUIDE.md).

**Quick Steps:**
1. Push your code to GitHub
2. Import project in Vercel
3. Set root directory to `client`
4. Add environment variables (see [Environment Variables](../ENVIRONMENT_VARIABLES.md))
5. Deploy!

**Required Environment Variables:**
- `NEXT_PUBLIC_API_URL` - Your backend API URL
- `NEXT_PUBLIC_RAZORPAY_KEY_ID` - Razorpay public key

For complete deployment setup, see [DEPLOYMENT_GUIDE.md](../DEPLOYMENT_GUIDE.md)

## 📄 License

ISC

---

**Note:** This is the frontend application. Make sure the backend server is running and properly configured for the application to function correctly.
