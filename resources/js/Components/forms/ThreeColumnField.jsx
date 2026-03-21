export default function ThreeColumnField({
    label,
    fields = [],
    data,
    setData,
    errors,
    actionButton = null
}) {
    return (
        <div>
            <label className="block text-xs font-medium text-slate-700 font-montserrat mb-2">
                {label}
            </label>
            <div className={`grid gap-2 ${actionButton ? 'grid-cols-1 lg:grid-cols-[1fr_1fr_1fr_auto]' : 'grid-cols-1 lg:grid-cols-3'}`}>
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
                {actionButton && (
                    <div className="flex items-end">
                        <button
                            type="button"
                            onClick={actionButton.onClick}
                            className="px-2 py-3 bg-green-600 text-white text-xs font-medium rounded hover:bg-green-700 transition-colors text-xs max-w-[120px]"
                        >
                            {actionButton.label}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
