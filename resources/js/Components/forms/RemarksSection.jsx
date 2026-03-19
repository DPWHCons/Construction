import TextAreaField from '@/Components/forms/TextAreaField';

export default function RemarksSection({ data, setData, errors }) {
    return (
        <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
            <h4 className="text-base font-semibold text-slate-800 font-montserrat mb-3">Remarks</h4>
            <TextAreaField
                label="Remarks"
                name="remarks"
                placeholder="Enter remarks"
                data={data}
                setData={setData}
                errors={errors}
            />
        </div>
    );
}
