import Link from "next/link";
import Image from "next/image";

export async function CTASection() {
    return (
        <section className="bg-yellow-400 py-24 relative overflow-hidden">
            <div className="container mx-auto px-4 relative z-10">
                <div className="flex flex-col md:flex-row items-center justify-between max-w-6xl mx-auto">
                    <div className="max-w-xl mb-12 md:mb-0">
                        <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
                            Always remain <br />
                            HIPAA-compliant
                        </h2>
                        <p className="text-xl text-gray-800 mb-8 leading-relaxed">
                            With HealthApp's advanced data privacy and network protection,
                            you can ensure the confidentiality and security of health information.
                        </p>
                        <Link
                            href="/security"
                            className="text-gray-900 font-bold text-lg border-b-2 border-gray-900 hover:text-gray-700 transition inline-block"
                        >
                            Learn more
                        </Link>

                        <div className="flex gap-8 mt-12">
                            <div className="flex items-center gap-2">
                                <ShieldCheckIcon className="w-8 h-8 text-gray-900" />
                                <div className="text-xs font-bold uppercase tracking-wider">HITRUST<br />CSF Certified</div>
                            </div>
                            <div className="flex items-center gap-2">
                                <ShieldCheckIcon className="w-8 h-8 text-gray-900" />
                                <div className="text-xs font-bold uppercase tracking-wider">HIPAA<br />Compliant</div>
                            </div>
                        </div>
                    </div>

                    <div className="relative w-full md:w-[500px] h-[400px] rounded-3xl overflow-hidden shadow-2xl">
                        <Image
                            src="/hero_therapist_patient.png" // Reusing for now as placeholder for the video call image
                            alt="Video call security"
                            fill
                            className="object-cover"
                        />
                        <div className="absolute bottom-8 left-8 bg-blue-200 px-4 py-2 rounded-full flex items-center gap-2">
                            <ShieldCheckIcon className="w-5 h-5 text-gray-900" />
                            <span className="text-sm font-bold text-gray-900">HIPAA-compliant</span>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

function ShieldCheckIcon({ className }: { className?: string }) {
    return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
    );
}
