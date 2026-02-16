const InputField = ({ label, value, onChange, step = "0.01", type = "number", integerOnly = false }) => (
    <div className="space-y-3">
      <label className="text-xs font-bold text-gray-600 uppercase tracking-wide">{label}</label>
      <input
        type={type}
        step={step}
        min="0"
        value={value}
        onChange={onChange}
        onKeyDown={(e) => integerOnly && ["e", "E", "+", "-", "."].includes(e.key) && e.preventDefault()}
        className="w-full px-5 py-3 bg-white border border-gray-200 rounded-xl focus:ring-4 focus:ring-emerald-100 focus:border-emerald-500 outline-none transition-all text-base font-medium text-gray-900"
      />
    </div>
  );

  export default InputField