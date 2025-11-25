import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { DoctorDetail } from "@/components/sections/DoctorDetail";

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  return {
    title: `Doctor Profile - Health App`,
    description: "View doctor profile and book an appointment",
  };
}

export default async function DoctorDetailPage({ params }: Props) {
  const { id } = await params;

  return (
    <div className="min-h-screen bg-white">
      {/* Back Button */}
      <div className="absolute top-6 left-6 z-10">
        <Link
          href="/doctors"
          className="flex items-center text-gray-600 hover:text-[#1B3B36] transition font-bold bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm hover:shadow-md"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Doctors
        </Link>
      </div>

      {/* Header Background */}
      <div className="h-64 bg-[#1B3B36] rounded-b-[3rem] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#4CAF50] rounded-full blur-3xl opacity-20 -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#FFC107] rounded-full blur-3xl opacity-10 translate-y-1/2 -translate-x-1/2"></div>
      </div>

      {/* Doctor Detail */}
      <section className="container mx-auto px-4 -mt-32 pb-20 relative z-20">
        <DoctorDetail doctorId={id} />
      </section>
    </div>
  );
}
