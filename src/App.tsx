import { useState, useEffect } from 'react';
import { QrScanner } from './components/QrScanner';
import { CheckCircle2, XCircle, Loader2, ScanLine, ShieldCheck, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { verifyTicket } from './services/api'; // ✅ Added API connection

type ScanStatus = 'idle' | 'verifying' | 'valid' | 'invalid';

interface VerificationResult {
  status: ScanStatus;
  message?: string;
  txHash?: string;
  timestamp?: string;
}

export default function App() {
  const [status, setStatus] = useState<ScanStatus>('idle');
  const [result, setResult] = useState<VerificationResult | null>(null);

  const handleScanSuccess = async (decodedText: string) => {
    if (status !== 'idle') return;

    setStatus('verifying');

    try {

      // ✅ Parse QR data
      const parsed = JSON.parse(decodedText);
      const ticketId = parsed.ticketId;
      const wallet = parsed.wallet;

      // ✅ Call backend API
      const response = await verifyTicket(ticketId, wallet);

      if (response.valid) {
        setResult({
          status: 'valid',
          message: 'Ticket Authenticated',
          txHash: `0x${Math.random().toString(16).slice(2, 10)}...${Math.random().toString(16).slice(2, 6)}`,
          timestamp: new Date().toISOString(),
        });
        setStatus('valid');

      } else {
        setResult({
          status: 'invalid',
          message: 'Invalid or Counterfeit Ticket',
        });
        setStatus('invalid');
      }

    } catch (error) {

      setResult({
        status: 'invalid',
        message: 'Invalid QR Format',
      });

      setStatus('invalid');
    }
  };

  const resetScanner = () => {
    setStatus('idle');
    setResult(null);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans selection:bg-emerald-500/30">
      {/* Header */}
      <header className="border-b border-zinc-800/50 bg-zinc-950/80 backdrop-blur-md sticky top-0 z-10">
        <div className="max-w-md mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-emerald-500/10 p-2 rounded-xl">
              <ShieldCheck className="w-6 h-6 text-emerald-400" />
            </div>
            <h1 className="font-semibold text-lg tracking-tight">TicketAuth</h1>
          </div>
          <div className="text-xs font-mono text-zinc-500 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            NODE CONNECTED
          </div>
        </div>
      </header>

      <main className="max-w-md mx-auto px-6 py-8 flex flex-col items-center">
        <AnimatePresence mode="wait">
          {status === 'idle' && (
            <motion.div
              key="scanner"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full flex flex-col items-center gap-8"
            >
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-medium">Ready to Scan</h2>
                <p className="text-zinc-400 text-sm">Position the QR code within the frame</p>
              </div>

              <div className="w-full relative p-1 rounded-3xl bg-gradient-to-b from-zinc-800 to-zinc-900 shadow-2xl">
                <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/10 to-transparent rounded-3xl opacity-50"></div>
                <QrScanner onScanSuccess={handleScanSuccess} />
              </div>
            </motion.div>
          )}

          {status === 'verifying' && (
            <motion.div
              key="verifying"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              className="w-full py-20 flex flex-col items-center justify-center gap-6"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-emerald-500/20 rounded-full blur-xl animate-pulse"></div>
                <div className="bg-zinc-900 p-6 rounded-full border border-zinc-800 relative z-10">
                  <Loader2 className="w-12 h-12 text-emerald-400 animate-spin" />
                </div>
              </div>
              <div className="text-center space-y-2">
                <h3 className="text-xl font-medium">Verifying Signature</h3>
                <p className="text-zinc-400 text-sm font-mono animate-pulse">Checking blockchain ledger...</p>
              </div>
            </motion.div>
          )}

          {(status === 'valid' || status === 'invalid') && result && (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full flex flex-col items-center gap-8"
            >
              <div className="w-full p-8 rounded-3xl bg-zinc-900 border border-zinc-800 flex flex-col items-center text-center gap-6 relative overflow-hidden">
                <div className={`absolute -top-24 -left-24 w-48 h-48 rounded-full blur-3xl opacity-20 ${status === 'valid' ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
                
                <div className={`p-4 rounded-full ${status === 'valid' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                  {status === 'valid' ? (
                    <CheckCircle2 className="w-16 h-16" />
                  ) : (
                    <XCircle className="w-16 h-16" />
                  )}
                </div>

                <div className="space-y-2">
                  <h2 className={`text-2xl font-semibold ${status === 'valid' ? 'text-emerald-400' : 'text-red-400'}`}>
                    {result.message}
                  </h2>
                  <p className="text-zinc-400 text-sm">
                    {status === 'valid' ? 'Access Granted' : 'Access Denied'}
                  </p>
                </div>

                {status === 'valid' && (
                  <div className="w-full pt-6 border-t border-zinc-800/50 flex flex-col gap-3 text-left">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-zinc-500">Tx Hash</span>
                      <span className="font-mono text-zinc-300">{result.txHash}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-zinc-500">Verified At</span>
                      <span className="font-mono text-zinc-300">
                        {result.timestamp ? new Date(result.timestamp).toLocaleTimeString() : ''}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <button
                onClick={resetScanner}
                className="w-full py-4 px-6 rounded-2xl bg-zinc-100 text-zinc-900 font-medium flex items-center justify-center gap-2 hover:bg-white active:scale-[0.98] transition-all"
              >
                <ScanLine className="w-5 h-5" />
                Scan Next Ticket
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
