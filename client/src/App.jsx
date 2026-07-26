import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  Terminal, 
  RefreshCw, 
  Search, 
  Activity, 
  Link2, 
  FileWarning, 
  Cpu, 
  Heart, 
  Info 
} from 'lucide-react';
import ScoreRing from './components/ScoreRing';
import MetricCard from './components/MetricCard';
import HistoryList from './components/HistoryList';

export default function App() {
  const [urlInput, setUrlInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [report, setReport] = useState(null);
  const [history, setHistory] = useState([]);
  const [loadingLogs, setLoadingLogs] = useState([]);

  // Load history from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('page_pulse_history');
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse history from localStorage', e);
      }
    }
  }, []);

  // Update history in state and localStorage
  const updateHistory = (url, score) => {
    setHistory((prev) => {
      // Remove duplicate of same URL if exists
      const filtered = prev.filter(item => item.url.toLowerCase() !== url.toLowerCase());
      const updated = [{ url, score, timestamp: Date.now() }, ...filtered].slice(0, 5);
      localStorage.setItem('page_pulse_history', JSON.stringify(updated));
      return updated;
    });
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem('page_pulse_history');
  };

  // Simulate terminal logs during loading to enhance cyber diagnostics theme
  const simulateLoadingLogs = (targetUrl) => {
    setLoadingLogs([]);
    const logs = [
      `[SYS] Initializing audit subroutines for target: ${targetUrl}`,
      `[NET] Performing DNS resolution and handshake...`,
      `[NET] Fetching HTML payload (timeout set to 10s)...`,
      `[DOM] Compiling tags & parsing document structure via Cheerio...`,
      `[SEO] Analyzing metadata, header hierarchies, image alt tags...`,
      `[SYS] Calculating final health score heuristics...`
    ];

    logs.forEach((log, index) => {
      setTimeout(() => {
        setLoadingLogs(prev => [...prev, log]);
      }, index * 400); // add log line every 400ms
    });
  };

  const handleAudit = async (targetUrl) => {
    if (!targetUrl || targetUrl.trim() === '') {
      setError({ message: 'URL required: Please specify a website link to analyze.' });
      return;
    }

    // Clean inputs
    setError(null);
    setReport(null);
    setLoading(true);
    simulateLoadingLogs(targetUrl);

    try {
      const apiEndpoint = import.meta.env.DEV 
        ? 'http://localhost:3001/api/audit' 
            : 'https://page-plus-1-mp0n.onrender.com/api/audit';
      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: targetUrl }),
      });

      const data = await response.json();

      if (!response.ok || data.success === false) {
        setError({
          type: data.errorType || 'HTTP_ERROR',
          message: data.errorMessage || 'Failed to complete diagnostics audit.'
        });
        updateHistory(targetUrl, null);
      } else {
        setReport(data);
        updateHistory(data.url, data.healthScore);
      }
    } catch (err) {
      console.error('Audit network exception:', err);
      setError({
        type: 'CONNECTION_FAILURE',
        message: 'Could not connect to the diagnostics backend server. Ensure the API is online at port 3001.'
      });
      updateHistory(targetUrl, null);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    handleAudit(urlInput);
  };

  const handleSelectHistoryUrl = (url) => {
    setUrlInput(url);
    handleAudit(url);
  };

  const handleReset = () => {
    setUrlInput('');
    setReport(null);
    setError(null);
  };

  return (
    <div className="min-h-screen grid-background relative flex flex-col justify-between py-6 px-4 md:px-8">
      {/* Scanning Line HUD Effect */}
      <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
        <div className="w-full h-[3px] bg-cyber-accent-blue/15 animate-scanline opacity-75"></div>
      </div>

      {/* Header */}
      <header className="max-w-7xl mx-auto w-full flex flex-col md:flex-row items-center justify-between border-b border-cyber-border/70 pb-4 mb-6 gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-cyber-accent-blue/10 border border-cyber-accent-blue/30 rounded-lg animate-pulse-glow text-cyber-accent-blue">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-wider font-display bg-gradient-to-r from-white via-gray-200 to-cyber-accent-blue bg-clip-text text-transparent">
              PAGE PULSE
            </h1>
            <p className="text-[10px] text-gray-500 font-mono tracking-widest uppercase">
              Web Audit & Diagnostics Console v1.0
            </p>
          </div>
        </div>

        {/* System heart-beat badge */}
        <div className="flex items-center space-x-2 px-3 py-1.5 bg-cyber-surface border border-cyber-border rounded-full font-mono text-[10px] tracking-wider">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyber-accent-green opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-cyber-accent-green"></span>
          </span>
          <span className="text-cyber-accent-green">CONSOLE: OPERATIONAL</span>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto w-full flex-grow flex flex-col gap-6">
        
        {/* Input Terminal and History Section */}
        {(!report && !loading && !error) && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 my-auto max-w-5xl mx-auto w-full py-12">
            
            {/* Center Info Panel */}
            <div className="lg:col-span-2 flex flex-col justify-center space-y-6">
              <div className="space-y-3 text-left">
                <h2 className="text-3xl md:text-4xl font-extrabold font-display leading-tight">
                  Instant Website Health & <br />
                  <span className="text-cyber-accent-blue font-mono">SEO Diagnostics</span>
                </h2>
                <p className="text-sm text-gray-400 font-mono leading-relaxed max-w-lg">
                  Audit critical SEO metrics, crawl page headers, analyze image assets, and calculate a live quality health score server-side in seconds.
                </p>
              </div>

              {/* Form Input */}
              <form onSubmit={handleSearchSubmit} className="space-y-3">
                <div className="flex flex-col md:flex-row gap-2 relative">
                  <div className="relative flex-grow">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input
                      type="text"
                      value={urlInput}
                      onChange={(e) => setUrlInput(e.target.value)}
                      placeholder="Enter target url (e.g. google.com)"
                      className="w-full pl-10 pr-4 py-3.5 bg-cyber-surface border border-cyber-border focus:border-cyber-accent-blue rounded-xl text-sm font-mono text-white placeholder-gray-600 outline-none transition-all duration-300 focus:shadow-[0_0_15px_rgba(0,240,255,0.15)]"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-3.5 bg-cyber-accent-blue hover:bg-cyber-accent-blue/80 text-black font-bold text-xs uppercase tracking-widest rounded-xl transition-all duration-300 flex items-center justify-center gap-2 hover:shadow-[0_0_20px_rgba(0,240,255,0.4)] disabled:opacity-50 shrink-0 font-mono"
                  >
                    <Terminal className="w-4 h-4" />
                    RUN DIAGNOSTIC
                  </button>
                </div>
                <div className="text-[10px] text-gray-600 font-mono flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5" />
                  <span>CORS-safe server-side scraping. Enter protocols explicitly for secure/specific routing.</span>
                </div>
              </form>
            </div>

            {/* History Panel */}
            <div className="lg:col-span-1 flex flex-col justify-center">
              <HistoryList 
                history={history} 
                onSelectUrl={handleSelectHistoryUrl} 
                onClearHistory={clearHistory} 
              />
            </div>
          </div>
        )}

        {/* LOADING TERMINAL HUD */}
        {loading && (
          <div className="max-w-2xl mx-auto w-full my-auto bg-cyber-surface border border-cyber-accent-blue/30 rounded-xl p-6 shadow-xl relative overflow-hidden scanline-container">
            <div className="absolute inset-0 grid-background opacity-20 pointer-events-none"></div>
            
            <div className="flex items-center justify-between pb-3 border-b border-cyber-border/70 mb-4 text-cyber-accent-blue">
              <div className="flex items-center space-x-2">
                <Terminal className="w-4 h-4 animate-pulse" />
                <span className="text-xs font-mono font-bold tracking-widest uppercase">AUDIT CONSOLE OUTPUT</span>
              </div>
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            </div>

            <div className="space-y-2 bg-[#06070a] border border-cyber-border rounded-lg p-4 min-h-[160px] font-mono text-xs text-cyber-accent-green leading-relaxed text-left flex flex-col justify-end">
              {loadingLogs.map((log, idx) => (
                <div key={idx} className="transition-opacity duration-300">
                  <span className="text-gray-600 mr-2">&gt;&gt;</span>
                  {log}
                </div>
              ))}
              <div className="animate-pulse flex items-center mt-1 text-cyber-accent-blue">
                <span className="text-gray-600 mr-2">&gt;&gt;</span>
                <span className="w-1.5 h-3.5 bg-current mr-1"></span>
                <span>AUDITING TARGET HTML METRIC MAPS...</span>
              </div>
            </div>

            <div className="mt-4 flex justify-between text-[10px] text-gray-500 font-mono">
              <span>RATE: 2.4Kb/s</span>
              <span>EST: ~3.5s</span>
            </div>
          </div>
        )}

        {/* ERROR DISPLAY PANEL */}
        {error && !loading && (
          <div className="max-w-lg mx-auto w-full my-auto bg-cyber-surface border border-cyber-accent-red/30 rounded-xl p-6 shadow-2xl relative overflow-hidden text-center scanline-container">
            <div className="absolute inset-0 grid-background opacity-10 pointer-events-none"></div>
            
            <div className="flex flex-col items-center p-4">
              <div className="p-4 bg-cyber-accent-red/10 border border-cyber-accent-red/30 text-cyber-accent-red rounded-full mb-4 animate-bounce">
                <ShieldAlert className="w-8 h-8" />
              </div>

              <h2 className="text-lg font-bold font-mono tracking-widest text-white uppercase">
                DIAGNOSTIC FAULT
              </h2>
              
              <div className="mt-3 px-3 py-1 bg-cyber-accent-red/5 border border-cyber-accent-red/20 rounded font-mono text-xs text-cyber-accent-red tracking-wide">
                ERROR_CODE: {error.type || 'CRAWL_FAILED'}
              </div>

              <p className="mt-4 text-xs text-gray-400 font-mono leading-relaxed max-w-sm">
                {error.message}
              </p>

              <div className="mt-6 flex flex-col sm:flex-row gap-3 w-full justify-center">
                <button
                  onClick={() => handleAudit(urlInput)}
                  className="px-4 py-2 bg-cyber-border hover:bg-gray-800 text-white font-mono text-xs uppercase tracking-wider rounded-lg border border-cyber-border transition-all flex items-center justify-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  RETRY AUDIT
                </button>
                <button
                  onClick={handleReset}
                  className="px-4 py-2 bg-cyber-accent-red hover:bg-cyber-accent-red/80 text-black font-bold font-mono text-xs uppercase tracking-wider rounded-lg transition-all"
                >
                  NEW SEARCH
                </button>
              </div>
            </div>
          </div>
        )}

        {/* RESULTS REPORT DASHBOARD */}
        {report && !loading && !error && (
          <div className="space-y-6 py-4 animate-fadeIn">
            
            {/* Action Bar / Metadata Panel */}
            <div className="bg-cyber-surface border border-cyber-border rounded-xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center space-x-2.5 overflow-hidden w-full md:max-w-2xl">
                <Link2 className="w-4 h-4 text-cyber-accent-blue shrink-0" />
                <div className="flex flex-col overflow-hidden text-left">
                  <span className="text-[10px] text-gray-500 font-mono uppercase tracking-widest">Audited URL</span>
                  <span className="text-xs font-mono text-white truncate font-semibold" title={report.url}>
                    {report.url}
                  </span>
                  {report.finalUrl && report.finalUrl !== report.url && (
                    <span className="text-[9px] text-cyber-accent-amber font-mono truncate mt-0.5">
                      ↳ Redirected to final destination: {report.finalUrl}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex gap-3 w-full md:w-auto justify-end">
                <button
                  onClick={() => handleAudit(report.url)}
                  className="px-3.5 py-2 bg-cyber-surface border border-cyber-border hover:border-gray-700 hover:text-white rounded-lg font-mono text-xs transition-all flex items-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  RE-RUN
                </button>
                <button
                  onClick={handleReset}
                  className="px-4 py-2 bg-cyber-accent-blue hover:bg-cyber-accent-blue/80 text-black font-bold font-mono text-xs uppercase tracking-widest rounded-lg transition-all hover:shadow-[0_0_15px_rgba(0,240,255,0.3)]"
                >
                  ANALYZE ANOTHER
                </button>
              </div>
            </div>

            {/* Score Summary & Metric Breakdown Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Score Meter & Deduction Logs */}
              <div className="lg:col-span-1 flex flex-col gap-6">
                <ScoreRing score={report.healthScore} />
                
                {/* Deductions Logger */}
                <div className="bg-cyber-surface border border-cyber-border rounded-xl p-5 shadow-lg relative overflow-hidden flex-grow">
                  <div className="absolute inset-0 grid-background opacity-10 pointer-events-none"></div>
                  
                  <h3 className="text-xs text-white font-mono tracking-widest font-bold uppercase pb-3 border-b border-cyber-border/50 mb-3">
                    AUDIT DEDUCTIONS
                  </h3>

                  {report.deductions && report.deductions.length > 0 ? (
                    <div className="space-y-3 text-left">
                      {report.deductions.map((d, index) => (
                        <div key={index} className="flex items-start space-x-2.5 p-2 bg-[#120a0d] border border-cyber-accent-red/20 rounded-lg">
                          <FileWarning className="w-4 h-4 text-cyber-accent-red shrink-0 mt-0.5" />
                          <div className="flex-grow">
                            <span className="text-[10px] text-cyber-accent-red font-mono font-bold uppercase tracking-wider block">
                              -{d.value} POINTS
                            </span>
                            <span className="text-[11px] text-gray-400 font-mono mt-0.5 block leading-normal">
                              {d.reason}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                      <div className="w-8 h-8 rounded-full bg-cyber-accent-green/10 border border-cyber-accent-green/30 flex items-center justify-center text-cyber-accent-green mb-2.5">
                        ✓
                      </div>
                      <span className="text-xs text-cyber-accent-green font-mono font-bold uppercase">PERFECT AUDIT</span>
                      <span className="text-[10px] text-gray-500 font-mono mt-1">No deductions applied. Page meets all target checks.</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Metric Breakdown Grid */}
              <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <MetricCard type="reachability" data={report.metrics.reachability} />
                <MetricCard type="responseTime" data={report.metrics.responseTime} />
                <MetricCard type="title" data={report.metrics.title} />
                <MetricCard type="metaDescription" data={report.metrics.metaDescription} />
                <MetricCard type="h1" data={report.metrics.h1} />
                <MetricCard type="images" data={report.metrics.images} />
                <div className="sm:col-span-2">
                  <MetricCard type="wordCount" data={report.metrics.wordCount} />
                </div>
              </div>

            </div>

            {/* Quick mini-sidebar history when viewing reports */}
            {history.length > 1 && (
              <div className="pt-4">
                <HistoryList 
                  history={history.filter(h => h.url !== report.url)} 
                  onSelectUrl={handleSelectHistoryUrl} 
                  onClearHistory={clearHistory} 
                />
              </div>
            )}

          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto w-full border-t border-cyber-border/50 pt-4 mt-8 flex flex-col sm:flex-row items-center justify-between text-[10px] text-gray-600 font-mono gap-3">
        <div className="flex items-center space-x-1">
          <Cpu className="w-3.5 h-3.5" />
          <span>SYSTEM RUNNING VIA REACT + TAILWIND + EXPRESS</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <span>DESIGNED WITH</span>
          <Heart className="w-3 h-3 text-cyber-accent-red fill-cyber-accent-red/20" />
          <span>FOR PREMIUM WEB PERFORMANCE</span>
        </div>
      </footer>
    </div>
  );
}
