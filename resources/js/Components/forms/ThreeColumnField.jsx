export default function ThreeColumnField({
    label,
    fields = [],
    data,
    setData,
    errors
}) {
    return (
        <div>
            <label className="block text-xs font-medium text-slate-700 font-montserrat mb-2">
                {label}
            </label>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-2">
                {fields.map((field, index) => (
                    <div key={index}>
                        <label className="block text-xs text-slate-500 font-montserrat mb-1">
                            {field.subLabel}
                        </label>
                        {field.type === 'date' ? (
                            <input
                                type="date"
                                value={data[field.name] ?? ''}
                                onChange={(e) => setData(field.name, e.target.value)}
                                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#Eb3505] focus:border-transparent text-sm font-montserrat"
                            />
                        ) : field.type === 'number' ? (
                            <input
                                type="number"
                                value={data[field.name] ?? ''}
                                onChange={(e) => setData(field.name, parseFloat(e.target.value) || 0)}
                                className={`w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#Eb3505] focus:border-transparent text-sm font-montserrat ${
                                    field.readOnly ? (
                                        parseFloat(data[field.name]) > 0 
                                            ? 'text-blue-600 font-semibold' 
                                            : parseFloat(data[field.name]) < 0 
                                            ? 'text-red-600 font-semibold' 
                                            : 'text-slate-700'
                                    ) : ''
                                }`}
                                step={field.step || "any"}
                                min={field.min}
                                max={field.max}
                                readOnly={field.readOnly}
                            />
                        ) : (
                            <input
                                type="text"
                                value={data[field.name] ?? ''}
                                onChange={(e) => setData(field.name, e.target.value)}
                                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#Eb3505] focus:border-transparent text-sm font-montserrat"
                                placeholder={field.placeholder}
                            />
                        )}
                        {errors[field.name] && (
                            <p className="text-red-500 text-xs mt-1">{errors[field.name]}</p>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
