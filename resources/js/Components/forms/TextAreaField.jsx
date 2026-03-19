export default function TextAreaField({
    label,
    name,
    placeholder = "",
    rows = 3,
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

            <textarea
                value={data[name] ?? ''}
                onChange={(e) => setData(name, e.target.value)}
                className={`${inputClass} ${className}`}
                rows={rows}
                placeholder={placeholder}
            />

            {errors[name] && (
                <p className="text-red-500 text-xs mt-1">{errors[name]}</p>
            )}
        </div>
    );
}
