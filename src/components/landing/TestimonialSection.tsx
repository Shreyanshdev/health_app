import Image from "next/image";

export function TestimonialSection() {
    return (
        <section className="bg-white py-16">
            <div className="container mx-auto px-4">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-12 text-center max-w-4xl mx-auto leading-tight">
                    Over <span className="bg-[#FFC107] px-2">16M clients</span> and <span className="bg-[#FFC107] px-2">225k practitioners</span> trust the HealthApp platform
                </h2>

                <div className="grid md:grid-cols-3 gap-6 max-w-7xl mx-auto md:h-[450px]">
                    {/* Card 1: Quote */}
                    <div className="bg-[#FFC107] rounded-[2.5rem] p-8 flex flex-col justify-between relative overflow-hidden group min-h-[300px]">
                        <div className="relative z-10">
                            <blockquote className="text-xl font-medium text-gray-900 leading-snug mb-6">
                                "I can't think of anything that I pay for as a group owner that's more worth it than HealthApp."
                            </blockquote>
                            <cite className="text-sm font-bold text-gray-900 tracking-wider uppercase block">
                                Dr. Lisa Hardebeck, PHD
                            </cite>
                        </div>
                        <button className="bg-transparent border-2 border-gray-900 text-gray-900 px-6 py-2 rounded-full font-bold hover:bg-gray-900 hover:text-white transition w-max mt-6 text-sm">
                            Keep reading
                        </button>
                        {/* Decorative shape */}
                        <div className="absolute -bottom-12 -right-12 w-40 h-40 bg-[#FFD54F] rounded-full opacity-50"></div>
                    </div>

                    {/* Card 2: Stat */}
                    <div className="bg-[#A5F3BC] rounded-[2.5rem] p-8 flex flex-col justify-center items-center text-center relative overflow-hidden min-h-[300px]">
                        <h3 className="text-4xl md:text-5xl font-bold text-[#1B3B36] mb-3">Voted #1</h3>
                        <p className="text-[#1B3B36] font-bold tracking-widest uppercase text-xs">EHR Software of 2024*</p>
                        <p className="absolute bottom-8 text-[10px] text-[#1B3B36]/70 max-w-xs text-center">
                            *Based on TechRadar review as of April 2024
                        </p>
                    </div>

                    {/* Card 3: Image with Hover */}
                    <div className="relative rounded-[2.5rem] overflow-hidden group h-full min-h-[300px]">
                        <Image
                            src="/testimonial_therapist.png"
                            alt="Dr. Donna Oriowo"
                            fill
                            className="object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity duration-500"></div>

                        <div className="absolute bottom-6 left-6 right-6 text-white transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                            <p className="text-xs font-bold tracking-wider uppercase mb-1 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">
                                Clinical Psychologist
                            </p>
                            <p className="text-base font-bold">Dr. Donna Oriowo, LCSW</p>
                            <p className="text-sm text-gray-200 mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-200 translate-y-4 group-hover:translate-y-0 leading-snug">
                                "HealthApp has revolutionized how I manage my practice. It's simply the best."
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
