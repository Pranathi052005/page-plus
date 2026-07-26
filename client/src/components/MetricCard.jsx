import React from 'react';
import { 
  Globe, 
  Zap, 
  FileCode, 
  FileText, 
  Heading1, 
  Image as ImageIcon, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle 
} from 'lucide-react';

export default function MetricCard({ type, data }) {
  if (!data) return null;

  // Configuration for each metric type (icons, labels, colors)
  const config = {
    reachability: {
      label: 'Reachability',
      icon: <Globe className="w-5 h-5 text-cyber-accent-blue" />,
      getValue: (d) => `HTTP ${d.status || 'N/A'}`,
      getStatus: (d) => d.success ? 'pass' : 'fail',
    },
    responseTime: {
      label: 'Response Speed',
      icon: <Zap className="w-5 h-5 text-cyber-accent-amber" />,
      getValue: (d) => `${d.value} ms`,
      getStatus: (d) => d.passed ? 'pass' : 'warn',
    },
    title: {
      label: 'Page Title',
      icon: <FileCode className="w-5 h-5 text-purple-400" />,
      getValue: (d) => d.exists ? 'Defined' : 'Missing',
      getStatus: (d) => d.exists ? 'pass' : 'fail',
    },
    metaDescription: {
      label: 'Meta Description',
      icon: <FileText className="w-5 h-5 text-cyan-400" />,
      getValue: (d) => d.exists ? 'Defined' : 'Missing',
      getStatus: (d) => d.exists ? 'pass' : 'fail',
    },
    h1: {
      label: 'H1 Header tag',
      icon: <Heading1 className="w-5 h-5 text-indigo-400" />,
      getValue: (d) => `${d.count} found`,
      getStatus: (d) => d.passed ? 'pass' : 'fail',
    },
    images: {
      label: 'Image Alt Text',
      icon: <ImageIcon className="w-5 h-5 text-pink-400" />,
      getValue: (d) => d.total === 0 ? 'No images' : `${d.missingAlt} of ${d.total} missing alt`,
      getStatus: (d) => {
        if (d.total === 0) return 'pass';
        if (d.missingAlt === 0) return 'pass';
        if (d.missingAltPercent > 40) return 'fail';
        return 'warn';
      },
    },
    wordCount: {
      label: 'Content Word Count',
      icon: <FileText className="w-5 h-5 text-emerald-400" />,
      getValue: (d) => `${d.value.toLocaleString()} words`,
      getStatus: (d) => d.value > 100 ? 'pass' : 'warn',
    }
  };

  const metricConfig = config[type];
  if (!metricConfig) return null;

  const status = metricConfig.getStatus(data);
  const value = metricConfig.getValue(data);

  // Border & glow color mappings based on status
  let borderClass = 'border-cyber-border';
  let statusIcon = null;
  let statusText = '';
  let accentClass = '';

  if (status === 'pass') {
    borderClass = 'border-cyber-accent-green/30 hover:border-cyber-accent-green/70 transition-all';
    accentClass = 'text-cyber-accent-green';
    statusIcon = <CheckCircle2 className="w-4 h-4 text-cyber-accent-green fill-cyber-accent-green/10" />;
    statusText = 'PASSED';
  } else if (status === 'warn') {
    borderClass = 'border-cyber-accent-amber/30 hover:border-cyber-accent-amber/70 transition-all';
    accentClass = 'text-cyber-accent-amber';
    statusIcon = <AlertTriangle className="w-4 h-4 text-cyber-accent-amber fill-cyber-accent-amber/10" />;
    statusText = 'WARNING';
  } else {
    borderClass = 'border-cyber-accent-red/30 hover:border-cyber-accent-red/70 transition-all';
    accentClass = 'text-cyber-accent-red';
    statusIcon = <XCircle className="w-4 h-4 text-cyber-accent-red fill-cyber-accent-red/10" />;
    statusText = 'FAILED';
  }

  return (
    <div className={`bg-cyber-surface border ${borderClass} rounded-xl p-5 shadow-lg relative overflow-hidden transition-all duration-300 group`}>
      {/* Glow highlight effect on card hover */}
      <div className={`absolute top-0 right-0 w-24 h-24 bg-current opacity-0 group-hover:opacity-[0.02] rounded-full blur-2xl transition-opacity duration-300 pointer-events-none ${accentClass}`}></div>
      
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-cyber-bg border border-cyber-border rounded-lg group-hover:border-gray-700 transition-colors">
            {metricConfig.icon}
          </div>
          <div>
            <h4 className="text-xs text-gray-500 font-mono tracking-widest uppercase">{metricConfig.label}</h4>
            <p className="text-lg font-bold text-white font-mono mt-0.5">{value}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-1.5 px-2.5 py-1 bg-cyber-bg border border-cyber-border rounded-full text-[10px] font-mono tracking-wider font-semibold">
          {statusIcon}
          <span className={accentClass}>{statusText}</span>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-cyber-border/50 text-xs text-gray-400 font-mono flex flex-col gap-1.5 leading-relaxed">
        <div>{data.message}</div>
        
        {/* Render text preview if it's title or meta description */}
        {data.text && (
          <div className="mt-1 p-2 bg-cyber-bg border border-cyber-border/30 rounded text-[11px] font-mono text-gray-500 overflow-hidden text-ellipsis whitespace-nowrap" title={data.text}>
            "{data.text}"
          </div>
        )}

        {/* Display percentage for image alt missing if total images > 0 */}
        {type === 'images' && data.total > 0 && (
          <div className="w-full bg-cyber-bg rounded-full h-1.5 overflow-hidden mt-1 border border-cyber-border/30">
            <div 
              className={`h-full rounded-full ${accentClass} bg-current`} 
              style={{ width: `${data.score}%` }}
            ></div>
          </div>
        )}
      </div>
    </div>
  );
}
