import Link from "next/link";
import Image from "next/image";

export async function HeroSection() {
  return (
    <section className="container mx-auto px-4 py-16 md:py-24">
      <div className="grid md:grid-cols-2 gap-12 items-center">
        <div className="max-w-2xl">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Doctor-Patient <br />
            <span className="bg-yellow-300 px-2 rounded-lg inline-block transform -rotate-1">
              Healthcare
            </span>{" "}
            Platform MVP
          </h1>
          <p className="text-xl text-gray-600 mb-8 leading-relaxed">
            A comprehensive solution for online appointments, symptom assessment, and practice management.
            Built on the MERN Stack for seamless healthcare delivery.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              href="/book-appointment"
              className="bg-yellow-400 text-gray-900 px-8 py-4 rounded-full font-bold text-lg hover:bg-yellow-500 transition shadow-lg hover:shadow-xl inline-block text-center"
            >
              Book Appointment
            </Link>
            <Link
              href="#how-it-works"
              className="bg-white text-gray-900 px-8 py-4 rounded-full font-bold text-lg border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition inline-block text-center"
            >
              How it Works
            </Link>
          </div>
        </div>
        <div className="relative h-[500px] w-full rounded-3xl overflow-hidden shadow-2xl">
          <Image
            src="/hero_therapist_patient.png"
            alt="Doctor and Patient"
            fill
            className="object-cover"
            priority
          />
        </div>
      </div>
    </section>
  );
}
