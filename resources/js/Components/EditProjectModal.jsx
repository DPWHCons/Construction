import { useForm, usePage, router } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import DPWHLoading from '@/Components/DPWHLoading';
import NumberField from '@/Components/forms/NumberField';
import FeedbackAlert from '@/Components/FeedbackAlert';

export default function EditProjectModal({ show, onClose, project, categories = [], updateProjectData }) {
    // Image state
    const [images, setImages] = useState([]);
    const [imagePreviews, setImagePreviews] = useState([]);
    const [existingImages, setExistingImages] = useState([]);
    
    // Loading state
    const [isLoading, setIsLoading] = useState(false);
    
    // Feedback alert states
    const [showSuccessAlert, setShowSuccessAlert] = useState(false);
    const [showErrorAlert, setShowErrorAlert] = useState(false);
    const [alertMessage, setAlertMessage] = useState('');
    const [alertTitle, setAlertTitle] = useState('');
    
    // Dynamic engineers state
    const [engineers, setEngineers] = useState([
        { name: '', titles: [''] }
    ]);
    
    // Initialize form data with project data
    const { data, setData, post, processing, errors, reset } = useForm({
        // Basic project info
        title: '',
        project_year: new Date().getFullYear().toString(),
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
        
        // Images
        images: [],
        removed_images: [],
    });

    // Update form data when project changes
    useEffect(() => {
        if (project) {
            try {
                // Initialize engineers from project data
                const projectEngineers = [];
                for (let i = 0; i < 4; i++) {
                    const engineerName = project.assignedEngineers?.[i]?.engineer_name;
                    const engineerTitle = project.assignedEngineers?.[i]?.engineer_title;
                    if (engineerName || engineerTitle) {
                        // Split slash-separated titles into array
                        const titles = engineerTitle ? engineerTitle.split(' / ').map(t => t.trim()).filter(t => t) : [''];
                        projectEngineers.push({
                            name: engineerName || '',
                            titles: titles.length > 0 ? titles : ['']
                        });
                    }
                }
                
                // If no engineers found, start with one empty engineer
                if (projectEngineers.length === 0) {
                    projectEngineers.push({ name: '', titles: [''] });
                }
                
                setEngineers(projectEngineers);

                // Helper function to format date safely
                const formatDate = (dateString) => {
                    if (!dateString) return '';
                    if (typeof dateString === 'string' && dateString.includes('T')) {
                        return dateString.split('T')[0];
                    }
                    return dateString;
                };

                const formData = {
                    // Basic project info
                    title: project.title || '',
                    date_started: formatDate(project.date_started) || '',
                    status: project.status || 'ongoing',
                    completion_date: formatDate(project.completion_date) || '',
                    project_year: project.project_year?.toString() || new Date().getFullYear().toString(),
                    
                    // Category
                    category_id: project.category?.id || project.category_id || '',
                    new_category: '',
                    
                    // Contract information
                    project_id: project.project_id || '',
                    contract_id: project.contract_id || '',
                    
                    // Financial Information
                    program_amount: project.program_amount || '',
                    project_cost: project.project_cost || '',
                    revised_project_cost: project.revised_project_cost || '',
                    
                    // Scope of work
                    duration_cd: project.scope?.[0]?.duration_cd || '',
                    project_engineer: project.scope?.[0]?.project_engineer || '',
                    contractor_name: project.scope?.[0]?.contractor_name || '',
                    unit_of_measure: project.scope?.[0]?.unit_of_measure || '',
                    scope_of_work_main: project.scope?.[0]?.scope_of_work_main || '',
                    
                    // Progress & scope
                    target_actual: project.progress?.[0]?.target_actual || '',
                    target_start_actual: formatDate(project.progress?.[0]?.target_start_actual) || '',
                    target_completion_actual: formatDate(project.progress?.[0]?.target_completion_actual) || '',
                    
                    // Remarks
                    remarks: project.remarks?.[0]?.remarks || '',
                    
                    // Assigned engineers - map from dynamic engineers
                    ...projectEngineers.reduce((acc, engineer, i) => {
                        acc[`assigned_engineer_${i + 1}`] = engineer.name;
                        // Join all titles with slash separator for form data
                        acc[`engineer_title_${i + 1}`] = engineer.titles.filter(title => title.trim() !== '').join(' / ');
                        return acc;
                    }, {}),
                    
                    // Images
                    images: [],
                    removed_images: [],
                };
                
                setData(formData);
                
                // Force a re-render to ensure form fields are updated
                setTimeout(() => {
                }, 100);
            } catch (error) {
                // Error handling without console logging
            }
        }
    }, [project, setData]);

    // Initialize existing images
    useEffect(() => {
        if (project?.images) {
            setExistingImages(project.images);
        }
    }, [project]);


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

    // Image handling functions
    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        const newImages = [...images, ...files];
        const newPreviews = [...imagePreviews];
        
        files.forEach(file => {
            const reader = new FileReader();
            reader.onload = (event) => {
                newPreviews.push(event.target.result);
                setImagePreviews([...newPreviews]);
            };
            reader.readAsDataURL(file);
        });
        
        setImages(newImages);
        setData('images', newImages);
    };
    
    const removeImage = (index) => {
        const newImages = images.filter((_, i) => i !== index);
        const newPreviews = imagePreviews.filter((_, i) => i !== index);
        
        setImages(newImages);
        setImagePreviews(newPreviews);
        setData('images', newImages);
    };

    const clearImages = () => {
        setImages([]);
        setImagePreviews([]);
        setData('images', []);
    };
    
    const removeExistingImage = (index) => {
        const newExistingImages = existingImages.filter((_, i) => i !== index);
        setExistingImages(newExistingImages);
        
        // Add to removed images list for backend processing
        const removedImage = existingImages[index];
        if (removedImage.id) {
            const currentRemoved = data.removed_images || [];
            setData('removed_images', [...currentRemoved, removedImage.id]);
        }
    };

    // Engineer management functions
    const addEngineer = () => {
        if (engineers.length >= 4) return; // Limit to 4 engineers as supported by backend
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
        
        // Create FormData object for proper method override
        const formData = new FormData();
        
        // Add method override for PUT - this must be added first
        formData.append('_method', 'PUT');
        
        // Add all form data
        Object.keys(data).forEach(key => {
            if (key === 'images' || key === 'removed_images') {
                // Handle arrays separately
                return;
            } else if (data[key] !== null && data[key] !== undefined) {
                formData.append(key, data[key]);
            }
        });
        
        // Add images
        images.forEach((image, index) => {
            formData.append(`images[${index}]`, image);
        });
        
        // Add removed images
        if (data.removed_images && Array.isArray(data.removed_images)) {
            data.removed_images.forEach((imageId, index) => {
                formData.append(`removed_images[${index}]`, imageId);
            });
        }
        
        // Add engineers data
        engineers.forEach((engineer, index) => {
            if (engineer.name || engineer.titles) {
                formData.append(`assigned_engineer_${index + 1}`, engineer.name || '');
                // Join all titles with slash separator
                const titlesString = engineer.titles.filter(title => title.trim() !== '').join(' / ');
                formData.append(`engineer_title_${index + 1}`, titlesString || '');
            }
        });
        
        // Show DPWHLoading immediately
        setIsLoading(true);
        
        // Force re-render to ensure loading appears
        setTimeout(() => {
            // Submit the form
            router.post(route('projects.update', project.id), formData, {
                onBefore: () => {
                    setIsLoading(true);
                },
                onSuccess: (page) => {
                    setIsLoading(false);
                    setAlertTitle('Success');
                    setAlertMessage(`Successfully Updated "${data.contract_id || project.contract_id || 'Untitled'}"`);
                    setShowSuccessAlert(true);
                    
                    // Auto-close modal after showing success feedback
                    setTimeout(() => {
                        setShowSuccessAlert(false);
                        onClose();
                    }, 500); // Give alert time to show before closing
                    
                    // Update parent component data with complete server response
                    if (updateProjectData && page.props.projects?.data) {
                        // Replace entire project data with server response to maintain pagination
                        updateProjectData(page.props.projects.data);
                    }
                },
                onError: (errors) => {
                    setIsLoading(false);
                    setAlertTitle('Error');
                    setAlertMessage('Failed to update project. Please check the form for errors.');
                    setShowErrorAlert(true);
                    setTimeout(() => {
                        setShowErrorAlert(false);
                    }, 5000);
                    // Show specific errors to user
                    const errorMessages = Object.values(errors).flat();
                    if (errorMessages.length > 0) {
                        setAlertMessage(errorMessages[0]);
                        setShowErrorAlert(true);
                        setTimeout(() => {
                            setShowErrorAlert(false);
                        }, 5000);
                    }
                },
                onFinish: () => {
                    setIsLoading(false);
                },
                preserveState: true,
                preserveScroll: true,
            });
        }, 50); // Small delay to ensure loading state is set
    };
    
    if (!show) return null;
    
    return (
        <>
            {isLoading && (
                <DPWHLoading 
                    message="Updating Project..."
                    subMessage="Please wait while we update your project"
                />
            )}
            
            {/* Success Feedback Alert */}
            <FeedbackAlert
                show={showSuccessAlert}
                onClose={() => setShowSuccessAlert(false)}
                type="success"
                title={alertTitle}
                message={alertMessage}
                duration={3000}
                showProgress={true}
            />
            
            {/* Error Feedback Alert */}
            <FeedbackAlert
                show={showErrorAlert}
                onClose={() => setShowErrorAlert(false)}
                type="error"
                title={alertTitle}
                message={alertMessage}
                duration={5000}
                showProgress={true}
            />
            
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
            onClick={onClose}
        >
            <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto overflow-x-hidden border-0 border-slate-200 scrollbar-thin scrollbar-thumb-slate-400 scrollbar-track-slate-100" onClick={(e) => e.stopPropagation()}>
                <div className="bg-white border-b border-slate-200 p-4 rounded-t-2xl sticky top-0 z-10">
                    <div className="flex items-center justify-between">
                        <h3 className="text-xl font-bold text-slate-800 font-montserrat">Edit Project</h3>
                        <div className="flex items-center space-x-3">
                            <div className="relative bg-slate-200 rounded-full p-1 w-72 h-10">
                                <div 
                                    className={`absolute top-1 h-8 w-24 rounded-full shadow-md transition-all duration-300 ease-in-out ${
                                        data.status === 'ongoing' 
                                            ? 'left-1 bg-orange-500' 
                                            : data.status === 'completed'
                                            ? 'left-[100px] bg-blue-500'
                                            : 'left-[196px] bg-red-500'
                                    }`}
                                />
                                <div className="relative z-10 flex h-8">
                                    <button
                                        type="button"
                                        onClick={() => setData('status', 'ongoing')}
                                        className={`flex-1 rounded-full text-xs font-semibold transition-all duration-200 flex items-center justify-center ${
                                            data.status === 'ongoing'
                                                ? 'text-white font-bold'
                                                : 'text-slate-500 hover:text-slate-700'
                                        }`}
                                    >
                                        Ongoing
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setData('status', 'completed')}
                                        className={`flex-1 rounded-full text-xs font-semibold transition-all duration-200 flex items-center justify-center ${
                                            data.status === 'completed'
                                                ? 'text-white font-bold'
                                                : 'text-slate-500 hover:text-slate-700'
                                        }`}
                                    >
                                        Completed
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setData('status', 'pending')}
                                        className={`flex-1 rounded-full text-xs font-semibold transition-all duration-200 flex items-center justify-center ${
                                            data.status === 'pending'
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
                            {/* Categories */}
                            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                                <h4 className="text-base font-semibold text-slate-800 font-montserrat mb-3">Categories</h4>
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                                     <div>
                                        <label className="block text-xs font-medium text-slate-700 font-montserrat mb-1">Add New Category</label>
                                        <input
                                            type="text"
                                            value={data.new_category}
                                            onChange={(e) => setData('new_category', e.target.value)}
                                            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#Eb3505] focus:border-transparent text-sm font-montserrat"
                                            placeholder="Enter new category"
                                        />
                                        {errors.new_category && <p className="text-red-500 text-xs mt-1">{errors.new_category}</p>}
                                    </div>
                                    <div>
                                        
                                        <label className="block text-xs font-medium text-slate-700 font-montserrat mb-1">Select Category</label>
                                        <select
                                            value={data.category_id}
                                            onChange={(e) => setData('category_id', e.target.value)}
                                            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#Eb3505] focus:border-transparent text-sm font-montserrat"
                                        >
                                            <option value="">Select Category</option>
                                            {categories.map((category) => (
                                                <option key={category.id} value={category.id}>
                                                    {category.name}
                                                </option>
                                            ))}
                                        </select>
                                        {errors.category_id && <p className="text-red-500 text-xs mt-1">{errors.category_id}</p>}
                                    </div>
                                </div>
                            </div>

                            {/* Contract Information */}
                            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 mt-6">
                                <h4 className="text-base font-semibold text-slate-800 font-montserrat mb-3">Contract Information</h4>
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
                                    <div>
                                        <label className="block text-xs font-medium text-slate-700 font-montserrat mb-1">Project Year</label>
                                        <select
                                            value={data.project_year}
                                            onChange={(e) => setData('project_year', e.target.value)}
                                            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#Eb3505] focus:border-transparent text-sm font-montserrat"
                                        >
                                            {Array.from({length: 11}, (_, i) => new Date().getFullYear() - 5 + i).map(year => (
                                                <option key={year} value={year}>{year}</option>
                                            ))}
                                        </select>
                                        {errors.project_year && <p className="text-red-500 text-xs mt-1">{errors.project_year}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-slate-700 font-montserrat mb-1">Contract ID</label>
                                        <input
                                                    type="text"
                                                    value={data.contract_id}
                                                    onChange={(e) => setData('contract_id', e.target.value)}
                                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#Eb3505] focus:border-transparent text-sm font-montserrat"
                                                    placeholder="Enter Contract ID"
                                                />
                                        {errors.contract_id && <p className="text-red-500 text-xs mt-1">{errors.contract_id}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-slate-700 font-montserrat mb-1">Project ID</label>
                                        <input
                                                    type="text"
                                                    value={data.project_id}
                                                    onChange={(e) => setData('project_id', e.target.value)}
                                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#Eb3505] focus:border-transparent text-sm font-montserrat"
                                                    placeholder="Enter Project ID"
                                                />
                                        {errors.project_id && <p className="text-red-500 text-xs mt-1">{errors.project_id}</p>}
                                    </div>
                                    <div className="lg:col-span-3">
                                        <label className="block text-xs font-medium text-slate-700 font-montserrat mb-1">Project Name</label>
                                        <input
                                                    type="text"
                                                    value={data.title}
                                                    onChange={(e) => setData('title', e.target.value)}
                                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#Eb3505] focus:border-transparent text-sm font-montserrat"
                                                    placeholder="Enter Project Name"
                                                />
                                        {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
                                    </div>
    
                                </div>
                            </div>

                            {/* Financial Information */}
                            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                                <h4 className="text-base font-semibold text-slate-800 font-montserrat mb-3">Financial Information</h4>
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
                            </div>

                            {/* Scope of Work */}
                            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                                <h4 className="text-base font-semibold text-slate-800 font-montserrat mb-3">Scope of Work</h4>
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs font-medium text-slate-700 font-montserrat mb-1">Duration (CD)</label>
                                        <input
                                            type="number"
                                            value={data.duration_cd}
                                            onChange={(e) => setData('duration_cd', e.target.value)}
                                            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#Eb3505] focus:border-transparent text-sm font-montserrat"
                                            placeholder="Enter duration"
                                        />
                                        {errors.duration_cd && <p className="text-red-500 text-xs mt-1">{errors.duration_cd}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-slate-700 font-montserrat mb-1">Project Engineer</label>
                                        <input
                                            type="text"
                                            value={data.project_engineer}
                                            onChange={(e) => setData('project_engineer', e.target.value)}
                                            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#Eb3505] focus:border-transparent text-sm font-montserrat"
                                            placeholder="Enter project engineer"
                                        />
                                        {errors.project_engineer && <p className="text-red-500 text-xs mt-1">{errors.project_engineer}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-slate-700 font-montserrat mb-1">Contractor Name</label>
                                        <input
                                            type="text"
                                            value={data.contractor_name}
                                            onChange={(e) => setData('contractor_name', e.target.value)}
                                            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#Eb3505] focus:border-transparent text-sm font-montserrat"
                                            placeholder="Enter contractor name"
                                        />
                                        {errors.contractor_name && <p className="text-red-500 text-xs mt-1">{errors.contractor_name}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-slate-700 font-montserrat mb-1">Unit of Measure</label>
                                        <input
                                            type="text"
                                            value={data.unit_of_measure}
                                            onChange={(e) => setData('unit_of_measure', e.target.value)}
                                            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#Eb3505] focus:border-transparent text-sm font-montserrat"
                                            placeholder="Enter unit of measure"
                                        />
                                        {errors.unit_of_measure && <p className="text-red-500 text-xs mt-1">{errors.unit_of_measure}</p>}
                                    </div>
                                    <div className="lg:col-span-2">
                                        <label className="block text-xs font-medium text-slate-700 font-montserrat mb-1">Scope of Work Main</label>
                                        <textarea
                                            value={data.scope_of_work_main}
                                            onChange={(e) => setData('scope_of_work_main', e.target.value)}
                                            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#Eb3505] focus:border-transparent text-sm font-montserrat"
                                            rows="3"
                                            placeholder="Enter scope of work description"
                                        />
                                        {errors.scope_of_work_main && <p className="text-red-500 text-xs mt-1">{errors.scope_of_work_main}</p>}
                                    </div>
                                </div>
                            </div>

                            {/* Progress & Scope */}
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
                                                                            <option value="RE">Resident Engineer</option>
                                                                            <option value="QE">Quality Engineer</option>
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
                                            
                            {/* Project Images */}
                            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                                <h4 className="text-base font-semibold text-slate-800 font-montserrat mb-3">Project Images</h4>
                                
                                {/* Existing Images */}
                                {existingImages.length > 0 && (
                                    <div className="mb-4">
                                        <p className="text-sm font-medium text-slate-700 mb-2">Current Images</p>
                                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                                            {existingImages.map((image, index) => (
                                                <div key={index} className="relative group">
                                                    <img
                                                        src={image.url || (image.image_path ? `/storage/${image.image_path}` : '')}
                                                        alt={`Current image ${index + 1}`}
                                                        className="w-full h-24 object-cover rounded-lg border border-slate-200"
                                                        onError={(e) => {
                                                            e.target.style.display = 'none';
                                                        }}
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => removeExistingImage(index)}
                                                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                                    >
                                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                                        </svg>
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                
                                {/* Image Upload Button */}
                                <div className="mb-4 flex justify-center">
                                    <label className="inline-flex items-center px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 cursor-pointer transition-colors">
                                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                                        </svg>
                                        Add New Images
                                        <input
                                            type="file"
                                            multiple
                                            accept="image/*"
                                            onChange={handleImageChange}
                                            className="hidden"
                                        />
                                    </label>
                                </div>
                                <p className="text-xs text-slate-500 mt-2">You can select multiple images at once</p>

                                {/* New Image Previews */}
                                {imagePreviews.length > 0 && (
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <p className="text-sm font-medium text-slate-700">
                                                {imagePreviews.length} new {imagePreviews.length === 1 ? 'image' : 'images'} selected
                                            </p>
                                            <button
                                                type="button"
                                                onClick={clearImages}
                                                className="text-xs text-red-600 hover:text-red-800 transition-colors"
                                            >
                                                Clear All
                                            </button>
                                        </div>
                                        
                                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                                            {imagePreviews.map((preview, index) => (
                                                <div key={index} className="relative group">
                                                    <img
                                                        src={preview}
                                                        alt={`Preview ${index + 1}`}
                                                        className="w-full h-24 object-cover rounded-lg border border-slate-200"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => removeImage(index)}
                                                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                                    >
                                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                                        </svg>
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {errors.images && <p className="text-red-500 text-xs mt-1">{errors.images}</p>}
                            </div>
                            
                            {/* Remarks */}
                            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 mt-6">
                                <h4 className="text-base font-semibold text-slate-800 font-montserrat mb-3">Remarks</h4>
                                <div>
                                    <textarea
                                        value={data.remarks}
                                        onChange={(e) => setData('remarks', e.target.value)}
                                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#Eb3505] focus:border-transparent text-sm font-montserrat"
                                        rows="3"
                                        placeholder="Enter project remarks"
                                    />
                                    {errors.remarks && <p className="text-red-500 text-xs mt-1">{errors.remarks}</p>}
                                </div>
                            </div>
                            {/* Added closing div tag */}
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
                                disabled={processing}
                                className="inline-flex items-center px-4 py-2 bg-green-500 text-white rounded-xl text-sm font-semibold shadow-md hover:bg-green-600 transition-all font-montserrat disabled:opacity-50"
                            >
                                {processing ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Updating ...
                                    </>
                                ) : (
                                    <>
                                        Update Project
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
        </>
    );
}
