'use client';

import { useState } from 'react';
import { toast } from 'react-toastify';
import api from '@/lib/api';
import axios from 'axios';

export function ContactForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (formData.phone.trim() && !/^[\d\s\-()]+$/.test(formData.phone.trim())) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    if (!formData.message.trim()) {
      newErrors.message = 'Message is required';
    } else if (formData.message.trim().length < 10) {
      newErrors.message = 'Message must be at least 10 characters long';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    setLoading(true);

    try {
      const contactData = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim() || '',
        message: formData.message.trim(),
        formType: 'contact',
      };

      await api.post('/leads', contactData);
      
      toast.success('Thank you for contacting us! We will get back to you soon.', {
        position: 'top-right',
        autoClose: 5000,
      });
      
      // Reset form
      setFormData({
        name: '',
        email: '',
        phone: '',
        message: '',
      });
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      const errorMessage = error.response?.data?.message || 'Failed to send message. Please try again.';
      toast.error(errorMessage, {
        position: 'top-right',
        autoClose: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-[3rem] shadow-2xl overflow-hidden border border-gray-100">
      <div className="p-8 lg:p-12">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Send us a Message</h2>
          <p className="text-gray-600">
            Fill out the form below and we&apos;ll get back to you as soon as possible.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name Field */}
          <div>
            <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
              Your Name <span className="text-red-500">*</span>
            </label>
            <input
              id="name"
              type="text"
              required
              value={formData.name}
              onChange={(e) => {
                setFormData({ ...formData, name: e.target.value });
                if (errors.name) setErrors({ ...errors, name: '' });
              }}
              className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-[#4CAF50] focus:border-[#4CAF50] transition text-gray-900 ${
                errors.name ? 'border-red-300' : 'border-gray-200'
              }`}
              placeholder="John Doe"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name}</p>
            )}
          </div>

          {/* Email Field */}
          <div>
            <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
              Email Address <span className="text-red-500">*</span>
            </label>
            <input
              id="email"
              type="email"
              required
              value={formData.email}
              onChange={(e) => {
                setFormData({ ...formData, email: e.target.value });
                if (errors.email) setErrors({ ...errors, email: '' });
              }}
              className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-[#4CAF50] focus:border-[#4CAF50] transition text-gray-900 ${
                errors.email ? 'border-red-300' : 'border-gray-200'
              }`}
              placeholder="you@example.com"
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email}</p>
            )}
          </div>

          {/* Phone Field */}
          <div>
            <label htmlFor="phone" className="block text-sm font-semibold text-gray-700 mb-2">
              Phone Number <span className="text-gray-500 text-xs font-normal">(Optional)</span>
            </label>
            <input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => {
                // Allow only digits, spaces, hyphens, and parentheses
                const cleaned = e.target.value.replace(/[^\d\s\-()]/g, '');
                setFormData({ ...formData, phone: cleaned });
                if (errors.phone) setErrors({ ...errors, phone: '' });
              }}
              className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-[#4CAF50] focus:border-[#4CAF50] transition text-gray-900 ${
                errors.phone ? 'border-red-300' : 'border-gray-200'
              }`}
              placeholder="+1 (555) 123-4567"
            />
            {errors.phone && (
              <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
            )}
          </div>

          {/* Message/Query Field */}
          <div>
            <label htmlFor="message" className="block text-sm font-semibold text-gray-700 mb-2">
              Feedback / Query <span className="text-red-500">*</span>
            </label>
            <textarea
              id="message"
              required
              value={formData.message}
              onChange={(e) => {
                setFormData({ ...formData, message: e.target.value });
                if (errors.message) setErrors({ ...errors, message: '' });
              }}
              rows={6}
              className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-[#4CAF50] focus:border-[#4CAF50] transition resize-none text-gray-900 ${
                errors.message ? 'border-red-300' : 'border-gray-200'
              }`}
              placeholder="Tell us about your query or feedback..."
            />
            {errors.message && (
              <p className="mt-1 text-sm text-red-600">{errors.message}</p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              {formData.message.length} characters (minimum 10 required)
            </p>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-[#1B3B36] to-[#2E5C55] text-white py-4 rounded-xl font-semibold text-lg hover:from-[#2E5C55] hover:to-[#1B3B36] transition shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 cursor-pointer"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>Sending...</span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
                <span>Send Message</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
