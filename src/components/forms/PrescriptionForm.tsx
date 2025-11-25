'use client';

import { useState } from 'react';
import api from '@/lib/api';
import { toast } from 'react-toastify';
import type { Medication } from '@/types';

interface PrescriptionFormProps {
  appointmentId: string;
  onSuccess?: () => void;
}

export function PrescriptionForm({ appointmentId, onSuccess }: PrescriptionFormProps) {
  const [medications, setMedications] = useState<Medication[]>([
    { name: '', dosage: '', frequency: '', duration: '' },
  ]);
  const [instructions, setInstructions] = useState('');
  const [followUpDate, setFollowUpDate] = useState('');
  const [loading, setLoading] = useState(false);

  const addMedication = () => {
    setMedications([...medications, { name: '', dosage: '', frequency: '', duration: '' }]);
  };

  const removeMedication = (index: number) => {
    if (medications.length > 1) {
      setMedications(medications.filter((_, i) => i !== index));
    }
  };

  const updateMedication = (index: number, field: keyof Medication, value: string) => {
    const updated = [...medications];
    updated[index] = { ...updated[index], [field]: value };
    setMedications(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate medications
    const validMedications = medications.filter(
      med => med.name.trim() && med.dosage.trim() && med.frequency.trim() && med.duration.trim()
    );

    if (validMedications.length === 0) {
      toast.error('Please add at least one medication');
      return;
    }

    setLoading(true);

    try {
      await api.post('/prescriptions', {
        appointmentId,
        medications: validMedications,
        instructions: instructions.trim() || undefined,
        followUpDate: followUpDate || undefined,
      });

      toast.success('Prescription created successfully!');
      if (onSuccess) onSuccess();
    } catch (error) {
      toast.error('Failed to create prescription. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Medications</h3>
          <button
            type="button"
            onClick={addMedication}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition text-sm"
          >
            + Add Medication
          </button>
        </div>

        <div className="space-y-4">
          {medications.map((med, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4">
              <div className="flex justify-between items-center mb-3">
                <h4 className="font-medium text-gray-900">Medication {index + 1}</h4>
                {medications.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeMedication(index)}
                    className="text-red-600 hover:text-red-700 text-sm"
                  >
                    Remove
                  </button>
                )}
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Name *</label>
                  <input
                    type="text"
                    required
                    value={med.name}
                    onChange={(e) => updateMedication(index, 'name', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Paracetamol"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Dosage *</label>
                  <input
                    type="text"
                    required
                    value={med.dosage}
                    onChange={(e) => updateMedication(index, 'dosage', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., 500mg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Frequency *</label>
                  <input
                    type="text"
                    required
                    value={med.frequency}
                    onChange={(e) => updateMedication(index, 'frequency', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Twice daily"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Duration *</label>
                  <input
                    type="text"
                    required
                    value={med.duration}
                    onChange={(e) => updateMedication(index, 'duration', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., 7 days"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <label htmlFor="instructions" className="block text-sm font-semibold text-gray-700 mb-2">
          Instructions
        </label>
        <textarea
          id="instructions"
          value={instructions}
          onChange={(e) => setInstructions(e.target.value)}
          rows={4}
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition resize-none"
          placeholder="Additional instructions for the patient..."
        />
      </div>

      <div>
        <label htmlFor="followUpDate" className="block text-sm font-semibold text-gray-700 mb-2">
          Follow-up Date (Optional)
        </label>
        <input
          id="followUpDate"
          type="date"
          value={followUpDate}
          onChange={(e) => setFollowUpDate(e.target.value)}
          min={new Date().toISOString().split('T')[0]}
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Creating Prescription...' : 'Create Prescription'}
      </button>
    </form>
  );
}

