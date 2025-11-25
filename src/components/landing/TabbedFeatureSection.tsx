'use client';

import { useState } from 'react';
import Image from 'next/image';
import { CheckCircle } from 'lucide-react';

export function TabbedFeatureSection() {
    const [activeTab, setActiveTab] = useState<'patient' | 'doctor'>('patient');

    return (
        <section id="how-it-works" className="py-20 container mx-auto px-4">
            <div className={`rounded-[3rem] p-8 md:p-16 transition-colors duration-500 ${activeTab === 'patient' ? 'bg-[#E0F2F1]' : 'bg-[#FFEBEE]'
                }`}>
                <div className="text-center max-w-3xl mx-auto mb-12">
                    <h2 className="text-4xl font-bold text-gray-900 mb-8">
                        Intuitive tools to help you thrive
                    </h2>

                    <div className="bg-white inline-flex rounded-full p-1 shadow-sm">
                        <button
                            onClick={() => setActiveTab('patient')}
                            className={`px-8 py-3 rounded-full text-sm font-bold transition-all duration-300 ${activeTab === 'patient'
                                ? 'bg-[#A5F3BC] text-gray-900 shadow-sm'
                                : 'text-gray-600 hover:text-gray-900'
                                }`}
                        >
                            For Patients
                        </button>
                        <button
                            onClick={() => setActiveTab('doctor')}
                            className={`px-8 py-3 rounded-full text-sm font-bold transition-all duration-300 ${activeTab === 'doctor'
                                ? 'bg-[#FFCDD2] text-red-900 shadow-sm'
                                : 'text-gray-600 hover:text-gray-900'
                                }`}
                        >
                            For Doctors
                        </button>
                    </div>
                </div>

                <div className="grid md:grid-cols-2 gap-12 items-center">
                    <div className="space-y-8">
                        <h3 className="text-3xl font-bold text-gray-900">
                            {activeTab === 'patient' ? 'Seamless Patient Experience' : 'Streamline Your Practice'}
                        </h3>
                        <p className="text-lg text-gray-700 leading-relaxed">
                            {activeTab === 'patient'
                                ? 'From booking appointments to managing your health records, our platform makes healthcare accessible and easy.'
                                : 'Manage appointments, patient records, and billing all in one place. Focus on care while we handle the administration.'}
                        </p>

                        <ul className="space-y-4">
                            {activeTab === 'patient' ? (
                                <>
                                    <FeatureItem text="Request Callback & Symptom Assessment" activeTab={activeTab} />
                                    <FeatureItem text="Online & In-Clinic Appointment Booking" activeTab={activeTab} />
                                    <FeatureItem text="Secure Payments via Razorpay" activeTab={activeTab} />
                                    <FeatureItem text="Google & Apple Calendar Sync" activeTab={activeTab} />
                                </>
                            ) : (
                                <>
                                    <FeatureItem text="Profile & Availability Management" activeTab={activeTab} />
                                    <FeatureItem text="Automated Appointment Notifications" activeTab={activeTab} />
                                    <FeatureItem text="Patient Records & History" activeTab={activeTab} />
                                    <FeatureItem text="Integrated Calendar Sync" activeTab={activeTab} />
                                </>
                            )}
                        </ul>

                        <button className={`px-8 py-3 rounded-full font-bold transition shadow-lg text-white ${activeTab === 'patient'
                            ? 'bg-[#1B5E20] hover:bg-[#2E7D32]'
                            : 'bg-[#B71C1C] hover:bg-[#C62828]'
                            }`}>
                            {activeTab === 'patient' ? 'Book an Appointment' : 'Join as a Doctor'}
                        </button>
                    </div>

                    <div className="relative h-[400px] md:h-[500px] w-full rounded-3xl overflow-hidden shadow-xl">
                        <Image
                            src={activeTab === 'patient' ? '/tabbed_feature_patient.png' : '/tabbed_feature_doctor.png'}
                            alt={activeTab === 'patient' ? 'Patient using app' : 'Doctor using tablet'}
                            fill
                            className="object-cover transition-opacity duration-500"
                        />

                        {/* Floating Card Overlay */}
                        <div className="absolute top-8 left-8 bg-white p-4 rounded-xl shadow-lg max-w-[200px] animate-fade-in">
                            <div className="flex items-center gap-2 mb-2">
                                <div className={`w-2 h-2 rounded-full ${activeTab === 'patient' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                <span className="text-xs font-bold text-gray-600">
                                    {activeTab === 'patient' ? 'Appointment Confirmed' : 'New Booking'}
                                </span>
                            </div>
                            <p className="text-sm font-bold text-gray-900">
                                {activeTab === 'patient' ? 'Dr. Sarah Smith' : 'Patient: John Doe'}
                            </p>
                            <p className="text-xs text-gray-500">Today, 2:00 PM</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

function FeatureItem({ text, activeTab }: { text: string, activeTab: 'patient' | 'doctor' }) {
    return (
        <li className="flex items-center gap-3">
            <CheckCircle className={`w-6 h-6 flex-shrink-0 ${activeTab === 'patient' ? 'text-[#1B5E20]' : 'text-[#B71C1C]'
                }`} />
            <span className="text-gray-800 font-medium border-b border-gray-300 pb-1 w-full">{text}</span>
        </li>
    );
}
