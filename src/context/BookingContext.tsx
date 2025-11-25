'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

interface BookingContextType {
  currentStep: number;
  setCurrentStep: (step: number) => void;
  bookingData: any;
  setBookingData: (data: any) => void;
}

const BookingContext = createContext<BookingContextType | undefined>(undefined);

export function BookingProvider({ children }: { children: ReactNode }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [bookingData, setBookingData] = useState<any>({});

  return (
    <BookingContext.Provider
      value={{
        currentStep,
        setCurrentStep,
        bookingData,
        setBookingData,
      }}
    >
      {children}
    </BookingContext.Provider>
  );
}

export function useBooking() {
  const context = useContext(BookingContext);
  if (context === undefined) {
    throw new Error('useBooking must be used within a BookingProvider');
  }
  return context;
}

