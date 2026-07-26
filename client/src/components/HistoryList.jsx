import React from 'react';
import { History, Trash2, Globe, ArrowRight } from 'lucide-react';

export default function HistoryList({ history, onSelectUrl, onClearHistory }) {
  if (!history || history.length === 0) {
    return (
      <div className="bg-cyber-surface border border-cyber-border rounded-xl p-5 shadow-lg relative overflow-hidden flex flex-col items-center justify-center min-h-[180px]">
        <div className="absolute inset-0 grid-background opacity-10 pointer-events-none"></div>
        <History className="w-8 h-8 text-gray-600 mb-2" />
        <span className="text-xs text-gray-500 font-mono tracking-widest text-center">NO DIAGNOSTIC HISTORY</span>
        <span className="text-[10px] text-gray-600 text-center mt-1">Audit results will appear here.</span>
      </div>
    );
  }

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-cyber-accent-green';
    if (score >= 50) return 'text-cyber-accent-amber';
    return 'text-cyber-accent-red';
  };

  return (
    <div className="bg-cyber-surface border border-cyber-border rounded-xl p-5 shadow-lg relative overflow-hidden">
      <div className="absolute inset-0 grid-background opacity-10 pointer-events-none"></div>
      
      <div className="flex items-center justify-between pb-3 border-b border-cyber-border/50 mb-3 z-10 relative">
        <div className="flex items-center space-x-2">
          <History className="w-4 h-4 text-cyber-accent-blue" />
          <h3 className="text-xs text-white font-mono tracking-widest font-bold uppercase">RECENT AUDITS</h3>
        </div>
        <button 
          onClick={onClearHistory}
          className="text-gray-500 hover:text-cyber-accent-red transition-colors duration-200 p-1 hover:bg-cyber-accent-red/10 rounded"
          title="Clear diagnostic history"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="space-y-2 z-10 relative">
        {history.map((item, idx) => {
          let hostname = item.url;
          try {
            hostname = new URL(item.url).hostname;
          } catch(e) {}

          return (
            <div 
              key={idx}
              onClick={() => onSelectUrl(item.url)}
              className="flex items-center justify-between p-2.5 bg-cyber-bg hover:bg-cyber-border/40 border border-cyber-border/50 hover:border-cyber-accent-blue/30 rounded-lg cursor-pointer transition-all duration-200 group"
            >
              <div className="flex items-center space-x-2.5 overflow-hidden max-w-[70%]">
                <Globe className="w-3.5 h-3.5 text-gray-500 group-hover:text-cyber-accent-blue transition-colors shrink-0" />
                <div className="flex flex-col overflow-hidden">
                  <span 
                    className="text-xs text-gray-300 font-mono font-medium truncate group-hover:text-white transition-colors"
                    title={item.url}
                  >
                    {hostname}
                  </span>
                  <span className="text-[9px] text-gray-600 font-mono">
                    {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>

              <div className="flex items-center space-x-2 shrink-0">
                <span className={`text-xs font-bold font-mono ${getScoreColor(item.score)}`}>
                  {item.score !== null ? `${item.score}%` : 'ERR'}
                </span>
                <ArrowRight className="w-3 h-3 text-gray-600 group-hover:translate-x-0.5 group-hover:text-cyber-accent-blue transition-all" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
