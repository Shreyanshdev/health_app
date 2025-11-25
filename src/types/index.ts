// TypeScript type definitions matching backend models

export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'admin' | 'doctor' | 'patient';
  phone?: string;
  status?: 'pending' | 'approved' | 'rejected';
  profilePicture?: string;
  address?: string;
  dateOfBirth?: string;
  gender?: 'male' | 'female' | 'other';
  isEmailVerified?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Doctor {
  _id: string;
  userId: string | User;
  specialization: string;
  qualification?: string;
  experience?: number;
  availability?: {
    [key: string]: string[];
  };
  bio?: string;
  image?: string;
  consultationFee?: number;
  rating?: number;
  totalReviews?: number;
  isActive?: boolean;
  status?: 'pending' | 'approved' | 'rejected';
  approvedBy?: string | User;
  approvedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Appointment {
  _id: string;
  doctorId: string | Doctor;
  patientId: string | User;
  patientName: string;
  patientEmail: string;
  patientPhone: string;
  appointmentDate: string;
  appointmentTime: string;
  appointmentType: 'online' | 'in-clinic';
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  symptoms?: string;
  notes?: string;
  consultationNotes?: string;
  prescriptionId?: string | Prescription;
  cancelledAt?: string;
  cancellationReason?: string;
  cancelledBy?: string | User;
  googleCalendarEventId?: string;
  appleCalendarEventId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Blog {
  _id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  metaTitle?: string;
  metaDescription?: string;
  tags?: string[];
  category?: string;
  author?: string;
  featuredImage?: string;
  published: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Transaction {
  _id: string;
  appointmentId?: string | Appointment;
  razorpayOrderId: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
  amount: number;
  currency: string;
  status: 'pending' | 'success' | 'failed' | 'refunded';
  patientEmail?: string;
  patientName?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Lead {
  _id: string;
  name: string;
  email: string;
  phone: string;
  message?: string;
  symptoms?: string;
  formType: 'callback' | 'symptom' | 'contact';
  status: 'new' | 'contacted' | 'converted' | 'closed';
  createdAt?: string;
  updatedAt?: string;
}

export interface Review {
  _id: string;
  doctorId: string | Doctor;
  patientId: string | User;
  appointmentId: string | Appointment;
  rating: number;
  comment?: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt?: string;
  updatedAt?: string;
}

export interface MedicalHistory {
  _id: string;
  patientId: string | User;
  allergies?: string[];
  medications?: string[];
  pastSurgeries?: string[];
  chronicConditions?: string[];
  familyHistory?: string;
  bloodGroup?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Medication {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions?: string;
}

export interface Prescription {
  _id: string;
  appointmentId: string | Appointment;
  doctorId: string | User;
  patientId: string | User;
  medications: Medication[];
  instructions?: string;
  diagnosis?: string;
  datePrescribed?: string;
  followUpDate?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Notification {
  _id: string;
  userId: string | User;
  type: 'appointment' | 'approval' | 'rejection' | 'reminder' | 'prescription' | 'review' | 'system';
  title: string;
  message: string;
  isRead: boolean;
  link?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface DoctorRegistrationRequest {
  _id: string;
  userId: string | User;
  specialization: string;
  qualification: string;
  experience?: number;
  bio?: string;
  status: 'pending' | 'approved' | 'rejected';
  requestedAt?: string;
  reviewedAt?: string;
  reviewedBy?: string | User;
  rejectionReason?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Favorite {
  _id: string;
  userId: string | User;
  doctorId: string | Doctor;
  createdAt?: string;
  updatedAt?: string;
}

export interface ActivityLog {
  _id: string;
  userId: string | User;
  action: string;
  entityType: 'user' | 'doctor' | 'appointment' | 'review' | 'prescription' | 'system';
  entityId?: string;
  details?: Record<string, unknown>;
  ipAddress?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ApiError {
  message: string;
  code?: string;
}
