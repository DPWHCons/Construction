export default function NumberField({
    label,
    name,
    placeholder = "",
    data,
    setData,
    errors,
    className = ""
}) {
    const inputClass = "w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#Eb3505] focus:border-transparent text-sm font-montserrat";

    return (
        <div>
            <label className="block text-xs font-medium text-slate-700 font-montserrat mb-1">
                {label}
            </label>

            <input
                type="number"
                value={data[name] ?? ''}
                onChange={(e) => setData(name, parseFloat(e.target.value) || 0)}
                className={`${inputClass} ${className}`}
                placeholder={placeholder}
                step="any"
            />

            {errors[name] && (
                <p className="text-red-500 text-xs mt-1">{errors[name]}</p>
            )}
        </div>
    );
}
