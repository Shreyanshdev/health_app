import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Shield, Heart, Zap, Users, Award, Globe } from "lucide-react";

export const metadata: Metadata = {
  title: "About Us - Health App",
  description: "Learn about Health App - Your trusted partner in healthcare.",
};

export default function AboutPage() {
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
      <section className="relative bg-[#1B3B36] text-white py-24 overflow-hidden rounded-b-[3rem]">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#4CAF50] rounded-full blur-3xl opacity-20 -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#FFC107] rounded-full blur-3xl opacity-10 translate-y-1/2 -translate-x-1/2"></div>

        <div className="container mx-auto px-4 text-center relative z-10">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight">
            We Are <span className="text-[#A5F3BC]">HealthApp</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-200 max-w-3xl mx-auto leading-relaxed">
            Revolutionizing healthcare with a patient-first approach. We bridge the gap between technology and compassionate care.
          </p>
        </div>
      </section>

      {/* Mission & Vision Cards */}
      <section className="container mx-auto px-4 -mt-16 relative z-20 mb-20">
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Mission Card */}
          <div className="bg-white p-10 rounded-[2rem] shadow-xl border border-gray-100 hover:shadow-2xl transition duration-300 group">
            <div className="w-16 h-16 bg-[#E8F5E9] rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition duration-300">
              <Heart className="w-8 h-8 text-[#4CAF50]" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Mission</h2>
            <p className="text-gray-600 text-lg leading-relaxed">
              To make quality healthcare accessible, affordable, and convenient for everyone. We strive to empower patients with control over their health journey while providing doctors with the tools they need to deliver exceptional care.
            </p>
          </div>

          {/* Vision Card */}
          <div className="bg-white p-10 rounded-[2rem] shadow-xl border border-gray-100 hover:shadow-2xl transition duration-300 group">
            <div className="w-16 h-16 bg-[#FFF8E1] rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition duration-300">
              <Globe className="w-8 h-8 text-[#FFC107]" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Vision</h2>
            <p className="text-gray-600 text-lg leading-relaxed">
              A world where healthcare is seamless, proactive, and borderless. We envision a future where technology enhances the human connection in medicine, ensuring no one is left behind.
            </p>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Our Core Values</h2>
            <div className="w-24 h-1 bg-[#FFC107] mx-auto rounded-full"></div>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <ValueCard
              icon={<Shield className="w-6 h-6 text-[#1B3B36]" />}
              title="Trust & Security"
              description="Your health data is sacred. We employ bank-grade security to protect your privacy at all costs."
            />
            <ValueCard
              icon={<Users className="w-6 h-6 text-[#1B3B36]" />}
              title="Patient Centric"
              description="Every decision we make starts with the patient. Your well-being is our north star."
            />
            <ValueCard
              icon={<Zap className="w-6 h-6 text-[#1B3B36]" />}
              title="Innovation"
              description="We constantly push the boundaries of what's possible in digital health to serve you better."
            />
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-[#1B3B36] text-white relative overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <StatItem number="10K+" label="Active Users" />
            <StatItem number="500+" label="Expert Doctors" />
            <StatItem number="50K+" label="Appointments" />
            <StatItem number="98%" label="Satisfaction" />
          </div>
        </div>
      </section>

      {/* Team Section (Optional/Placeholder) */}
      <section className="py-20 container mx-auto px-4 text-center">
        <h2 className="text-4xl font-bold text-gray-900 mb-12">Meet the Team</h2>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Built by a passionate team of doctors, engineers, and designers committed to transforming healthcare.
        </p>
      </section>
    </div>
  );
}

function ValueCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 hover:-translate-y-2 transition duration-300">
      <div className="w-12 h-12 bg-[#A5F3BC] rounded-xl flex items-center justify-center mb-6">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-gray-900 mb-3">{title}</h3>
      <p className="text-gray-600 leading-relaxed">{description}</p>
    </div>
  );
}

function StatItem({ number, label }: { number: string; label: string }) {
  return (
    <div>
      <div className="text-4xl md:text-5xl font-bold text-[#FFC107] mb-2">{number}</div>
      <div className="text-blue-100 font-medium tracking-wide uppercase text-sm">{label}</div>
    </div>
  );
}
