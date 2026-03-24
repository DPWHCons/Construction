import ThreeColumnField from '@/Components/forms/ThreeColumnField';

export default function ProgressScopeSection({ data, setData, errors }) {
    const targetFields = [
        { subLabel: 'Actual', name: 'target_actual', placeholder: 'Enter actual target' }
    ];

    const dateFields = [
        { subLabel: 'Start Date', name: 'target_start_actual', type: 'date' },
        { subLabel: 'Completion Date', name: 'target_completion_actual', type: 'date' }
    ];


    return (
        <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
            <h4 className="text-base font-semibold text-slate-800 font-montserrat mb-3">Progress & Scope</h4>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div>
                    <label className="block text-xs font-medium text-slate-700 font-montserrat mb-2">Target (written depends in unit of measure)</label>
                    <input
                        type="text"
                        value={data.target_actual}
                        onChange={(e) => setData('target_actual', e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#Eb3505] focus:border-transparent text-sm font-montserrat"
                        placeholder="Enter actual target"
                    />
                    {errors.target_actual && <p className="text-red-500 text-xs mt-1">{errors.target_actual}</p>}
                </div>

                <div>
                    <label className="block text-xs font-medium text-slate-700 font-montserrat mb-2">Start Date (d,m,y)</label>
                    <input
                        type="date"
                        value={data.target_start_actual}
                        onChange={(e) => setData('target_start_actual', e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#Eb3505] focus:border-transparent text-sm font-montserrat"
                    />
                    {errors.target_start_actual && <p className="text-red-500 text-xs mt-1">{errors.target_start_actual}</p>}
                </div>

                <div>
                    <label className="block text-xs font-medium text-slate-700 font-montserrat mb-2">Completion Date (d,m,y)</label>
                    <input
                        type="date"
                        value={data.target_completion_actual}
                        onChange={(e) => setData('target_completion_actual', e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#Eb3505] focus:border-transparent text-sm font-montserrat"
                    />
                    {errors.target_completion_actual && <p className="text-red-500 text-xs mt-1">{errors.target_completion_actual}</p>}
                </div>
            </div>
        </div>
    );
}
