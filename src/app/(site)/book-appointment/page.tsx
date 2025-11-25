import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { AppointmentBookingForm } from "@/components/forms/AppointmentBookingForm";

export const metadata: Metadata = {
  title: "Book Appointment - Health App",
  description: "Book an appointment with our expert doctors. Choose between online or in-clinic consultations.",
  robots: {
    index: false,
    follow: false,
  },
};

export const dynamic = 'force-dynamic';

export default function BookAppointmentPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Back Button */}
      <div className="absolute top-6 left-6 z-10">
        <Link
          href="/"
          className="flex items-center text-gray-600 hover:text-[#1B3B36] transition font-bold bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm hover:shadow-md"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Home
        </Link>
      </div>

      {/* Hero Section */}
      <section className="relative bg-[#1B3B36] text-white py-20 overflow-hidden rounded-b-[3rem] mb-12">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#4CAF50] rounded-full blur-3xl opacity-20 -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#FFC107] rounded-full blur-3xl opacity-10 translate-y-1/2 -translate-x-1/2"></div>

        <div className="container mx-auto px-4 text-center relative z-10">
          <h1 className="text-4xl md:text-6xl font-bold mb-4 tracking-tight">
            Book Your <span className="text-[#A5F3BC]">Appointment</span>
          </h1>
          <p className="text-xl text-gray-200 max-w-2xl mx-auto">
            Schedule your consultation with our expert healthcare professionals. We&apos;re here to help you on your health journey.
          </p>
        </div>
      </section>

      {/* Booking Form */}
      <section className="container mx-auto px-4 pb-20">
        <div className="max-w-6xl mx-auto">
          <AppointmentBookingForm />
        </div>
      </section>
    </div>
  );
}
