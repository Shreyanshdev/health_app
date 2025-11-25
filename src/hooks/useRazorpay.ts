// Custom hook for Razorpay payment integration
export function useRazorpay() {
  const loadRazorpay = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const openRazorpay = async (options: any) => {
    const Razorpay = (window as any).Razorpay;
    if (!Razorpay) {
      await loadRazorpay();
    }
    
    const razorpay = new (window as any).Razorpay(options);
    razorpay.open();
  };

  return { openRazorpay, loadRazorpay };
}

