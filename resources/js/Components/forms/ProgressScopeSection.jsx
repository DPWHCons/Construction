import ThreeColumnField from '@/Components/forms/ThreeColumnField';

export default function ProgressScopeSection({ data, setData, errors }) {
    const targetFields = [
        { subLabel: 'Planned', name: 'target_planned', placeholder: 'Enter planned target' },
        { subLabel: 'Revised', name: 'target_revised', placeholder: 'Enter revised target' },
        { subLabel: 'Actual', name: 'target_actual', placeholder: 'Enter actual target' }
    ];

    const startDateFields = [
        { subLabel: 'Planned', name: 'target_start_planned', type: 'date' },
        { subLabel: 'Revised', name: 'target_start_revised', type: 'date' },
        { subLabel: 'Actual', name: 'target_start_actual', type: 'date' }
    ];

    const completionDateFields = [
        { subLabel: 'Planned', name: 'target_completion_planned', type: 'date' },
        { subLabel: 'Revised', name: 'target_completion_revised', type: 'date' },
        { subLabel: 'Actual', name: 'target_completion_actual', type: 'date' }
    ];

    const percentageFields = [
        { 
            subLabel: 'Planned', 
            name: 'completion_percentage_planned', 
            type: 'number',
            min: 0,
            max: 100
        },
        { 
            subLabel: 'Actual', 
            name: 'completion_percentage_actual', 
            type: 'number',
            min: 0,
            max: 100
        },
        { 
            subLabel: 'Slippage', 
            name: 'slippage', 
            type: 'number',
            readOnly: true
        }
    ];

    const handleApplyToAll = () => {
        const firstStartDate = data['target_start_planned'] || '';
        if (firstStartDate) {
            setData('target_start_revised', firstStartDate);
            setData('target_start_actual', firstStartDate);
        }
    };

    return (
        <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
            <h4 className="text-base font-semibold text-slate-800 font-montserrat mb-3">Progress & Scope</h4>
            <div className="space-y-4">
                <ThreeColumnField
                    label="Target (written depends in unit of measure)"
                    fields={targetFields}
                    data={data}
                    setData={setData}
                    errors={errors}
                />

                <ThreeColumnField
                    label="Start Date (d,m,y)"
                    fields={startDateFields}
                    data={data}
                    setData={setData}
                    errors={errors}
                    actionButton={{
                        label: "Apply to All",
                        onClick: handleApplyToAll
                    }}
                />

                <ThreeColumnField
                    label="Completion Date (d,m,y)"
                    fields={completionDateFields}
                    data={data}
                    setData={setData}
                    errors={errors}
                />

                <ThreeColumnField
                    label="Completion Percentage (%)"
                    fields={percentageFields}
                    data={data}
                    setData={setData}
                    errors={errors}
                />
            </div>
        </div>
    );
}
