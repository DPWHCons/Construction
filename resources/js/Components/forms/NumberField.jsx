import { useState, useEffect } from 'react';

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

    const [displayValue, setDisplayValue] = useState('');

    // Format to PHP currency
    const formatCurrency = (value) => {
        if (value === null || value === undefined || value === '') return '';
        return new Intl.NumberFormat('en-PH', {
            style: 'currency',
            currency: 'PHP',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(value);
    };

    // Format without ₱ (while typing)
    const formatNumber = (value) => {
        if (!value && value !== 0) return '';
        return new Intl.NumberFormat('en-PH', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 2
        }).format(value);
    };

    // Remove ₱ and commas
    const parseNumber = (value) => {
        return parseFloat(value.replace(/[^0-9.]/g, '')) || 0;
    };

    // Sync when data changes externally
    useEffect(() => {
        if (data[name] !== undefined) {
            setDisplayValue(formatNumber(data[name]));
        }
    }, [data[name]]);

    const handleChange = (e) => {
        const rawValue = e.target.value;

        // Allow numbers, commas, and decimal
        if (!/^[0-9,]*\.?[0-9]*$/.test(rawValue)) return;

        setDisplayValue(rawValue);

        const numericValue = parseNumber(rawValue);
        setData(name, numericValue);
    };

    const handleBlur = () => {
        const numericValue = parseNumber(displayValue);
        setDisplayValue(formatCurrency(numericValue)); // ₱1,234.00
    };

    const handleFocus = (e) => {
        // Remove ₱ when focusing for easier editing
        const numericValue = parseNumber(displayValue);
        setDisplayValue(formatNumber(numericValue)); // 1,234
        // Auto-select text for better UX
        e.target.select();
    };

    return (
        <div>
            <label className="block text-xs font-medium text-slate-700 font-montserrat mb-1">
                {label}
            </label>

            <input
                type="text"
                value={displayValue}
                onChange={handleChange}
                onBlur={handleBlur}
                onFocus={handleFocus}
                className={`${inputClass} ${className}`}
                placeholder={placeholder || "₱0.00"}
            />

            {errors[name] && (
                <p className="text-red-500 text-xs mt-1">{errors[name]}</p>
            )}
        </div>
    );
}
