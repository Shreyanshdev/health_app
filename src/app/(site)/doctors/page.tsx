import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { DoctorsList } from "@/components/sections/DoctorsList";

export const metadata: Metadata = {
  title: "Our Doctors - Health App",
  description: "Browse our team of expert doctors and healthcare professionals. Book appointments with specialists in various fields.",
};

export default async function DoctorsPage() {
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
            Our Expert <span className="text-[#A5F3BC]">Doctors</span>
          </h1>
          <p className="text-xl text-gray-200 max-w-2xl mx-auto">
            Meet our team of qualified healthcare professionals dedicated to your wellbeing.
          </p>
        </div>
      </section>

      {/* Doctors List */}
      <section className="container mx-auto px-4 pb-20">
        <DoctorsList />
      </section>
    </div>
  );
}
