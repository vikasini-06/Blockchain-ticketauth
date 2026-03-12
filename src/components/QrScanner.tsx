import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';

interface QrScannerProps {
  onScanSuccess: (decodedText: string) => void;
  onScanFailure?: (error: string) => void;
}

export function QrScanner({ onScanSuccess, onScanFailure }: QrScannerProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Store latest callbacks in refs to avoid re-triggering useEffect
  const onScanSuccessRef = useRef(onScanSuccess);
  const onScanFailureRef = useRef(onScanFailure);

  useEffect(() => {
    onScanSuccessRef.current = onScanSuccess;
    onScanFailureRef.current = onScanFailure;
  }, [onScanSuccess, onScanFailure]);

  useEffect(() => {
    let isMounted = true;
    const html5QrCode = new Html5Qrcode('reader');

    const startScanner = async () => {
      try {
        await html5QrCode.start(
          { facingMode: 'environment' },
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
          },
          (decodedText) => {
            if (isMounted) onScanSuccessRef.current(decodedText);
          },
          (errorMessage) => {
            if (isMounted && onScanFailureRef.current) {
              onScanFailureRef.current(errorMessage);
            }
          }
        );
        
        if (isMounted) {
          setIsScanning(true);
          setError(null);
        } else {
          // If unmounted while starting, stop it immediately
          if (html5QrCode.isScanning) {
            await html5QrCode.stop();
            const reader = document.getElementById('reader');
            if (reader) reader.innerHTML = '';
          }
        }
      } catch (err) {
        if (isMounted) {
          console.error('Error starting scanner:', err);
          setError('Failed to access camera. Please ensure you have granted camera permissions.');
        }
      }
    };

    startScanner();

    return () => {
      isMounted = false;
      if (html5QrCode.isScanning) {
        html5QrCode.stop().then(() => {
          const reader = document.getElementById('reader');
          if (reader) reader.innerHTML = '';
        }).catch(console.error);
      } else {
        const reader = document.getElementById('reader');
        if (reader) reader.innerHTML = '';
      }
    };
  }, []); // Empty dependency array prevents re-running on every render

  return (
    <div className="relative w-full max-w-md mx-auto overflow-hidden rounded-2xl bg-black min-h-[300px]">
      <div id="reader" className="w-full h-full absolute inset-0"></div>
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80 p-6 text-center text-red-400 z-20">
          <p>{error}</p>
        </div>
      )}
      {isScanning && !error && (
        <div className="absolute inset-0 pointer-events-none border-[3px] border-emerald-500/50 rounded-2xl z-10">
          <div className="absolute top-0 left-0 w-full h-[2px] bg-emerald-500 shadow-[0_0_8px_2px_rgba(16,185,129,0.8)] animate-scan"></div>
        </div>
      )}
    </div>
  );
}
