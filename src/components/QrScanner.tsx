import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';

interface QrScannerProps {
  onScanSuccess: (decodedText: string) => void;
  onScanFailure?: (error: string) => void;
}

export function QrScanner({ onScanSuccess, onScanFailure }: QrScannerProps) {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const html5QrCode = new Html5Qrcode('reader');
    scannerRef.current = html5QrCode;

    const startScanner = async () => {
      try {
        await html5QrCode.start(
          { facingMode: 'environment' },
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
          },
          (decodedText) => {
            onScanSuccess(decodedText);
          },
          (errorMessage) => {
            if (onScanFailure) {
              onScanFailure(errorMessage);
            }
          }
        );
        setIsScanning(true);
        setError(null);
      } catch (err) {
        console.error('Error starting scanner:', err);
        setError('Failed to access camera. Please ensure you have granted camera permissions.');
      }
    };

    startScanner();

    return () => {
      if (scannerRef.current && scannerRef.current.isScanning) {
        scannerRef.current.stop().catch(console.error);
      }
    };
  }, [onScanSuccess, onScanFailure]);

  return (
    <div className="relative w-full max-w-md mx-auto overflow-hidden rounded-2xl bg-black">
      <div id="reader" className="w-full min-h-[300px]"></div>
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80 p-6 text-center text-red-400">
          <p>{error}</p>
        </div>
      )}
      {isScanning && !error && (
        <div className="absolute inset-0 pointer-events-none border-[3px] border-emerald-500/50 rounded-2xl">
          <div className="absolute top-0 left-0 w-full h-[2px] bg-emerald-500 shadow-[0_0_8px_2px_rgba(16,185,129,0.8)] animate-scan"></div>
        </div>
      )}
    </div>
  );
}
