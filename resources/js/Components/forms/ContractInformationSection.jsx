import InputField from '@/Components/forms/InputField';
import SelectField from '@/Components/forms/SelectField';

export default function ContractInformationSection({ data, setData, errors }) {
    const yearOptions = Array.from({length: 11}, (_, i) => new Date().getFullYear() - 5 + i).map(year => ({
        value: year,
        label: year.toString()
    }));

    return (
        <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 mt-6">
            <h4 className="text-base font-semibold text-slate-800 font-montserrat mb-3">Contract Information</h4>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
                <SelectField
                    label="Project Year"
                    name="project_year"
                    placeholder="Select Year"
                    data={data}
                    setData={setData}
                    errors={errors}
                    options={yearOptions}
                />
                <InputField
                    label="Contract ID"
                    name="contract_id"
                    placeholder="Enter contract ID"
                    data={data}
                    setData={setData}
                    errors={errors}
                />
                <InputField
                    label="Project ID"
                    name="project_id"
                    placeholder="Enter project ID"
                    data={data}
                    setData={setData}
                    errors={errors}
                />
                <div className="lg:col-span-3">
                    <InputField
                        label="Project Name"
                        name="title"
                        placeholder="Enter Project Name"
                        data={data}
                        setData={setData}
                        errors={errors}
                    />
                </div>
            </div>
        </div>
    );
}
