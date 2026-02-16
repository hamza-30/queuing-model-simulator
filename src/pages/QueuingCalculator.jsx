import React, { useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceDot,
  Label
} from 'recharts';

// Import Calculator Utility Functions
import MM1 from '../utils/calculatorUtils/MM1';
import MMC from '../utils/calculatorUtils/MMC';
import MG1Uniform from '../utils/calculatorUtils/MG1Uniform';
import MG1Normal from '../utils/calculatorUtils/MG1Normal';
import MGCUniform from '../utils/calculatorUtils/MGCUniform';
import MGCNormal from '../utils/calculatorUtils/MGCNormal';
import GG1NormalUniform from '../utils/calculatorUtils/GG1NormalUniform';
import GG1UniformNormal from '../utils/calculatorUtils/GG1UniformNormal';
import GGCNormalUniform from '../utils/calculatorUtils/GGCNormalUniform';
import GGCUniformNormal from '../utils/calculatorUtils/GGCUniformNormal';

// Reusable Components
const InputField = ({ label, value, onChange, step = "0.01", type = "number", integerOnly = false }) => (
  <div className="space-y-3">
    <label className="text-sm font-bold text-gray-600 uppercase tracking-wide">{label}</label>
    <input
      type={type}
      step={step}
      min="0"
      value={value}
      onChange={onChange}
      onKeyDown={(e) => integerOnly && ["e", "E", "+", "-", "."].includes(e.key) && e.preventDefault()}
      className="w-full px-5 py-4 bg-white border border-gray-200 rounded-xl focus:ring-4 focus:ring-emerald-100 focus:border-emerald-500 outline-none transition-all text-xl font-medium text-gray-900 shadow-sm"
    />
  </div>
);

const MetricCard = ({ label, value, unit = "" }) => (
  <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col items-center text-center transition-all hover:shadow-md">
    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">{label}</p>
    <p className={`text-3xl font-extrabold ${value === "∞" ? "text-amber-600 text-4xl" : "text-emerald-600"}`}>
      {value} <span className="text-sm text-gray-400 font-medium">{value === "∞" ? "" : unit}</span>
    </p>
  </div>
);

const QueuingCalculator = () => {
  // --- State ---
  const [selectedModel, setSelectedModel] = useState('M/M/1');
  
  const [arrivalRate, setArrivalRate] = useState(1);
  const [serviceRate, setServiceRate] = useState(2);
  const [numberOfServers, setNumberOfServers] = useState(2);
  const [distribution, setDistribution] = useState('Uniform'); 
  const [minVal, setMinVal] = useState(1.00);
  const [maxVal, setMaxVal] = useState(4.00);
  const [mean, setMean] = useState(2.00);
  const [stdDev, setStdDev] = useState(0.50);

  const [results, setResults] = useState(null);
  const [chartData, setChartData] = useState(null);
  const [error, setError] = useState(null);

  // --- Helper: Run Specific Model Calculation ---
  // We extract this so we can reuse it for the loop in the chart generation
  const calculateModel = (model, lambda, mu, c, dist, min, max, mn, sd) => {
    switch (model) {
        case 'M/M/1': return MM1(lambda, mu);
        case 'M/M/c': return MMC(lambda, mu, c);
        case 'M/G/1': return dist === 'Uniform' ? MG1Uniform(lambda, min, max) : MG1Normal(lambda, mn, sd);
        case 'M/G/c': return dist === 'Uniform' ? MGCUniform(lambda, min, max, c) : MGCNormal(lambda, mn, sd, c);
        case 'G/G/1': return dist === 'Normal' ? GG1NormalUniform(mn, sd, min, max) : GG1UniformNormal(min, max, mn, sd);
        case 'G/G/c': return dist === 'Normal' ? GGCNormalUniform(mn, sd, min, max, c) : GGCUniformNormal(min, max, mn, sd, c);
        default: return null;
    }
  };

  // --- Main Calculation Logic ---
  const handleCalculate = () => {
    setError(null);
    setResults(null);
    setChartData(null);

    try {
      // Parse inputs
      const lambda = parseFloat(arrivalRate);
      const mu = parseFloat(serviceRate);
      const c = parseInt(numberOfServers, 10);
      const min = parseFloat(minVal);
      const max = parseFloat(maxVal);
      const mn = parseFloat(mean);
      const sd = parseFloat(stdDev);

      // 1. Get Single Point Result
      const res = calculateModel(selectedModel, lambda, mu, c, distribution, min, max, mn, sd);

      // --- Result Sanitization ---
      if (res) {
        const rho = res.utilizationFactor || 0;
        const isUnstable = rho >= 1;

        const fmt = (val) => {
            if (isUnstable) return "∞";
            if (isNaN(val) || !isFinite(val) || val < 0) return "0.00";
            return val.toFixed(2);
        };

        const formatted = {
            utilizationFactor: rho.toFixed(2),
            avgNumberinQueue: fmt(res.avgNumberinQueueGGC || res.avgNumberinQueue),
            avgWaitinQueue: fmt(res.avgWaitinQueueGGC || res.avgWaitinQueue),
            avgWaitinSystem: fmt(res.avgWaitinSystem),
            avgNumberinSystem: fmt(res.avgNumberinSystem),
            isUnstable: isUnstable
        };
        setResults(formatted);

        // 2. Generate Sensitivity Data (Hockey Stick Curve)
        // We will vary the arrival rate (Lambda) from 5% to 95% of capacity
        // Note: For G/G models where inputs are Mean/Min/Max, we have to adjust those inputs to represent changing Lambda
        
        let capacity = 0;
        if(selectedModel.includes('G/G')) {
             // For G/G, capacity depends on service rate. 
             // If Arrival is varied, we simulate "what if arrival was faster/slower"
             // But G/G inputs are explicit means/ranges. 
             // To keep it simple and robust, we calculate capacity based on Service Rate
             let effectiveMu = 0;
             if(selectedModel === 'G/G/1' || selectedModel === 'G/G/c') {
                 if(distribution === 'Normal') effectiveMu = 2 / (min + max); // Service is Uniform
                 else effectiveMu = 1 / mn; // Service is Normal
             }
             const servers = selectedModel.includes('c') ? c : 1;
             capacity = servers * effectiveMu;
        } else {
             // For M/M and M/G, service rate (mu) is explicit or derived from service distribution
             let effectiveMu = mu;
             if(selectedModel.includes('M/G')) {
                 if(distribution === 'Uniform') effectiveMu = 2 / (min + max);
                 else effectiveMu = 1 / mn;
             }
             const servers = selectedModel.includes('c') ? c : 1;
             capacity = servers * effectiveMu;
        }

        const dataPoints = [];
        const steps = 20;
        // Generate points up to 98% utilization to show the curve going up
        for(let i = 1; i <= steps; i++) {
            const utilTarget = (i / steps) * 0.98; // Go up to 0.98 utilization
            const simLambda = utilTarget * capacity;
            
            // We need to pass the "Simulated Lambda" into the calculators.
            // For M/M and M/G, it's easy (just replace lambda).
            // For G/G, inputs are Mean/Min/Max of Arrival. We need to back-calculate params for the new Lambda.
            // This is complex for G/G Uniform (shifting min/max window?), so for G/G we might skip or approximate.
            // Let's implement full support for M/M and M/G, and approximate G/G by scaling Mean.

            let simRes = null;
            
            if(selectedModel.includes('G/G')) {
                // Adjust arrival params to match simLambda
                // New Mean = 1 / simLambda.
                // If Normal: Mean changes, StdDev? Let's keep CV constant (StdDev scales with Mean)
                // If Uniform: Mean changes, Spread? Let's keep Spread constant or scale. Scaling is safer.
                
                const ratio = lambda / simLambda; // scaling factor
                const simMean = mn / ratio; // Inverse relation (High lambda = Low mean time)
                const simSd = sd / ratio;
                const simMin = min / ratio;
                const simMax = max / ratio;

                simRes = calculateModel(selectedModel, simLambda, mu, c, distribution, simMin, simMax, simMean, simSd);
            } else {
                // Standard models take lambda directly
                simRes = calculateModel(selectedModel, simLambda, mu, c, distribution, min, max, mn, sd);
            }

            if(simRes && simRes.utilizationFactor < 1) { // Only plot stable points
                dataPoints.push({
                    arrivalRate: simLambda.toFixed(2),
                    utilization: (simRes.utilizationFactor * 100).toFixed(0),
                    waitQueue: (simRes.avgWaitinQueueGGC || simRes.avgWaitinQueue || 0),
                    current: Math.abs(simLambda - lambda) < (capacity/50) // Mark the point close to user input
                });
            }
        }
        setChartData(dataPoints);
      }

    } catch (err) {
      console.error(err);
      setError("Calculation failed. Please check input values.");
    }
  };

  const Icons = {
    SingleMarkov: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="6" height="6" rx="1" /><path d="M12 2v7M12 15v7M2 12h7M15 12h7" opacity="0.3" /></svg>,
    MultiMarkov: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="4" width="6" height="6" rx="1" /><rect x="14" y="4" width="6" height="6" rx="1" /><rect x="4" y="14" width="6" height="6" rx="1" /><rect x="14" y="14" width="6" height="6" rx="1" /></svg>,
    SingleGeneral: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="12" width="6" height="8" rx="1" /><path d="M3 10c2-5 6-5 9-1s7 4 9-1" /></svg>,
    MultiGeneral: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7c2-3 6-3 9 1s7 4 9-1" /><rect x="4" y="14" width="4" height="6" rx="1" /><rect x="10" y="14" width="4" height="6" rx="1" /><rect x="16" y="14" width="4" height="6" rx="1" /></svg>,
    SingleGG: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12c2-3 5-3 7-1s5 4 7 0" opacity="0.5" /><rect x="9" y="8" width="6" height="8" rx="1" /><path d="M5 20c2-3 6-3 9-1s7 4 9-1" /></svg>,
    MultiGG: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 6c2-3 5-3 7-1s5 4 7 0" opacity="0.5" /><rect x="4" y="10" width="4" height="6" rx="1" /><rect x="10" y="10" width="4" height="6" rx="1" /><rect x="16" y="10" width="4" height="6" rx="1" /><path d="M2 20c2-2 5-2 7 0" opacity="0.5" /></svg>,
    Calculator: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
  };

  const models = [
    { id: 'M/M/1', icon: <Icons.SingleMarkov />, label: 'M/M/1', desc: 'Markovian arrival & service, single server' },
    { id: 'M/M/c', icon: <Icons.MultiMarkov />, label: 'M/M/c', desc: 'Markovian arrival & service, multi server' },
    { id: 'M/G/1', icon: <Icons.SingleGeneral />, label: 'M/G/1', desc: 'General service distribution, single server' },
    { id: 'M/G/c', icon: <Icons.MultiGeneral />, label: 'M/G/c', desc: 'General service distribution, multi server' },
    { id: 'G/G/1', icon: <Icons.SingleGG />, label: 'G/G/1', desc: 'General arrival & service, single server' },
    { id: 'G/G/c', icon: <Icons.MultiGG />, label: 'G/G/c', desc: 'General arrival & service, multi server' },
  ];

  return (
    <div className="w-full max-w-5xl space-y-8 mt-12 animate-fade-in-up">
      
      {/* Header */}
      <header className="mb-10">
        <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Queuing Calculator</h1>
        <p className="text-gray-500 mt-3 text-lg">
          Calculate exact theoretical performance metrics using standard queuing formulas.
        </p>
      </header>

      {/* Main Card */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        
        <div className="bg-emerald-600 px-8 py-4">
          <span className="text-white font-semibold uppercase tracking-widest text-sm">Analytical Calculator</span>
        </div>

        <div className="p-8 space-y-10">
          
          {/* 1. Model Selection */}
          <section>
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-emerald-100 text-emerald-700 w-8 h-8 rounded-full flex items-center justify-center font-bold">1</div>
              <h3 className="text-lg font-bold text-gray-800">Select Queuing Model</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {models.map((model) => (
                <button
                  key={model.id}
                  onClick={() => { setSelectedModel(model.id); setResults(null); setChartData(null); }}
                  className={`flex flex-col items-start p-6 rounded-xl border-2 text-left transition-all ${
                    selectedModel === model.id
                      ? 'border-emerald-500 bg-emerald-50/50 ring-4 ring-emerald-50'
                      : 'border-gray-100 hover:border-emerald-200 hover:bg-gray-50'
                  }`}
                >
                  <div className={`mb-4 p-2 rounded-lg ${selectedModel === model.id ? 'text-emerald-600' : 'text-gray-400'}`}>
                    {model.icon}
                  </div>
                  <span className="font-bold text-gray-900 text-lg">{model.label}</span>
                  <p className="text-xs text-gray-500 mt-2 leading-relaxed">{model.desc}</p>
                </button>
              ))}
            </div>
          </section>

          {/* 2. Parameters */}
          <section className="bg-gray-50/80 rounded-2xl p-8 border border-gray-200">
            <div className="flex items-center gap-3 mb-8">
              <div className="bg-emerald-100 text-emerald-700 w-8 h-8 rounded-full flex items-center justify-center font-bold">2</div>
              <h3 className="text-lg font-bold text-gray-800">Model Parameters</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              
              {['M/M/1', 'M/M/c', 'M/G/1', 'M/G/c'].includes(selectedModel) && (
                <InputField label="Arrival Rate (λ)" value={arrivalRate} onChange={(e) => setArrivalRate(e.target.value)} />
              )}

              {['M/M/1', 'M/M/c'].includes(selectedModel) && (
                <InputField label="Service Rate (μ)" value={serviceRate} onChange={(e) => setServiceRate(e.target.value)} />
              )}

              {['M/M/c', 'M/G/c', 'G/G/c'].includes(selectedModel) && (
                <InputField label="Number of Servers (c)" value={numberOfServers} onChange={(e) => setNumberOfServers(e.target.value)} step="1" integerOnly={true} />
              )}

              {['M/G/1', 'M/G/c'].includes(selectedModel) && (
                <>
                  <div className="space-y-3">
                    <label className="text-xs font-bold text-gray-600 uppercase tracking-wide">Service Distribution</label>
                    <select
                        value={distribution}
                        onChange={(e) => setDistribution(e.target.value)}
                        className="w-full px-5 py-3 bg-white border border-gray-200 rounded-xl focus:ring-4 focus:ring-emerald-100 focus:border-emerald-500 outline-none transition-all text-base font-medium text-gray-900 shadow-sm"
                    >
                        <option value="Uniform">Uniform</option>
                        <option value="Normal">Normal</option>
                    </select>
                  </div>
                  {distribution === 'Uniform' ? (
                    <>
                        <InputField label="Service Min" value={minVal} onChange={(e) => setMinVal(e.target.value)} />
                        <InputField label="Service Max" value={maxVal} onChange={(e) => setMaxVal(e.target.value)} />
                    </>
                  ) : (
                    <>
                        <InputField label="Service Mean" value={mean} onChange={(e) => setMean(e.target.value)} />
                        <InputField label="Service Std Dev" value={stdDev} onChange={(e) => setStdDev(e.target.value)} />
                    </>
                  )}
                </>
              )}

              {['G/G/1', 'G/G/c'].includes(selectedModel) && (
                <>
                   <div className="space-y-3">
                    <label className="text-xs font-bold text-gray-600 uppercase tracking-wide">Arrival Distribution</label>
                    <select
                        value={distribution}
                        onChange={(e) => setDistribution(e.target.value)}
                        className="w-full px-5 py-3 bg-white border border-gray-200 rounded-xl focus:ring-4 focus:ring-emerald-100 focus:border-emerald-500 outline-none transition-all text-base font-medium text-gray-900 shadow-sm"
                    >
                        <option value="Uniform">Uniform</option>
                        <option value="Normal">Normal</option>
                    </select>
                  </div>

                  {distribution === 'Normal' ? (
                    <>
                        <InputField label="Arrival Mean" value={mean} onChange={(e) => setMean(e.target.value)} />
                        <InputField label="Arrival Std Dev" value={stdDev} onChange={(e) => setStdDev(e.target.value)} />
                        
                        <div className="col-span-1 md:col-span-2 border-t border-gray-200 my-2"></div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider col-span-1 md:col-span-2">Implied Service Distribution: Uniform</p>
                        
                        <InputField label="Service Min" value={minVal} onChange={(e) => setMinVal(e.target.value)} />
                        <InputField label="Service Max" value={maxVal} onChange={(e) => setMaxVal(e.target.value)} />
                    </>
                  ) : (
                    <>
                        <InputField label="Arrival Min" value={minVal} onChange={(e) => setMinVal(e.target.value)} />
                        <InputField label="Arrival Max" value={maxVal} onChange={(e) => setMaxVal(e.target.value)} />

                        <div className="col-span-1 md:col-span-2 border-t border-gray-200 my-2"></div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider col-span-1 md:col-span-2">Implied Service Distribution: Normal</p>

                        <InputField label="Service Mean" value={mean} onChange={(e) => setMean(e.target.value)} />
                        <InputField label="Service Std Dev" value={stdDev} onChange={(e) => setStdDev(e.target.value)} />
                    </>
                  )}
                </>
              )}

            </div>
          </section>

          <div className="flex justify-end pt-4">
            <button 
                onClick={handleCalculate}
                className="flex items-center gap-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-8 rounded-xl shadow-lg shadow-emerald-200 transition-all hover:-translate-y-1 active:translate-y-0"
            >
              <Icons.Calculator />
              Calculate Metrics
            </button>
          </div>

        </div>
      </div>

      {/* --- RESULTS SECTION --- */}
      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-200 animate-fade-in-up">
            {error}
        </div>
      )}

      {results && (
        <div className="space-y-8 animate-fade-in-up">
            {/* Warning for Unstable System */}
            {results.isUnstable && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 flex items-start gap-4 shadow-sm">
                    <div className="p-3 bg-amber-100 rounded-lg text-amber-600 shrink-0">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
                    </div>
                    <div>
                        <h4 className="text-lg font-bold text-amber-800 uppercase tracking-wide">System Unstable</h4>
                        <p className="text-base text-amber-700 mt-1 leading-relaxed">
                            The Utilization Rate (ρ) is <span className="font-bold">{results.utilizationFactor}</span>, which exceeds 1. This means arrivals are faster than service capacity, causing the queue to grow infinitely.
                            <br /><span className="italic font-medium">Steady-state metrics cannot be calculated.</span>
                        </p>
                    </div>
                </div>
            )}

            <div>
                <h3 className="text-xl font-bold text-gray-800 ml-2 mb-4">Calculation Results</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <MetricCard label="Utilization (ρ)" value={results.utilizationFactor} />
                    <MetricCard label="Avg. Number in Queue (Lq)" value={results.avgNumberinQueue} unit="cust" />
                    <MetricCard label="Avg. Wait in Queue (Wq)" value={results.avgWaitinQueue} unit="min" />
                    <MetricCard label="Avg. Number in System (Ls)" value={results.avgNumberinSystem} unit="cust" />
                    <MetricCard label="Avg. Wait in System (Ws)" value={results.avgWaitinSystem} unit="min" />
                </div>
            </div>

            {/* PERFORMANCE CURVE CHART */}
            {!results.isUnstable && chartData && (
                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                    <div className="bg-gray-900 px-8 py-4 flex justify-between items-center">
                        <span className="text-white font-semibold uppercase tracking-widest text-sm">Sensitivity Analysis</span>
                        <span className="text-gray-400 text-xs">Wait Time vs Arrival Rate</span>
                    </div>
                    <div className="p-8 h-96">
                        <h4 className="font-bold text-gray-700 mb-4 text-sm uppercase tracking-wide text-center">System Performance Curve</h4>
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis 
                                    dataKey="arrivalRate" 
                                    label={{ value: 'Arrival Rate (λ)', position: 'insideBottom', offset: -10, fontSize: 12 }} 
                                    tick={{ fontSize: 10 }}
                                />
                                <YAxis 
                                    label={{ value: 'Avg Wait in Queue (min)', angle: -90, position: 'insideLeft', fontSize: 12 }} 
                                    tick={{ fontSize: 10 }}
                                />
                                <Tooltip 
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                                    formatter={(value) => [`${value.toFixed(2)} min`, 'Wait Time']}
                                    labelFormatter={(label) => `Arrival Rate: ${label}`}
                                />
                                <Line 
                                    type="monotone" 
                                    dataKey="waitQueue" 
                                    stroke="#8b5cf6" 
                                    strokeWidth={3} 
                                    dot={false} 
                                    activeDot={{ r: 6 }} 
                                />
                                {chartData.find(d => d.current) && (
                                    <ReferenceDot 
                                        x={chartData.find(d => d.current).arrivalRate} 
                                        y={chartData.find(d => d.current).waitQueue} 
                                        r={6} 
                                        fill="#10b981" 
                                        stroke="#fff"
                                        strokeWidth={2}
                                    >
                                        <Label value="You are here" position="top" offset={10} fontSize={10} fill="#10b981" fontWeight="bold" />
                                    </ReferenceDot>
                                )}
                            </LineChart>
                        </ResponsiveContainer>
                        <p className="text-center text-xs text-gray-400 mt-2">
                            Visualizing how waiting time increases as the system approaches capacity (Hockey Stick Effect).
                        </p>
                    </div>
                </div>
            )}
        </div>
      )}

    </div>
  );
};

export default QueuingCalculator;