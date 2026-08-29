import React, { useState } from 'react';
import { X, Copy, Check, Tv, Cast, ExternalLink, Wifi, Sparkles, Monitor, ChevronDown } from 'lucide-react';

interface QrCodeModalProps {
  serverUrl: string;
  localIp: string;
  allIps?: { name: string; address: string }[];
  port: number;
  onClose: () => void;
  onLaunchChromeCast?: () => void;
}

// Simple pure SVG QR Code generator (minimal QR generator for URLs)
function generateQrSvg(text: string): string {
  return `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(text)}&bgcolor=12-17-23&color=f59e0b&margin=1`;
}

export const QrCodeModal: React.FC<QrCodeModalProps> = ({
  serverUrl,
  localIp,
  allIps = [],
  port,
  onClose,
  onLaunchChromeCast,
}) => {
  const [selectedIp, setSelectedIp] = useState<string>(localIp);
  const [copied, setCopied] = useState(false);

  // Compute active URL based on selected IP
  const activeUrl = serverUrl.replace(localIp, selectedIp);
  const qrUrl = generateQrSvg(activeUrl);

  const handleCopy = () => {
    navigator.clipboard.writeText(activeUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 select-none">
      <div className="bg-[#121723] border border-amber-500/40 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl space-y-4 animate-fadeIn">
        {/* Header */}
        <div className="p-4 bg-surface-100/60 border-b border-surface-border flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Tv className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-serif font-bold text-slate-100 text-sm">Wireless Player Display (Cast / Wi-Fi)</h2>
              <p className="text-[11px] text-slate-400">Google Chromecast, Apple TV, Smart TVs & Tablets</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-surface-hover text-slate-400 hover:text-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 text-center">
          {/* QR Code Container */}
          <div className="mx-auto w-56 h-56 p-2 rounded-xl bg-[#090d12] border-2 border-amber-500/30 flex items-center justify-center shadow-inner relative group">
            <img
              src={qrUrl}
              alt="Scan to open player display"
              className="w-full h-full rounded-lg object-contain"
              onError={(e) => {
                // Fallback text if offline
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
          </div>

          <p className="text-xs text-slate-300 font-medium">
            Scan this QR code with a phone, tablet, or Smart TV camera to open the live Player Display.
          </p>

          {/* Network Adapter Selector if multiple */}
          {allIps.length > 1 && (
            <div className="space-y-1 text-left">
              <label className="text-[10px] uppercase font-bold text-slate-400">Wi-Fi / Network Adapter</label>
              <select
                value={selectedIp}
                onChange={(e) => setSelectedIp(e.target.value)}
                className="w-full bg-surface-50 border border-surface-border rounded-lg p-1.5 text-xs text-amber-400 focus:outline-none focus:border-amber-500"
              >
                {allIps.map((ip) => (
                  <option key={ip.address} value={ip.address}>
                    {ip.name}: {ip.address}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Connection URL Bar */}
          <div className="p-2.5 rounded-xl bg-surface-50 border border-surface-border flex items-center justify-between space-x-2">
            <div className="flex items-center space-x-2 truncate">
              <Wifi className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="font-mono text-xs text-amber-400 truncate">{activeUrl}</span>
            </div>
            <button
              onClick={handleCopy}
              className="px-2.5 py-1 bg-surface-100 hover:bg-surface-hover border border-surface-border rounded-lg text-xs font-semibold text-slate-200 transition-colors flex items-center space-x-1 shrink-0"
              title="Copy URL"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>

          {/* Action buttons */}
          <div className="grid grid-cols-2 gap-2 pt-2">
            {onLaunchChromeCast && (
              <button
                onClick={onLaunchChromeCast}
                className="col-span-2 py-2.5 px-3 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center space-x-2"
              >
                <Cast className="w-4 h-4" />
                <span>Launch in Chrome / Edge for Google Cast</span>
              </button>
            )}

            <button
              onClick={() => {
                window.open(activeUrl, '_blank', 'width=1920,height=1080');
              }}
              className="py-2 px-3 bg-surface-50 hover:bg-surface-hover border border-surface-border rounded-xl text-xs font-semibold text-slate-200 transition-colors flex items-center justify-center space-x-1.5"
            >
              <ExternalLink className="w-3.5 h-3.5 text-sky-400" />
              <span>Open in New Tab</span>
            </button>

            <button
              onClick={onClose}
              className="py-2 px-3 bg-surface-50 hover:bg-surface-hover border border-surface-border rounded-xl text-xs font-semibold text-slate-200 transition-colors"
            >
              Done
            </button>
          </div>

          {/* Hints */}
          <div className="text-[10px] text-slate-400 space-y-1 text-left bg-surface-50/50 p-2.5 rounded-lg border border-surface-border/60">
            <div className="font-semibold text-slate-300">💡 Wireless TV Tips:</div>
            <div>• <strong>Chromecast</strong>: Click the button above to open Chrome/Edge, then click the browser <em>Cast...</em> menu to stream tab to your TV.</div>
            <div>• <strong>Apple TV / AirPlay</strong>: Open the URL on your iPhone/iPad/Mac and AirPlay the screen to your Apple TV.</div>
            <div>• <strong>Smart TV Browser</strong>: Ensure your TV and PC are on the same Wi-Fi network, and open the URL in your TV's browser.</div>
          </div>
        </div>
      </div>
    </div>
  );
};
