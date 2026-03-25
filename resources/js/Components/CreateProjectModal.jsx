import { useForm } from '@inertiajs/react';
import { useEffect, useState, useCallback } from 'react';
import DPWHLoading from '@/Components/DPWHLoading';
import InputField from '@/Components/forms/InputField';
import NumberField from '@/Components/forms/NumberField';
import SectionCard from '@/Components/forms/SectionCard';
import CategoriesSection from '@/Components/forms/CategoriesSection';
import ContractInformationSection from '@/Components/forms/ContractInformationSection';
import ScopeOfWorkSection from '@/Components/forms/ScopeOfWorkSection';
import ProgressScopeSection from '@/Components/forms/ProgressScopeSection';
import RemarksSection from '@/Components/forms/RemarksSection';
import FeedbackAlert from './FeedbackAlert';

export default function CreateProjectModal({ show, onClose, categories = [], selectedYear, updateProjectData }) {
    // Document state
    const [documents, setDocuments] = useState([]);
    const [documentPreviews, setDocumentPreviews] = useState([]);

    // Dynamic engineers state
    const [engineers, setEngineers] = useState([
        { name: '', titles: [''] }
    ]);

    // Loading state
    const [isLoading, setIsLoading] = useState(false);

    // FeedbackAlert state
    const [feedbackAlert, setFeedbackAlert] = useState({
        show: false,
        type: 'success',
        title: '',
        message: ''
    });

    // Form data for project creation
    const { data, setData, post, processing, errors, reset } = useForm({
        // Basic project info
        title: '',
        project_year: parseInt(selectedYear) || new Date().getFullYear(),
        date_started: '',
        status: 'ongoing',
        completion_date: '',

        // Category
        category_id: '',
        new_category: '',

        // Contract information
        project_id: '',
        contract_id: '',

        // Financial Information
        program_amount: '',
        project_cost: '',
        revised_project_cost: '',

        // Scope of work
        duration_cd: '',
        project_engineer: '',
        contractor_name: '',
        unit_of_measure: '',
        scope_of_work_main: '',

        // Progress & scope
        target_actual: '',
        target_start_actual: '',
        target_completion_actual: '',

        // Remarks
        remarks: '',

        // Assigned engineers
        assigned_engineer_1: '',
        engineer_title_1: '',
        assigned_engineer_2: '',
        engineer_title_2: '',
        assigned_engineer_3: '',
        engineer_title_3: '',
        assigned_engineer_4: '',
        engineer_title_4: '',

        // Documents
        images: [],
    });


    // Control body scroll when modal is open
    useEffect(() => {
        if (show) {
            // Disable body scroll
            document.body.style.overflow = 'hidden';
            document.body.style.position = 'fixed';
            document.body.style.width = '100%';
        } else {
            // Enable body scroll
            document.body.style.overflow = '';
            document.body.style.position = '';
            document.body.style.width = '';
        }

        // Cleanup on unmount
        return () => {
            document.body.style.overflow = '';
            document.body.style.position = '';
            document.body.style.width = '';
        };
    }, [show]);

    // Ensure project_year is always an integer when selectedYear changes
    useEffect(() => {
        if (selectedYear) {
            const yearAsInt = parseInt(selectedYear);
            if (!isNaN(yearAsInt) && yearAsInt !== data.project_year) {
                setData('project_year', yearAsInt);
            }
        }
    }, [selectedYear, setData, data.project_year]);

    // Reset form when modal opens to ensure clean state
    useEffect(() => {
        if (show) {
            // Explicitly reset all form fields to empty/clean state
            setData({
                // Basic project info
                title: '',
                project_year: parseInt(selectedYear) || new Date().getFullYear(),
                date_started: '',
                status: 'ongoing',
                completion_date: '',

                // Category
                category_id: '',
                new_category: '',

                // Contract information
                project_id: '',
                contract_id: '',

                // Financial Information
                program_amount: '',
                project_cost: '',
                revised_project_cost: '',

                // Scope of work
                duration_cd: '',
                project_engineer: '',
                contractor_name: '',
                unit_of_measure: '',
                scope_of_work_main: '',

                // Progress & scope
                target_actual: '',
                target_start_actual: '',
                target_completion_actual: '',

                // Remarks
                remarks: '',

                // Assigned engineers
                assigned_engineer_1: '',
                engineer_title_1: '',
                assigned_engineer_2: '',
                engineer_title_2: '',
                assigned_engineer_3: '',
                engineer_title_3: '',
                assigned_engineer_4: '',
                engineer_title_4: '',

                // Documents
                images: [],
            });
            
            // Clear other states
            clearDocuments();
            setEngineers([{ name: '', titles: [''] }]);
        }
    }, [show, selectedYear]);

    // Document handling functions
    const handleDocumentChange = (e) => {
        const files = Array.from(e.target.files);

        const newDocuments = [...documents, ...files];
        const newPreviews = [...documentPreviews, ...files.map(file => ({
            name: file.name,
            size: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
            type: file.type
        }))];

        setDocuments(newDocuments);
        setDocumentPreviews(newPreviews);
        setData('images', newDocuments);
    };

    const removeDocument = (index) => {
        const newDocuments = documents.filter((_, i) => i !== index);
        const newPreviews = documentPreviews.filter((_, i) => i !== index);

        setDocuments(newDocuments);
        setDocumentPreviews(newPreviews);
        setData('images', newDocuments);
    };

    const clearDocuments = () => {
        setDocuments([]);
        setDocumentPreviews([]);
        setData('images', []);
    };

    // Engineer management functions
    const addEngineer = () => {
        setEngineers([...engineers, { name: '', titles: [''] }]);
    };

    const removeEngineer = (index) => {
        const newEngineers = engineers.filter((_, i) => i !== index);
        setEngineers(newEngineers);
    };

    const addTitleToEngineer = (engineerIndex) => {
        const newEngineers = [...engineers];
        newEngineers[engineerIndex].titles.push('');
        setEngineers(newEngineers);
    };

    const removeTitleFromEngineer = (engineerIndex, titleIndex) => {
        const newEngineers = [...engineers];
        newEngineers[engineerIndex].titles.splice(titleIndex, 1);
        setEngineers(newEngineers);
    };

    const updateEngineerTitle = (engineerIndex, titleIndex, value) => {
        const newEngineers = [...engineers];
        newEngineers[engineerIndex].titles[titleIndex] = value;
        setEngineers(newEngineers);
        updateEngineerData(newEngineers);
    };

    const updateEngineerData = (currentEngineers) => {
        const engineerData = {};

        // First, clear all engineer fields
        for (let i = 1; i <= 4; i++) {
            engineerData[`assigned_engineer_${i}`] = '';
            engineerData[`engineer_title_${i}`] = '';
        }

        // Then, set the current engineer data
        let fieldIndex = 1;
        currentEngineers.forEach((engineer) => {
            if (fieldIndex <= 4) {
                engineerData[`assigned_engineer_${fieldIndex}`] = engineer.name;
                // Join all titles with slash separator
                engineerData[`engineer_title_${fieldIndex}`] = engineer.titles.filter(title => title.trim() !== '').join(' / ');
                fieldIndex++;
            }
        });

        // Merge engineer data with existing form data
        setData(prevData => ({
            ...prevData,
            ...engineerData
        }));
    };

    const updateEngineer = (index, field, value) => {
        const newEngineers = [...engineers];
        newEngineers[index][field] = value;
        setEngineers(newEngineers);
        updateEngineerData(newEngineers);
    };

    const submit = (e) => {
        e.preventDefault();

        // Show DPWHLoading immediately
        setIsLoading(true);

        post(route('projects.store'), {
            forceFormData: true,
            onSuccess: (page) => {
                // Keep DPWHLoading for exactly 2 seconds, then show FeedbackAlert
                setTimeout(() => {
                    // Hide loading after 2 seconds
                    setIsLoading(false);

                    // Show success FeedbackAlert after loading disappears
                    const successMessage = page.props.flash?.success || 'Project created successfully!';
                    setFeedbackAlert({
                        show: true,
                        type: 'success',
                        title: 'Success',
                        message: successMessage
                    });

                    // Update parent data with complete server response
                    if (updateProjectData && page.props.projects?.data) {
                        // Replace entire project data with server response to maintain pagination
                        updateProjectData(page.props.projects.data);
                    }

                    // Close modal immediately to show FeedbackAlert
                    reset();
                    clearDocuments();
                    setEngineers([{ name: '', titles: [''] }]);
                    onClose();
                }, 2000); // Exactly 2 seconds of DPWHLoading
            },
            onError: (errors) => {
                // Keep DPWHLoading for exactly 2 seconds, then show error FeedbackAlert
                setTimeout(() => {
                    // Hide loading after 2 seconds
                    setIsLoading(false);

                    // Show error FeedbackAlert after loading disappears
                    const errorMessages = Object.values(errors).flat();
                    const errorMessage = errorMessages.length > 0 
                        ? errorMessages[0] 
                        : 'Failed to create project. Please check the form for errors.';
                    
                    setFeedbackAlert({
                        show: true,
                        type: 'error',
                        title: 'Error',
                        message: errorMessage
                    });
                }, 2000); // Exactly 2 seconds of DPWHLoading
            },
            onFinish: () => {
                // Don't hide loading here - let the 2-second timeout handle it
            },
        });
    };

    return (
        <>
            {isLoading && (
                <DPWHLoading
                    message="Creating Project..."
                    subMessage="Please wait while we process your request"
                />
            )}

            {!show ? null : (
                <div
                    className="fixed top-0 left-0 right-0 bottom-0 bg-black/60 flex items-center justify-center z-[9999] p-4"
                    style={{
                        position: 'fixed',
                        top: '0',
                        left: '0',
                        right: '0',
                        bottom: '0',
                        width: '100vw',
                        height: '100vh',
                        backgroundColor: 'rgba(0, 0, 0, 0.6)'
                    }}
                    onClick={(e) => {
                        if (e.target === e.currentTarget) {
                            onClose();
                        }
                    }}
                >
                    <div
                        className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto overflow-x-hidden border-0 border-slate-200 scrollbar-thin scrollbar-thumb-slate-400 scrollbar-track-slate-100"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="bg-white border-b border-slate-200 p-4 rounded-t-2xl sticky top-0 z-10">
                            <div className="flex items-center justify-between">
                                <h3 className="text-xl font-bold text-slate-800 font-montserrat">Create New Project</h3>
                                <div className="flex items-center space-x-3">
                                    <div className="relative bg-slate-200 rounded-full p-1 w-64 h-10">
                                        <div
                                            className={`absolute top-1 h-8 w-20 rounded-full shadow-md transition-all duration-300 ease-in-out ${data.status === 'ongoing'
                                                    ? 'left-1 bg-orange-500'
                                                    : data.status === 'completed'
                                                        ? 'left-[84px] bg-blue-500'
                                                        : 'left-[167px] bg-red-500'
                                                }`}
                                        />
                                        <div className="relative z-10 flex h-8">
                                            <button
                                                type="button"
                                                onClick={() => setData('status', 'ongoing')}
                                                className={`flex-1 rounded-full text-xs font-semibold transition-all duration-200 flex items-center justify-center ${data.status === 'ongoing'
                                                        ? 'text-white font-bold'
                                                        : 'text-slate-500 hover:text-slate-700'
                                                    }`}
                                            >
                                                Ongoing
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setData('status', 'completed')}
                                                className={`flex-1 rounded-full text-xs font-semibold transition-all duration-200 flex items-center justify-center ${data.status === 'completed'
                                                        ? 'text-white font-bold'
                                                        : 'text-slate-500 hover:text-slate-700'
                                                    }`}
                                            >
                                                Completed
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setData('status', 'pending')}
                                                className={`flex-1 rounded-full text-xs font-semibold transition-all duration-200 flex items-center justify-center ${data.status === 'pending'
                                                        ? 'text-white font-bold'
                                                        : 'text-slate-500 hover:text-slate-700'
                                                    }`}
                                            >
                                                Pending
                                            </button>
                                        </div>
                                    </div>
                                    <button
                                        onClick={onClose}
                                        className="text-slate-500 hover:text-slate-700 transition-colors"
                                    >
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="px-6 pb-6">
                            <form onSubmit={submit}>
                                <div className="space-y-6">
                                    <CategoriesSection
                                        data={data}
                                        setData={setData}
                                        errors={errors}
                                        categories={categories}
                                    />

                                    <ContractInformationSection
                                        data={data}
                                        setData={setData}
                                        errors={errors}
                                    />

                                    {/* Financial Information */}
                                    <SectionCard title="Financial Information">
                                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
                                            <NumberField
                                                label="Program Amount ('000)"
                                                name="program_amount"
                                                data={data}
                                                setData={setData}
                                                errors={errors}
                                            />
                                            <NumberField
                                                label="Project Cost ('000)"
                                                name="project_cost"
                                                data={data}
                                                setData={setData}
                                                errors={errors}
                                            />
                                            <NumberField
                                                label="Revised Project Cost ('000)"
                                                name="revised_project_cost"
                                                data={data}
                                                setData={setData}
                                                errors={errors}
                                            />
                                        </div>
                                    </SectionCard>

                                    <ScopeOfWorkSection
                                        data={data}
                                        setData={setData}
                                        errors={errors}
                                    />

                                    <ProgressScopeSection
                                        data={data}
                                        setData={setData}
                                        errors={errors}
                                    />

                                    {/* Assigned Engineers */}
                                    <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                                        <h4 className="text-base font-semibold text-slate-800 font-montserrat mb-3">Assigned Engineers</h4>
                                        <div className="space-y-3">
                                            {engineers.map((engineer, index) => (
                                                <div key={index} className="border border-slate-200 rounded-lg p-3 bg-white">
                                                    <div className="flex gap-3 items-start">
                                                        <div className="flex-1">
                                                            <label className="block text-xs font-medium text-slate-700 font-montserrat mb-1">Engineer Name</label>
                                                            <input
                                                                type="text"
                                                                value={engineer.name}
                                                                onChange={(e) => updateEngineer(index, 'name', e.target.value)}
                                                                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#Eb3505] focus:border-transparent text-sm font-montserrat"
                                                                placeholder="Enter engineer name"
                                                            />
                                                            {errors[`assigned_engineer_${index + 1}`] && <p className="text-red-500 text-xs mt-1">{errors[`assigned_engineer_${index + 1}`]}</p>}
                                                        </div>

                                                        <div className="flex-1">
                                                            <label className="block text-xs font-medium text-slate-700 font-montserrat mb-1">Engineer Title</label>
                                                            <div className="flex gap-2">
                                                                <div className="flex-1">
                                                                    {engineer.titles.map((title, titleIndex) => (
                                                                        <div key={titleIndex} className="flex gap-2 mb-2">
                                                                            <div className="flex-1">
                                                                                <select
                                                                                    value={title}
                                                                                    onChange={(e) => updateEngineerTitle(index, titleIndex, e.target.value)}
                                                                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#Eb3505] focus:border-transparent text-sm font-montserrat"
                                                                                >
                                                                                    <option value="">Select Title</option>
                                                                                    <option value="QE">Quality Engineer</option>
                                                                                    <option value="RE">Resident Engineer</option>
                                                                                    <option value="PI">Project Inspector</option>
                                                                                    <option value="ME">Materials Engineer</option>
                                                                                    <option value="Lab Tech/Lab Aide">Lab Tech/Lab Aide</option>
                                                                                </select>
                                                                            </div>
                                                                            {engineer.titles.length > 1 && (
                                                                                <button
                                                                                    type="button"
                                                                                    onClick={() => removeTitleFromEngineer(index, titleIndex)}
                                                                                    className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors mt-0.5"
                                                                                    title="Remove title"
                                                                                >
                                                                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                                                                    </svg>
                                                                                </button>
                                                                            )}
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                                <div className="flex flex-col justify-start">
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => addTitleToEngineer(index)}
                                                                        className="px-2 py-2 bg-green-600 text-white text-xs font-medium rounded hover:bg-green-700 transition-colors whitespace-nowrap h-[38px]"
                                                                    >
                                                                        Add Engr. title
                                                                    </button>
                                                                    {engineers.length > 1 && (
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => removeEngineer(index)}
                                                                            className="p-2 text-white hover:text-white bg-orange-500 hover:bg-orange-600 rounded-lg transition-colors mt-2 flex items-center gap-1"
                                                                            title="Remove engineer"
                                                                        >
                                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                                            </svg>
                                                                            <span className="text-xs">Remove Engr.</span>
                                                                        </button>
                                                                    )}
                                                                </div>
                                                            </div>
                                                            {errors[`engineer_title_${index + 1}`] && <p className="text-red-500 text-xs mt-1">{errors[`engineer_title_${index + 1}`]}</p>}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                            <div className="pt-2">
                                                <button
                                                    type="button"
                                                    onClick={addEngineer}
                                                    className="inline-flex items-center px-3 py-2 bg-[#Eb3505] text-white text-sm font-medium rounded-lg hover:bg-[#d02904] transition-colors font-montserrat"
                                                >
                                                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                                    </svg>
                                                    Add Engineer
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Project Documents */}
                                    <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                                        <h4 className="text-base font-semibold text-slate-800 font-montserrat mb-3">Project Documents</h4>

                                        {/* Document Upload Button */}
                                        <div className="mb-4 flex justify-center">
                                            <label className="inline-flex items-center px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 cursor-pointer transition-colors">
                                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                                </svg>
                                                Add Documents
                                                <input
                                                    type="file"
                                                    multiple
                                                    accept=".doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                                                    onChange={handleDocumentChange}
                                                    className="hidden"
                                                />
                                            </label>
                                        </div>
                                        <p className="text-xs text-slate-500 mt-2">You can select multiple Word documents (.doc, .docx)</p>

                                        {/* Document Previews */}
                                        {documentPreviews.length > 0 && (
                                            <div className="space-y-3">
                                                <div className="flex items-center justify-between">
                                                    <p className="text-sm font-medium text-slate-700">
                                                        New Documents ({documentPreviews.length})
                                                    </p>
                                                    <button
                                                        type="button"
                                                        onClick={clearDocuments}
                                                        className="text-xs text-red-600 hover:text-red-800 transition-colors"
                                                    >
                                                        Clear All
                                                    </button>
                                                </div>

                                                <div className="space-y-2">
                                                    {documentPreviews.map((preview, index) => (
                                                        <div key={index} className="flex items-center justify-between p-3 bg-white rounded-lg border border-slate-200">
                                                            <div className="flex items-center space-x-3">
                                                                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                                </svg>
                                                                <div>
                                                                    <p className="text-sm font-medium text-slate-800">{preview.name}</p>
                                                                    <p className="text-xs text-slate-500">{preview.size}</p>
                                                                </div>
                                                            </div>
                                                            <button
                                                                type="button"
                                                                onClick={() => removeDocument(index)}
                                                                className="text-red-500 hover:text-red-700 transition-colors"
                                                                title="Remove document"
                                                            >
                                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                                </svg>
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {errors.images && <p className="text-red-500 text-xs mt-1">{errors.images}</p>}
                                    </div>

                                    <RemarksSection
                                        data={data}
                                        setData={setData}
                                        errors={errors}
                                    />
                                </div>

                                {/* Modal Actions */}
                                <div className="flex justify-end space-x-4 mt-6 pb-4 bg-white sticky bottom-0 border-t border-slate-200 pt-4">
                                    <button
                                        type="button"
                                        onClick={onClose}
                                        className="inline-flex items-center px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 transition-all font-montserrat"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isLoading || processing}
                                        className="inline-flex items-center px-6 py-3 bg-[#Eb3505] text-white rounded-xl text-sm font-semibold shadow-md hover:bg-[#d12e04] transition-all font-montserrat disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden"
                                    >
                                        <span className="relative flex items-center gap-2">
                                            {isLoading || processing ? (
                                                <>
                                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                    </svg>
                                                    Creating...
                                                </>
                                            ) : (
                                                'Submit'
                                            )}
                                        </span>
                                    </button>
                                </div>
                            </form>

                            {/* Scroll Indicator */}
                            <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-white via-transparent to-transparent pointer-events-none"></div>
                        </div>
                    </div>
                </div>
            )}
        <FeedbackAlert
                show={feedbackAlert.show}
                type={feedbackAlert.type}
                title={feedbackAlert.title}
                message={feedbackAlert.message}
                onClose={() => setFeedbackAlert({ show: false, type: 'success', title: '', message: '' })}
                duration={3000}
            />
        </>
    )
}
