import Link from 'next/link';
import {
    Video,
    User,
    Calendar,
    FileText,
    CreditCard,
    Activity,
    LayoutDashboard,
    BookOpen
} from 'lucide-react';

export function FeaturesGrid() {
    return (
        <section className="py-20 bg-white">
            <div className="container mx-auto px-4">
                <div className="flex justify-between items-center mb-12">
                    <h2 className="text-4xl font-bold text-gray-900">
                        Get more with HealthApp
                    </h2>
                    <Link
                        href="/features"
                        className="hidden md:inline-block px-6 py-2 rounded-full border border-gray-300 font-bold text-gray-700 hover:border-gray-900 transition"
                    >
                        View all features
                    </Link>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <FeatureCard
                        icon={<Video className="w-6 h-6 text-[#1B3B36]" />}
                        title="Telehealth"
                        linkText="Provide care from anywhere"
                        href="/telehealth"
                    />
                    <FeatureCard
                        icon={<User className="w-6 h-6 text-[#1B3B36]" />}
                        title="Client Portal"
                        linkText="Empower clients"
                        href="/portal"
                    />
                    <FeatureCard
                        icon={<Calendar className="w-6 h-6 text-[#1B3B36]" />}
                        title="Scheduling"
                        linkText="Manage appointments"
                        href="/scheduling"
                        highlighted
                    />
                    <FeatureCard
                        icon={<FileText className="w-6 h-6 text-[#1B3B36]" />}
                        title="Notes & documentation"
                        linkText="Get customizable templates"
                        href="/documentation"
                    />
                    <FeatureCard
                        icon={<CreditCard className="w-6 h-6 text-[#1B3B36]" />}
                        title="Billing & payments"
                        linkText="Modernize your client billing"
                        href="/billing"
                    />
                    <FeatureCard
                        icon={<Activity className="w-6 h-6 text-[#1B3B36]" />}
                        title="Symptom Assessment"
                        linkText="Simplify diagnosis"
                        href="/assessment"
                    />
                    <FeatureCard
                        icon={<LayoutDashboard className="w-6 h-6 text-[#1B3B36]" />}
                        title="Admin Dashboard"
                        linkText="Take your practice with you"
                        href="/admin"
                    />
                    <FeatureCard
                        icon={<BookOpen className="w-6 h-6 text-[#1B3B36]" />}
                        title="Health Blog"
                        linkText="Find the answers you need"
                        href="/blog"
                    />
                </div>

                <div className="mt-8 text-center md:hidden">
                    <Link
                        href="/features"
                        className="inline-block px-6 py-2 rounded-full border border-gray-300 font-bold text-gray-700 hover:border-gray-900 transition"
                    >
                        View all features
                    </Link>
                </div>
            </div>
        </section>
    );
}

function FeatureCard({
    icon,
    title,
    linkText,
    href,
    highlighted = false
}: {
    icon: React.ReactNode;
    title: string;
    linkText: string;
    href: string;
    highlighted?: boolean;
}) {
    return (
        <div className={`rounded-xl p-8 flex flex-col justify-between min-h-[240px] transition-shadow hover:shadow-lg border border-gray-100 ${highlighted ? 'bg-[#FFF9C4]' : 'bg-white'
            }`}>
            <div>
                <div className="mb-6">
                    {icon}
                </div>
                <h3 className="text-xl font-medium text-gray-900 mb-2">{title}</h3>
            </div>
            <div>
                <Link
                    href={href}
                    className="text-sm font-bold text-gray-900 border-b-2 border-[#FFC107] pb-0.5 hover:border-gray-900 transition-colors inline-block"
                >
                    {linkText}
                </Link>
            </div>
        </div>
    );
}
