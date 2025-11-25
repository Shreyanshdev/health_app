import { CheckCircle, Clock, DollarSign, Monitor } from "lucide-react";

export async function StatsSection() {
    return (
        <section className="bg-[#A5F3BC] py-20">
            <div className="container mx-auto px-4">
                <h2 className="text-4xl font-bold text-gray-900 mb-16 text-center md:text-left">
                    How HealthApp helps
                </h2>

                <div className="grid md:grid-cols-4 gap-8">
                    <div className="flex flex-col items-start">
                        <div className="bg-white p-3 rounded-lg mb-4 shadow-sm">
                            <CheckCircle className="w-8 h-8 text-green-600" />
                        </div>
                        <h3 className="text-4xl font-bold text-gray-900 mb-2">96%</h3>
                        <p className="text-gray-800 text-sm leading-relaxed">
                            of practitioners agree HealthApp is intuitive to set up
                        </p>
                    </div>

                    <div className="flex flex-col items-start">
                        <div className="bg-white p-3 rounded-lg mb-4 shadow-sm">
                            <Clock className="w-8 h-8 text-yellow-500" />
                        </div>
                        <h3 className="text-4xl font-bold text-gray-900 mb-2">13+</h3>
                        <p className="text-gray-800 text-sm leading-relaxed">
                            hours saved per month on documentation with HealthApp
                        </p>
                    </div>

                    <div className="flex flex-col items-start">
                        <div className="bg-white p-3 rounded-lg mb-4 shadow-sm">
                            <DollarSign className="w-8 h-8 text-green-600" />
                        </div>
                        <h3 className="text-4xl font-bold text-gray-900 mb-2">14+</h3>
                        <p className="text-gray-800 text-sm leading-relaxed">
                            hours saved per month on billing with HealthApp
                        </p>
                    </div>

                    <div className="flex flex-col items-start">
                        <div className="bg-white p-3 rounded-lg mb-4 shadow-sm">
                            <Monitor className="w-8 h-8 text-blue-600" />
                        </div>
                        <h3 className="text-4xl font-bold text-gray-900 mb-2">132M+</h3>
                        <p className="text-gray-800 text-sm leading-relaxed">
                            telehealth appointments and counting
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}
