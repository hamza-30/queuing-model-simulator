import React, { useState } from "react";

import {
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

import { MM1 } from "../utils/simulationUtils/MM1";
import { MMC } from "../utils/simulationUtils/MMC";
import { MG1Uniform } from "../utils/simulationUtils/MG1Uniform";
import { MG1Normal } from "../utils/simulationUtils/MG1Normal";
import { MGCUniform } from "../utils/simulationUtils/MGCUniform";
import { MGCNormal } from "../utils/simulationUtils/MGCNormal";

const InputField = ({
  label,
  value,
  onChange,
  step = "0.01",
  type = "number",
  integerOnly = false,
}) => (
  <div className="space-y-3">
    <label className="text-sm font-bold text-gray-600 uppercase tracking-wide">
      {label}
    </label>
    <input
      type={type}
      step={step}
      min="0"
      value={value}
      onChange={onChange}
      onKeyDown={(e) =>
        integerOnly &&
        ["e", "E", "+", "-", "."].includes(e.key) &&
        e.preventDefault()
      }
      className="w-full px-5 py-4 bg-white border border-gray-200 rounded-xl focus:ring-4 focus:ring-emerald-100 focus:border-emerald-500 outline-none transition-all text-xl font-medium text-gray-900 shadow-sm"
    />
  </div>
);

const MetricCard = ({ label, value, unit = "" }) => (
  <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col items-center text-center">
    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
      {label}
    </p>
    <p className="text-3xl font-extrabold text-emerald-600">
      {value} <span className="text-sm text-gray-400 font-medium">{unit}</span>
    </p>
  </div>
);

const QueuingSimulator = () => {
  const [selectedModel, setSelectedModel] = useState("M/M/1");
  const [arrivalRate, setArrivalRate] = useState(1);
  const [serviceRate, setServiceRate] = useState(2);
  const [numberOfServers, setNumberOfServers] = useState(2);
  const [distribution, setDistribution] = useState("Uniform");
  const [minVal, setMinVal] = useState(1.0);
  const [maxVal, setMaxVal] = useState(4.0);
  const [mean, setMean] = useState(2.0);
  const [stdDev, setStdDev] = useState(0.5);

  const [simulationResults, setSimulationResults] = useState(null);
  const [simulationError, setSimulationError] = useState(null);

  const handleRunSimulation = () => {
    setSimulationError(null);
    setSimulationResults(null);

    try {
      let result = null;

      const lambda = parseFloat(arrivalRate);
      const mu = parseFloat(serviceRate);
      const servers = parseInt(numberOfServers, 10);
      const min = parseFloat(minVal);
      const max = parseFloat(maxVal);
      const meanVal = parseFloat(mean);
      const sigma = parseFloat(stdDev);

      if (selectedModel === "M/M/1") {
        result = MM1(lambda, mu);
      } else if (selectedModel === "M/M/c") {
        result = MMC(lambda, mu, servers);
      } else if (selectedModel === "M/G/1") {
        if (distribution === "Uniform") {
          result = MG1Uniform(lambda, min, max);
        } else {
          result = MG1Normal(lambda, meanVal, sigma);
        }
      } else if (selectedModel === "M/G/s") {
        if (distribution === "Uniform") {
          result = MGCUniform(lambda, min, max, servers);
        } else {
          result = MGCNormal(lambda, meanVal, sigma, servers);
        }
      }

      setSimulationResults(result);
    } catch (error) {
      console.error("Simulation failed:", error);
      setSimulationError(
        "An error occurred during calculation. Please check your inputs.",
      );
    }
  };

  const Icons = {
    SingleMarkov: () => (
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="9" y="9" width="6" height="6" rx="1" />
        <path d="M12 2v7M12 15v7M2 12h7M15 12h7" opacity="0.3" />
      </svg>
    ),
    MultiMarkov: () => (
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="4" y="4" width="6" height="6" rx="1" />
        <rect x="14" y="4" width="6" height="6" rx="1" />
        <rect x="4" y="14" width="6" height="6" rx="1" />
        <rect x="14" y="14" width="6" height="6" rx="1" />
      </svg>
    ),
    SingleGeneral: () => (
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="9" y="12" width="6" height="8" rx="1" />
        <path d="M3 10c2-5 6-5 9-1s7 4 9-1" />
      </svg>
    ),
    MultiGeneral: () => (
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M3 7c2-3 6-3 9 1s7 4 9-1" />
        <rect x="4" y="14" width="4" height="6" rx="1" />
        <rect x="10" y="14" width="4" height="6" rx="1" />
        <rect x="16" y="14" width="4" height="6" rx="1" />
      </svg>
    ),
    Play: () => (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <polygon points="5 3 19 12 5 21 5 3"></polygon>
      </svg>
    ),
  };

  const models = [
    {
      id: "M/M/1",
      icon: <Icons.SingleMarkov />,
      label: "M/M/1",
      desc: "Single server, exponential arrivals & service",
    },
    {
      id: "M/M/c",
      icon: <Icons.MultiMarkov />,
      label: "M/M/c",
      desc: "Multiple servers, exponential arrivals & service",
    },
    {
      id: "M/G/1",
      icon: <Icons.SingleGeneral />,
      label: "M/G/1",
      desc: "Single server, general service distribution",
    },
    {
      id: "M/G/s",
      icon: <Icons.MultiGeneral />,
      label: "M/G/s",
      desc: "Multiple servers, general service distribution",
    },
  ];

  // --- Helpers ---
  const getMaxEndTime = () => {
    if (!simulationResults) return 0;
    return Math.max(...simulationResults.serviceEndTimes);
  };

  // --- Transform Data for Recharts ---
  const getChartData = () => {
    if (!simulationResults) return [];
    return simulationResults.poissonArrivals.map((_, index) => ({
      id: index + 1,
      interarrival: simulationResults.interarrivalTimes[index],
      arrival: simulationResults.poissonArrivals[index],
      waiting: simulationResults.waitingTimes[index],
      turnaround: simulationResults.turnaroundTimes[index],
    }));
  };

  const getGaugeData = () => {
    if (!simulationResults) return [];
    const util = simulationResults.utilizationRate;
    // Handle over 100% logic for color
    const isUnstable = util > 1;
    // Data for Pie Chart (Value vs Remainder)
    return [
      {
        name: "Utilization",
        value: Math.min(util, 1),
        color: isUnstable ? "#ef4444" : "#10b981",
      },
      { name: "Free", value: Math.max(0, 1 - util), color: "#f3f4f6" },
    ];
  };

  const chartData = getChartData();
  const gaugeData = getGaugeData();

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 p-6 md:p-12 flex justify-center">
      <div className="w-full max-w-5xl space-y-8">
        <header className="mb-10">
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">
            Queuing Simulator
          </h1>
          <p className="text-gray-500 mt-3 text-lg">
            Select a queuing model, configure parameters, and execute
            simulations to analyze performance metrics.
          </p>
        </header>

        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="bg-emerald-600 px-8 py-4">
            <span className="text-white font-semibold uppercase tracking-widest text-sm">
              Model Simulator
            </span>
          </div>

          <div className="p-8 space-y-10">
            <section>
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-emerald-100 text-emerald-700 w-8 h-8 rounded-full flex items-center justify-center font-bold">
                  1
                </div>
                <h3 className="text-lg font-bold text-gray-800">
                  Select Queuing Model
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {models.map((model) => (
                  <button
                    key={model.id}
                    onClick={() => {
                      setSelectedModel(model.id);
                      setSimulationResults(null);
                    }}
                    className={`flex flex-col items-start p-6 rounded-xl border-2 text-left transition-all ${
                      selectedModel === model.id
                        ? "border-emerald-500 bg-emerald-50/50 ring-4 ring-emerald-50"
                        : "border-gray-100 hover:border-emerald-200 hover:bg-gray-50"
                    }`}
                  >
                    <div
                      className={`mb-4 p-2 rounded-lg ${selectedModel === model.id ? "text-emerald-600" : "text-gray-400"}`}
                    >
                      {model.icon}
                    </div>
                    <span className="font-bold text-gray-900 text-lg">
                      {model.label}
                    </span>
                    <p className="text-xs text-gray-500 mt-2 leading-relaxed">
                      {model.desc}
                    </p>
                  </button>
                ))}
              </div>
            </section>

            <section>
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-emerald-100 text-emerald-700 w-8 h-8 rounded-full flex items-center justify-center font-bold">
                  2
                </div>
                <h3 className="text-lg font-bold text-gray-800">
                  Queue Discipline
                </h3>
              </div>
              <div className="flex bg-gray-100 p-1.5 rounded-xl w-fit">
                <button
                  className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${"bg-white text-emerald-600 shadow-sm"}`}
                >
                  Standard Queue
                </button>
              </div>
            </section>

            <section className="bg-gray-50/80 rounded-2xl p-8 border border-gray-200">
              <div className="flex items-center gap-3 mb-8">
                <div className="bg-emerald-100 text-emerald-700 w-8 h-8 rounded-full flex items-center justify-center font-bold">
                  3
                </div>
                <h3 className="text-lg font-bold text-gray-800">
                  Simulation Parameters
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <InputField
                  label="Arrival Rate (λ)"
                  value={arrivalRate}
                  onChange={(e) => setArrivalRate(e.target.value)}
                  step="0.01"
                />

                {selectedModel === "M/M/1" && (
                  <InputField
                    label="Service Rate (μ)"
                    value={serviceRate}
                    onChange={(e) => setServiceRate(e.target.value)}
                    step="0.01"
                  />
                )}

                {selectedModel === "M/M/c" && (
                  <>
                    <InputField
                      label="Service Rate (μ)"
                      value={serviceRate}
                      onChange={(e) => setServiceRate(e.target.value)}
                      step="0.01"
                    />
                    <InputField
                      label="Number of Servers (c)"
                      value={numberOfServers}
                      onChange={(e) => setNumberOfServers(e.target.value)}
                      step="1"
                      integerOnly={true}
                    />
                  </>
                )}

                {(selectedModel === "M/G/1" || selectedModel === "M/G/s") && (
                  <>
                    <div className="space-y-3">
                      <label className="text-xs font-bold text-gray-600 uppercase tracking-wide">
                        Select Distribution
                      </label>
                      <select
                        value={distribution}
                        onChange={(e) => setDistribution(e.target.value)}
                        className="w-full px-5 py-3 bg-white border border-gray-200 rounded-xl focus:ring-4 focus:ring-emerald-100 focus:border-emerald-500 outline-none transition-all text-base font-medium text-gray-900 appearance-none shadow-sm"
                      >
                        <option value="Uniform">Uniform</option>
                        <option value="Normal">Normal</option>
                      </select>
                    </div>

                    {distribution === "Uniform" && (
                      <>
                        <InputField
                          label="Minimum"
                          value={minVal}
                          onChange={(e) => setMinVal(e.target.value)}
                          step="0.01"
                        />
                        <InputField
                          label="Maximum"
                          value={maxVal}
                          onChange={(e) => setMaxVal(e.target.value)}
                          step="0.01"
                        />
                      </>
                    )}

                    {distribution === "Normal" && (
                      <>
                        <InputField
                          label="Mean"
                          value={mean}
                          onChange={(e) => setMean(e.target.value)}
                          step="0.01"
                        />
                        <InputField
                          label="Standard Deviation"
                          value={stdDev}
                          onChange={(e) => setStdDev(e.target.value)}
                          step="0.01"
                        />
                      </>
                    )}

                    {selectedModel === "M/G/s" && (
                      <InputField
                        label="Number of Servers (s)"
                        value={numberOfServers}
                        onChange={(e) => setNumberOfServers(e.target.value)}
                        step="1"
                        integerOnly={true}
                      />
                    )}
                  </>
                )}
              </div>
            </section>

            <div className="flex justify-end pt-4">
              <button
                onClick={handleRunSimulation}
                className="flex items-center text-sm gap-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-6 rounded-xl shadow-lg shadow-emerald-200 transition-all hover:-translate-y-1 active:translate-y-0"
              >
                <Icons.Play />
                Run Simulation
              </button>
            </div>
          </div>
        </div>

        {simulationError && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-200">
            {simulationError}
          </div>
        )}

        {simulationResults && (
          <div className="space-y-8 animate-fade-in-up">
            {/* --- SYSTEM INSTABILITY WARNING --- */}
            {simulationResults.utilizationRate > 1 && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 flex items-start gap-4 shadow-sm">
                <div className="p-3 bg-amber-100 rounded-lg text-amber-600 shrink-0">
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                    <line x1="12" y1="9" x2="12" y2="13"></line>
                    <line x1="12" y1="17" x2="12.01" y2="17"></line>
                  </svg>
                </div>
                <div>
                  <h4 className="text-lg font-bold text-amber-800 uppercase tracking-wide">
                    System Unstable
                  </h4>
                  <p className="text-base text-amber-700 mt-1 leading-relaxed">
                    The Utilization Rate (ρ) is{" "}
                    <span className="font-bold">
                      {simulationResults.utilizationRate}
                    </span>
                    , which exceeds 1. This means arrivals are faster than
                    service capacity, causing the queue to grow indefinitely.{" "}
                    <br />
                    <span className="italic font-medium">
                      Suggestion: Increase the Service Rate or add more Servers
                      to stabilize the system.
                    </span>
                  </p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <MetricCard
                label="Utilization (ρ)"
                value={simulationResults.utilizationRate}
              />
              <MetricCard
                label="Avg. Waiting Time"
                value={simulationResults.averageWaitingTime}
                unit="units"
              />
              <MetricCard
                label="Avg. Turnaround Time"
                value={simulationResults.averageTurnaroundTime}
                unit="units"
              />
              <MetricCard
                label="Avg. Service Time"
                value={simulationResults.averageServiceTime}
                unit="units"
              />
              <MetricCard
                label="Avg. Interarrival Time"
                value={simulationResults.averageInterarrivalTime}
                unit="units"
              />
              <MetricCard
                label="Prob. Waiting > 0"
                value={simulationResults.probabilityofWaitingCustomers}
              />
            </div>

            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
              <div className="bg-gray-900 px-8 py-4 flex justify-between items-center">
                <span className="text-white font-semibold uppercase tracking-widest text-sm">
                  Simulation Table
                </span>
                <span className="text-gray-400 text-xs">
                  Showing {simulationResults.poissonArrivals.length} Arrivals
                </span>
              </div>

              <div className="overflow-x-auto max-h-150 overflow-y-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b border-gray-100 sticky top-0 z-10">
                    <tr>
                      <th className="px-6 py-3">#</th>
                      <th className="px-6 py-3">C Probability</th>
                      <th className="px-6 py-3">Interarrival</th>
                      <th className="px-6 py-3">Arrival Time</th>
                      <th className="px-6 py-3">Service Time</th>
                      <th className="px-6 py-3">Start Time</th>
                      <th className="px-6 py-3">End Time</th>
                      {simulationResults.serverAssignments && (
                        <th className="px-6 py-3">Server</th>
                      )}
                      <th className="px-6 py-3">Turnaround</th>
                      <th className="px-6 py-3">Waiting</th>
                      <th className="px-6 py-3">Response</th>
                    </tr>
                  </thead>
                  <tbody>
                    {simulationResults.poissonArrivals.map((val, index) => (
                      <tr
                        key={index}
                        className="bg-white border-b border-gray-50 hover:bg-emerald-50/30 transition-colors"
                      >
                        <td className="px-6 py-4 font-medium text-gray-900">
                          {index + 1}
                        </td>
                        <td className="px-6 py-4">
                          {simulationResults.cumulativeProbabilityArray[index]}
                        </td>
                        <td className="px-6 py-4">
                          {simulationResults.interarrivalTimes[index]}
                        </td>
                        <td className="px-6 py-4">{val}</td>
                        <td className="px-6 py-4">
                          {simulationResults.serviceTimes[index]}
                        </td>
                        <td className="px-6 py-4">
                          {simulationResults.serviceStartTimes[index]}
                        </td>
                        <td className="px-6 py-4">
                          {simulationResults.serviceEndTimes[index]}
                        </td>
                        {simulationResults.serverAssignments && (
                          <td className="px-6 py-4">
                            <span className="bg-gray-100 text-gray-800 text-xs font-bold px-2 py-1 rounded">
                              S{simulationResults.serverAssignments[index]}
                            </span>
                          </td>
                        )}
                        <td className="px-6 py-4">
                          {simulationResults.turnaroundTimes[index]}
                        </td>
                        <td className="px-6 py-4 font-bold text-emerald-600">
                          {simulationResults.waitingTimes[index]}
                        </td>
                        <td className="px-6 py-4">
                          {simulationResults.responseTimes[index]}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* --- GANTT CHART SECTION --- */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
              <div className="bg-gray-900 px-8 py-4 flex justify-between items-center">
                <span className="text-white font-semibold uppercase tracking-widest text-sm">
                  Service Timeline (Gantt Chart)
                </span>
                <span className="text-gray-400 text-xs">
                  Visualizing Service Duration per Customer
                </span>
              </div>

              <div className="p-6 overflow-x-auto">
                <div className="min-w-150 overflow-y-auto max-h-125">
                  <div className="relative">
                    {simulationResults.poissonArrivals.map((_, index) => {
                      const maxTime = getMaxEndTime();
                      const start = simulationResults.serviceStartTimes[index];
                      const duration = simulationResults.serviceTimes[index];
                      const widthPct = (duration / maxTime) * 100;
                      const leftPct = (start / maxTime) * 100;
                      const server = simulationResults.serverAssignments
                        ? simulationResults.serverAssignments[index]
                        : 1;

                      return (
                        <div key={index} className="flex items-center mb-3">
                          <div className="w-20 text-xs text-gray-500 font-mono font-bold">
                            Cust {index + 1}
                          </div>
                          <div className="flex-1 h-8 bg-gray-50 rounded-lg relative overflow-hidden border border-gray-100">
                            <div
                              className="absolute h-full bg-emerald-500/90 hover:bg-emerald-600 rounded-md flex items-center justify-center text-[10px] text-white font-bold shadow-sm transition-all cursor-default"
                              style={{
                                left: `${leftPct}%`,
                                width: `${Math.max(widthPct, 0.5)}%`,
                                minWidth: "24px",
                              }}
                              title={`Customer ${index + 1}: Start ${start}, End ${start + duration}, Server ${server}`}
                            >
                              S{server}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="flex justify-between mt-4 text-xs text-gray-400 font-mono border-t border-gray-200 pt-2 pl-20">
                    <span>0</span>
                    <span>{(getMaxEndTime() * 0.25).toFixed(1)}</span>
                    <span>{(getMaxEndTime() * 0.5).toFixed(1)}</span>
                    <span>{(getMaxEndTime() * 0.75).toFixed(1)}</span>
                    <span>{getMaxEndTime().toFixed(1)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* --- ANALYTICAL CHARTS SECTION (RECHARTS) --- */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
              <div className="bg-gray-900 px-8 py-4 flex justify-between items-center">
                <span className="text-white font-semibold uppercase tracking-widest text-sm">
                  Analytical Charts
                </span>
                <span className="text-gray-400 text-xs">
                  Powered by Recharts
                </span>
              </div>

              <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* 1. Interarrival Times (Bar Chart) */}
                <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 h-80">
                  <h4 className="font-bold text-gray-700 mb-4 text-sm uppercase tracking-wide">
                    Interarrival Times
                  </h4>
                  <ResponsiveContainer width="100%" height="90%">
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="id" tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 10 }} />
                      <Tooltip />
                      <Bar
                        dataKey="interarrival"
                        fill="#60a5fa"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* 2. Arrival Times (Area Chart) */}
                <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 h-80">
                  <h4 className="font-bold text-gray-700 mb-4 text-sm uppercase tracking-wide">
                    Arrival Times (Flow)
                  </h4>
                  <ResponsiveContainer width="100%" height="90%">
                    <AreaChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="id" tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 10 }} />
                      <Tooltip />
                      <Area
                        type="monotone"
                        dataKey="arrival"
                        stroke="#6366f1"
                        fill="#818cf8"
                        fillOpacity={0.3}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                {/* 3. Waiting Times (Bar Chart) */}
                <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 h-80">
                  <h4 className="font-bold text-gray-700 mb-4 text-sm uppercase tracking-wide">
                    Waiting Times
                  </h4>
                  <ResponsiveContainer width="100%" height="90%">
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="id" tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 10 }} />
                      <Tooltip />
                      <Bar
                        dataKey="waiting"
                        fill="#fbbf24"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* 4. Turnaround Times (Line Chart) */}
                <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 h-80">
                  <h4 className="font-bold text-gray-700 mb-4 text-sm uppercase tracking-wide">
                    Turnaround Times
                  </h4>
                  <ResponsiveContainer width="100%" height="90%">
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="id" tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 10 }} />
                      <Tooltip />
                      <Line
                        type="monotone"
                        dataKey="turnaround"
                        stroke="#8b5cf6"
                        strokeWidth={2}
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                {/* 5. Utilization Rate (Gauge/Pie) */}
                <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 md:col-span-2 flex flex-col items-center h-80">
                  <h4 className="font-bold text-gray-700 mb-2 text-sm uppercase tracking-wide text-center">
                    System Utilization
                  </h4>
                  <div className="relative w-full h-full flex justify-center items-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={gaugeData}
                          cx="50%"
                          cy="50%"
                          startAngle={180}
                          endAngle={0}
                          innerRadius={80}
                          outerRadius={120}
                          paddingAngle={0}
                          dataKey="value"
                        >
                          {gaugeData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex flex-col items-center justify-center pt-20">
                      <span
                        className={`text-4xl font-bold ${simulationResults.utilizationRate > 1 ? "text-red-600" : "text-gray-800"}`}
                      >
                        {(simulationResults.utilizationRate * 100).toFixed(1)}%
                      </span>
                      <span className="text-sm text-gray-400 uppercase tracking-widest mt-1">
                        Load
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default QueuingSimulator;
