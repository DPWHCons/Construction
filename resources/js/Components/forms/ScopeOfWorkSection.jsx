import InputField from '@/Components/forms/InputField';
import TextAreaField from '@/Components/forms/TextAreaField';

export default function ScopeOfWorkSection({ data, setData, errors }) {
    return (
        <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
            <h4 className="text-base font-semibold text-slate-800 font-montserrat mb-3">Scope of Work</h4>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                <InputField
                    label="Duration, CD"
                    name="duration_cd"
                    placeholder="Enter duration"
                    data={data}
                    setData={setData}
                    errors={errors}
                />
                <InputField
                    label="Project Engineer"
                    name="project_engineer"
                    placeholder="Project Engineer"
                    data={data}
                    setData={setData}
                    errors={errors}
                />
                <InputField
                    label="Contractor"
                    name="contractor_name"
                    placeholder="Construction company name"
                    data={data}
                    setData={setData}
                    errors={errors}
                />
                <InputField
                    label="Unit of Measure"
                    name="unit_of_measure"
                    placeholder="e.g., Lane KM"
                    data={data}
                    setData={setData}
                    errors={errors}
                />
                <div className="lg:col-span-2">
                    <TextAreaField
                        label="Scope of Work"
                        name="scope_of_work_main"
                        placeholder="e.g., Preventive Maintenance of Road: Asphalt Overlay"
                        data={data}
                        setData={setData}
                        errors={errors}
                    />
                </div>   
            </div>
        </div>
    );
}
