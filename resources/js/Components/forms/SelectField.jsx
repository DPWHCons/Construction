export default function SelectField({
    label,
    name,
    options = [],
    placeholder = "Select an option",
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

            <select
                value={data[name] ?? ''}
                onChange={(e) => setData(name, e.target.value)}
                className={`${inputClass} ${className}`}
            >
                <option value="">{placeholder}</option>
                {options.map((option) => (
                    <option key={option.value || option.id} value={option.value || option.id}>
                        {option.label || option.name}
                    </option>
                ))}
            </select>

            {errors[name] && (
                <p className="text-red-500 text-xs mt-1">{errors[name]}</p>
            )}
        </div>
    );
}
