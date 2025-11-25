'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { toast } from 'react-toastify';
import type { MedicalHistory } from '@/types';

interface MedicalHistoryFormProps {
  initialData?: MedicalHistory | null;
  onSuccess?: () => void;
}

export function MedicalHistoryForm({ initialData, onSuccess }: MedicalHistoryFormProps) {
  const [formData, setFormData] = useState({
    allergies: '',
    medications: '',
    pastSurgeries: '',
    chronicConditions: '',
    familyHistory: '',
    bloodGroup: '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        allergies: initialData.allergies?.join(', ') || '',
        medications: initialData.medications?.join(', ') || '',
        pastSurgeries: initialData.pastSurgeries?.join(', ') || '',
        chronicConditions: initialData.chronicConditions?.join(', ') || '',
        familyHistory: initialData.familyHistory || '',
        bloodGroup: initialData.bloodGroup || '',
      });
    }
  }, [initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = {
        allergies: formData.allergies.split(',').map(s => s.trim()).filter(Boolean),
        medications: formData.medications.split(',').map(s => s.trim()).filter(Boolean),
        pastSurgeries: formData.pastSurgeries.split(',').map(s => s.trim()).filter(Boolean),
        chronicConditions: formData.chronicConditions.split(',').map(s => s.trim()).filter(Boolean),
        familyHistory: formData.familyHistory,
        bloodGroup: formData.bloodGroup,
      };

      await api.put('/profile/medical-history', data);
      toast.success('Medical history updated successfully!');
      if (onSuccess) onSuccess();
    } catch (error) {
      toast.error('Failed to update medical history. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="allergies" className="block text-sm font-semibold text-gray-700 mb-2">
          Allergies (comma-separated)
        </label>
        <input
          id="allergies"
          type="text"
          value={formData.allergies}
          onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4CAF50] focus:border-transparent transition text-gray-900"
          placeholder="Peanuts, Penicillin, etc."
        />
      </div>

      <div>
        <label htmlFor="medications" className="block text-sm font-semibold text-gray-700 mb-2">
          Current Medications (comma-separated)
        </label>
        <input
          id="medications"
          type="text"
          value={formData.medications}
          onChange={(e) => setFormData({ ...formData, medications: e.target.value })}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4CAF50] focus:border-transparent transition"
          placeholder="Aspirin, Metformin, etc."
        />
      </div>

      <div>
        <label htmlFor="pastSurgeries" className="block text-sm font-semibold text-gray-700 mb-2">
          Past Surgeries (comma-separated)
        </label>
        <input
          id="pastSurgeries"
          type="text"
          value={formData.pastSurgeries}
          onChange={(e) => setFormData({ ...formData, pastSurgeries: e.target.value })}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4CAF50] focus:border-transparent transition"
          placeholder="Appendectomy, Knee surgery, etc."
        />
      </div>

      <div>
        <label htmlFor="chronicConditions" className="block text-sm font-semibold text-gray-700 mb-2">
          Chronic Conditions (comma-separated)
        </label>
        <input
          id="chronicConditions"
          type="text"
          value={formData.chronicConditions}
          onChange={(e) => setFormData({ ...formData, chronicConditions: e.target.value })}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4CAF50] focus:border-transparent transition"
          placeholder="Diabetes, Hypertension, etc."
        />
      </div>

      <div>
        <label htmlFor="familyHistory" className="block text-sm font-semibold text-gray-700 mb-2">
          Family History
        </label>
        <textarea
          id="familyHistory"
          value={formData.familyHistory}
          onChange={(e) => setFormData({ ...formData, familyHistory: e.target.value })}
          rows={4}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4CAF50] focus:border-transparent transition resize-none text-gray-900"
          placeholder="Any relevant family medical history..."
        />
      </div>

      <div>
        <label htmlFor="bloodGroup" className="block text-sm font-semibold text-gray-700 mb-2">
          Blood Group
        </label>
        <select
          id="bloodGroup"
          value={formData.bloodGroup}
          onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4CAF50] focus:border-transparent transition text-gray-900"
        >
          <option value="">Select blood group</option>
          <option value="A+">A+</option>
          <option value="A-">A-</option>
          <option value="B+">B+</option>
          <option value="B-">B-</option>
          <option value="AB+">AB+</option>
          <option value="AB-">AB-</option>
          <option value="O+">O+</option>
          <option value="O-">O-</option>
        </select>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-[#1B3B36] text-white py-3 rounded-lg font-semibold hover:bg-[#2E5C55] transition disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
      >
        {loading ? 'Saving...' : 'Save Medical History'}
      </button>
    </form>
  );
}

