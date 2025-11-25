import Link from 'next/link';
import { Facebook, Twitter, Instagram, Linkedin, Heart } from 'lucide-react';

export function Footer() {
  return (
    <div className="bg-white pt-20">
      <footer className="bg-[#1B3B36] text-white rounded-t-[3rem]">
        <div className="container mx-auto px-4 py-12">
          <div className="grid md:grid-cols-4 gap-12">
            {/* Logo & Description */}
            <div className="md:col-span-1">
              <Link href="/" className="flex items-center space-x-2 mb-4">
                <span className="text-2xl font-bold">HealthApp</span>
              </Link>
              <p className="text-gray-300 text-sm mb-6">
                Empowering healthcare with seamless doctor-patient connection and practice management tools.
              </p>
              {/* Social Links */}
              <div className="flex space-x-4">
                <SocialLink href="#" icon={<Facebook className="w-5 h-5" />} label="Facebook" />
                <SocialLink href="#" icon={<Twitter className="w-5 h-5" />} label="Twitter" />
                <SocialLink href="#" icon={<Instagram className="w-5 h-5" />} label="Instagram" />
                <SocialLink href="#" icon={<Linkedin className="w-5 h-5" />} label="LinkedIn" />
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="font-bold text-lg mb-4">Quick Links</h3>
              <ul className="space-y-3 text-gray-300 text-sm">
                <li><Link href="/doctors" className="hover:text-white transition">Find Doctors</Link></li>
                <li><Link href="/book-appointment" className="hover:text-white transition">Book Appointment</Link></li>
                <li><Link href="/blog" className="hover:text-white transition">Health Blog</Link></li>
                <li><Link href="/about" className="hover:text-white transition">About Us</Link></li>
              </ul>
            </div>

            {/* Resources */}
            <div>
              <h3 className="font-bold text-lg mb-4">Resources</h3>
              <ul className="space-y-3 text-gray-300 text-sm">
                <li><Link href="/login" className="hover:text-white transition">Login</Link></li>
                <li><Link href="/signup" className="hover:text-white transition">Sign Up</Link></li>
                <li><Link href="/contact" className="hover:text-white transition">Contact Us</Link></li>
                <li><Link href="#" className="hover:text-white transition">Help Center</Link></li>
              </ul>
            </div>

            {/* Contact Info */}
            <div>
              <h3 className="font-bold text-lg mb-4">Contact</h3>
              <ul className="space-y-3 text-gray-300 text-sm">
                <li>123 Healthcare Ave, Medical District</li>
                <li>New York, NY 10001</li>
                <li>+1 (555) 123-4567</li>
                <li>support@healthapp.com</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-700 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-gray-400">
            <p>&copy; {new Date().getFullYear()} HealthApp. All rights reserved.</p>
            <div className="flex items-center space-x-1 mt-4 md:mt-0">
              <span>Made with</span>
              <Heart className="w-4 h-4 text-red-500 fill-current" />
              <span>for better healthcare.</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function SocialLink({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
  return (
    <a
      href={href}
      className="text-gray-300 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-full"
      aria-label={label}
    >
      {icon}
    </a>
  );
}
