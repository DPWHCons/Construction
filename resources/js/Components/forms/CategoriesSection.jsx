import InputField from '@/Components/forms/InputField';
import SelectField from '@/Components/forms/SelectField';

export default function CategoriesSection({ data, setData, errors, categories }) {
    return (
        <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 mt-6">
            <h4 className="text-base font-semibold text-slate-800 font-montserrat mb-3">Categories</h4>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                <InputField
                    label="Add New Category"
                    name="new_category"
                    placeholder="Enter new category"
                    data={data}
                    setData={setData}
                    errors={errors}
                />
                <SelectField
                    label="Select Category"
                    name="category_id"
                    placeholder="Select Category"
                    data={data}
                    setData={setData}
                    errors={errors}
                    options={categories}
                />
            </div>
        </div>
    );
}
