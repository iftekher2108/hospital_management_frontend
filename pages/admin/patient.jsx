"use client"
import AuthLayout from "@/components/authLayout"
import Pagination from "@/components/pagination"
import getToken from "@/lib/getToken"
import { baseUrl } from "@/lib/base_url"
import { useCallback, useEffect, useState, useRef } from "react"
import { useSearchParams } from "next/navigation"

export default function Patient() {
    const [patients, setPatients] = useState([])
    const [departments, setDepartments] = useState([])
    const [doctors, setDoctors] = useState([])
    const [paginationData, setPaginationData] = useState(null)
    const [editingId, setEditingId] = useState(null)
    const [message, setMessage] = useState(null)
    const [currentPatientPicture, setCurrentPatientPicture] = useState('')
    const [currentGuardianPicture, setCurrentGuardianPicture] = useState('')
    const formRef = useRef(null)
    const searchParams = useSearchParams()
    const page = searchParams.get('page') || 1
    const limit = searchParams.get('limit') || 10

    const getPatients = useCallback(async () => {
        const token = getToken()
        const res = await fetch(`${baseUrl}/api/patients?page=${page}&limit=${limit}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + token
            }
        })
        const { data } = await res.json()
        if (data) {
            setPatients(data.data || [])
            setPaginationData(data)
        }
    }, [page, limit])

    const getDepartments = useCallback(async () => {
        const token = getToken()
        const res = await fetch(`${baseUrl}/api/departments?limit=100`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + token
            }
        })
        const { data } = await res.json()
        if (data) {
            setDepartments(data.data || [])
        }
    }, [])

    const getDoctors = useCallback(async () => {
        const token = getToken()
        const res = await fetch(`${baseUrl}/api/doctors?limit=100`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + token
            }
        })
        const { data } = await res.json()
        if (data) {
            setDoctors(data.data || [])
        }
    }, [])

    useEffect(() => {
        getPatients()
        getDepartments()
        getDoctors()
    }, [getPatients, getDepartments, getDoctors])

    const openModal = async (id = null) => {
        setEditingId(id)
        setMessage(null)
        setCurrentPatientPicture('')
        setCurrentGuardianPicture('')
        
        // Reset form and previews
        if (formRef.current) {
            formRef.current.reset()
            // Clear file inputs
            const pictureInput = formRef.current.querySelector('[name="picture"]')
            const guardianPictureInput = formRef.current.querySelector('[name="g_picture"]')
            if (pictureInput) pictureInput.value = ''
            if (guardianPictureInput) guardianPictureInput.value = ''
            
            // Hide previews
            const preview = document.getElementById('patient-picture-preview')
            const guardianPreview = document.getElementById('guardian-picture-preview')
            if (preview) {
                preview.src = ''
                preview.style.display = 'none'
            }
            if (guardianPreview) {
                guardianPreview.src = ''
                guardianPreview.style.display = 'none'
            }
            const currentPreview = document.getElementById('patient-current-picture')
            const guardianCurrentPreview = document.getElementById('guardian-current-picture')
            if (currentPreview && currentPreview.parentElement) {
                currentPreview.parentElement.remove()
            }
            if (guardianCurrentPreview && guardianCurrentPreview.parentElement) {
                guardianCurrentPreview.parentElement.remove()
            }
        }
        
        if (id) {
            // Edit mode - populate form
            document.getElementById('patient-modal').showModal()
            const token = getToken()
            const res = await fetch(`${baseUrl}/api/patients/${id}`, {
                method: "GET",
                headers: {
                    "Authorization": "Bearer " + token
                }
            })
            const { patient } = await res.json()
            if (patient && formRef.current) {
                formRef.current.querySelector('[name="name"]').value = patient.name || ''
                formRef.current.querySelector('[name="username"]').value = patient.user?.username || ''
                formRef.current.querySelector('[name="email"]').value = patient.email || ''
                formRef.current.querySelector('[name="phone"]').value = patient.phone || ''
                formRef.current.querySelector('[name="gender"]').value = patient.gender || ''
                formRef.current.querySelector('[name="dob"]').value = patient.dob ? new Date(patient.dob).toISOString().split('T')[0] : ''
                formRef.current.querySelector('[name="age"]').value = patient.age || ''
                formRef.current.querySelector('[name="bloodGroup"]').value = patient.bloodGroup || ''
                formRef.current.querySelector('[name="maritalStatus"]').value = patient.maritalStatus || ''
                formRef.current.querySelector('[name="address"]').value = patient.address || ''
                formRef.current.querySelector('[name="city"]').value = patient.city || ''
                formRef.current.querySelector('[name="country"]').value = patient.country || ''
                formRef.current.querySelector('[name="department"]').value = patient.department?._id || patient.department || ''
                formRef.current.querySelector('[name="doctor"]').value = patient.doctor?._id || patient.doctor || ''
                formRef.current.querySelector('[name="guardianName"]').value = patient.guardian?.name || ''
                formRef.current.querySelector('[name="guardianPhone"]').value = patient.guardian?.phone || ''
                formRef.current.querySelector('[name="guardianRelationship"]').value = patient.guardian?.relationship || ''
                formRef.current.querySelector('[name="allergies"]').value = Array.isArray(patient.allergies) ? patient.allergies.join(', ') : ''
                formRef.current.querySelector('[name="currentMedications"]').value = Array.isArray(patient.currentMedications) ? patient.currentMedications.join(', ') : ''
                formRef.current.querySelector('[name="chronicDiseases"]').value = Array.isArray(patient.chronicDiseases) ? patient.chronicDiseases.join(', ') : ''
                formRef.current.querySelector('[name="medicalHistory"]').value = patient.medicalHistory || ''
                
                // Show current pictures
                const patientPic = patient.user?.picture || patient.picture || ''
                const guardianPic = patient.guardian?.picture || ''
                if (patientPic) {
                    setCurrentPatientPicture(patientPic)
                    const fileInput = formRef.current.querySelector('[name="picture"]')
                    if (fileInput && fileInput.parentElement) {
                        const div = document.createElement('div')
                        div.className = 'mt-2'
                        div.innerHTML = `<p class="text-xs mb-1">Current Picture:</p>`
                        const img = document.createElement('img')
                        img.id = 'patient-current-picture'
                        img.src = `${baseUrl}/public/${patientPic}`
                        img.className = 'w-20 h-20 object-cover rounded'
                        img.alt = 'Current'
                        div.appendChild(img)
                        fileInput.parentElement.appendChild(div)
                    }
                }
                if (guardianPic) {
                    setCurrentGuardianPicture(guardianPic)
                    const fileInput = formRef.current.querySelector('[name="g_picture"]')
                    if (fileInput && fileInput.parentElement) {
                        const div = document.createElement('div')
                        div.className = 'mt-2'
                        div.innerHTML = `<p class="text-xs mb-1">Current Guardian Picture:</p>`
                        const img = document.createElement('img')
                        img.id = 'guardian-current-picture'
                        img.src = `${baseUrl}/public/${guardianPic}`
                        img.className = 'w-20 h-20 object-cover rounded'
                        img.alt = 'Current Guardian'
                        div.appendChild(img)
                        fileInput.parentElement.appendChild(div)
                    }
                }
            }
        } else {
            // Add mode
            document.getElementById('patient-modal').showModal()
        }
    }

    const closeModal = () => {
        document.getElementById('patient-modal').close()
        setEditingId(null)
        setMessage(null)
        setCurrentPatientPicture('')
        setCurrentGuardianPicture('')
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        const token = getToken()
        const formdata = new FormData(e.currentTarget)
        
        // Process arrays from textarea values
        const allergiesValue = e.currentTarget.querySelector('[name="allergies"]').value
        if (allergiesValue) {
            const allergiesArray = allergiesValue.split(',').map(a => a.trim()).filter(a => a)
            formdata.set('allergies', JSON.stringify(allergiesArray))
        }
        
        const medicationsValue = e.currentTarget.querySelector('[name="currentMedications"]').value
        if (medicationsValue) {
            const medicationsArray = medicationsValue.split(',').map(m => m.trim()).filter(m => m)
            formdata.set('currentMedications', JSON.stringify(medicationsArray))
        }
        
        const diseasesValue = e.currentTarget.querySelector('[name="chronicDiseases"]').value
        if (diseasesValue) {
            const diseasesArray = diseasesValue.split(',').map(d => d.trim()).filter(d => d)
            formdata.set('chronicDiseases', JSON.stringify(diseasesArray))
        }

        // Guardian info - use proper FormData notation
        const guardianName = e.currentTarget.querySelector('[name="guardianName"]').value
        const guardianPhone = e.currentTarget.querySelector('[name="guardianPhone"]').value
        const guardianRelationship = e.currentTarget.querySelector('[name="guardianRelationship"]').value
        
        if (guardianName) formdata.set('guardian[name]', guardianName)
        if (guardianPhone) formdata.set('guardian[phone]', guardianPhone)
        if (guardianRelationship) formdata.set('guardian[relationship]', guardianRelationship)

        // Password validation
        const passwordInput = e.currentTarget.querySelector('[name="password"]')
        if (!editingId && (!passwordInput || !passwordInput.value)) {
            setMessage("Password is required for new patients")
            return
        }
        // Remove password if editing and not provided
        if (editingId && (!passwordInput || !passwordInput.value)) {
            formdata.delete('password')
        }

        try {
            const url = editingId 
                ? `${baseUrl}/api/patients/${editingId}`
                : `${baseUrl}/api/patients`
            const method = editingId ? 'PUT' : 'POST'

            const res = await fetch(url, {
                method: method,
                body: formdata,
                headers: {
                    "Authorization": "Bearer " + token
                }
            })
            const data = await res.json()
            
            if (res.ok) {
                setMessage(data.success || "Operation successful")
                setTimeout(() => {
                    closeModal()
                    getPatients()
                }, 1000)
            } else {
                setMessage(data.message || "Operation failed")
            }
        } catch (error) {
            setMessage("An error occurred")
        }
    }

    const handleDelete = async (id) => {
        if (!confirm("Are you sure you want to delete this patient?")) return
        
        const token = getToken()
        const res = await fetch(`${baseUrl}/api/patients/${id}`, {
            method: "DELETE",
            headers: {
                "Authorization": "Bearer " + token
            }
        })
        const data = await res.json()
        
        if (res.ok) {
            setMessage("Patient deleted successfully")
            getPatients()
        } else {
            setMessage(data.message || "Delete failed")
        }
    }

    return (
        <AuthLayout>
            <div className="flex justify-between mb-4">
                <h2 className="text-xl font-bold">Patients</h2>
                <button onClick={() => openModal()} className="btn btn-primary">
                    <i className="fa-solid fa-plus"></i> Add Patient
                </button>
            </div>

            {message && (
                <div role="alert" className={`alert mb-4 ${message.includes('success') || message.includes('Success') ? 'alert-success' : 'alert-error'}`}>
                    <span>{message}</span>
                </div>
            )}

            <dialog id="patient-modal" className="modal">
                <div className="modal-box max-w-5xl max-h-[90vh] overflow-y-auto">
                    <button onClick={closeModal} className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
                    <h3 className="font-bold text-lg mb-4">
                        {editingId ? 'Edit Patient' : 'Add New Patient'}
                    </h3>
                    
                    <form ref={formRef} onSubmit={handleSubmit} method="POST" encType="multipart/form-data">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="form-control">
                                <label className="floating-label">
                                    <input 
                                        type="text" 
                                        name="name"
                                        required
                                        className="input w-full input-lg focus:input-primary focus:outline-0" 
                                    />
                                    <span>Name <span className="text-error">*</span></span>
                                </label>
                            </div>

                            <div className="form-control">
                                <label className="floating-label">
                                    <input 
                                        type="text" 
                                        name="username"
                                        required={!editingId}
                                        className="input w-full input-lg focus:input-primary focus:outline-0" 
                                    />
                                    <span>Username <span className="text-error">*</span></span>
                                </label>
                            </div>

                            <div className="form-control">
                                <label className="floating-label">
                                    <input 
                                        type="email" 
                                        name="email"
                                        className="input w-full input-lg focus:input-primary focus:outline-0" 
                                    />
                                    <span>Email</span>
                                </label>
                            </div>

                            <div className="form-control">
                                <label className="floating-label">
                                    <input 
                                        type="text" 
                                        name="phone"
                                        required
                                        className="input w-full input-lg focus:input-primary focus:outline-0" 
                                    />
                                    <span>Phone <span className="text-error">*</span></span>
                                </label>
                            </div>

                            <div className="form-control">
                                <label className="floating-label">
                                    <input 
                                        type="password"
                                        name="password"
                                        required={!editingId}
                                        className="input w-full input-lg focus:input-primary focus:outline-0" 
                                    />
                                    <span>Password {!editingId && <span className="text-error">*</span>}</span>
                                </label>
                            </div>

                            <div className="form-control">
                                <select 
                                    name="gender"
                                    required
                                    className="select w-full select-primary focus:outline-0"
                                >
                                    <option value="">Select Gender</option>
                                    <option value="male">Male</option>
                                    <option value="female">Female</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>

                            <div className="form-control">
                                <label className="floating-label">
                                    <input 
                                        type="date" 
                                        name="dob"
                                        className="input w-full input-lg focus:input-primary focus:outline-0" 
                                    />
                                    <span>Date of Birth</span>
                                </label>
                            </div>

                            <div className="form-control">
                                <label className="floating-label">
                                    <input 
                                        type="number" 
                                        name="age"
                                        min="0"
                                        className="input w-full input-lg focus:input-primary focus:outline-0" 
                                    />
                                    <span>Age</span>
                                </label>
                            </div>

                            <div className="form-control">
                                <select 
                                    name="bloodGroup"
                                    className="select w-full select-primary focus:outline-0"
                                >
                                    <option value="">Select Blood Group</option>
                                    <option value="a+">A+</option>
                                    <option value="a-">A-</option>
                                    <option value="b+">B+</option>
                                    <option value="b-">B-</option>
                                    <option value="ab+">AB+</option>
                                    <option value="ab-">AB-</option>
                                    <option value="o+">O+</option>
                                    <option value="o-">O-</option>
                                </select>
                            </div>

                            <div className="form-control">
                                <select 
                                    name="maritalStatus"
                                    className="select w-full select-primary focus:outline-0"
                                >
                                    <option value="">Select Marital Status</option>
                                    <option value="single">Single</option>
                                    <option value="married">Married</option>
                                    <option value="divorced">Divorced</option>
                                    <option value="widowed">Widowed</option>
                                </select>
                            </div>

                            <div className="form-control col-span-2">
                                <label className="floating-label">
                                    <input 
                                        type="text" 
                                        name="address"
                                        className="input w-full input-lg focus:input-primary focus:outline-0" 
                                    />
                                    <span>Address</span>
                                </label>
                            </div>

                            <div className="form-control">
                                <label className="floating-label">
                                    <input 
                                        type="text" 
                                        name="city"
                                        className="input w-full input-lg focus:input-primary focus:outline-0" 
                                    />
                                    <span>City</span>
                                </label>
                            </div>

                            <div className="form-control">
                                <label className="floating-label">
                                    <input 
                                        type="text" 
                                        name="country"
                                        className="input w-full input-lg focus:input-primary focus:outline-0" 
                                    />
                                    <span>Country</span>
                                </label>
                            </div>

                            <div className="form-control">
                                <select 
                                    name="department"
                                    className="select w-full select-primary focus:outline-0"
                                >
                                    <option value="">Select Department</option>
                                    {departments.map(dept => (
                                        <option key={dept.id} value={dept.id}>{dept.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-control">
                                <select 
                                    name="doctor"
                                    className="select w-full select-primary focus:outline-0"
                                >
                                    <option value="">Select Doctor</option>
                                    {doctors.map(doc => (
                                        <option key={doc.id} value={doc.id}>{doc.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-control col-span-2">
                                <h4 className="font-semibold mb-2">Guardian Information</h4>
                            </div>

                            <div className="form-control">
                                <label className="floating-label">
                                    <input 
                                        type="text" 
                                        name="guardianName"
                                        className="input w-full input-lg focus:input-primary focus:outline-0" 
                                    />
                                    <span>Guardian Name</span>
                                </label>
                            </div>

                            <div className="form-control">
                                <label className="floating-label">
                                    <input 
                                        type="text" 
                                        name="guardianPhone"
                                        className="input w-full input-lg focus:input-primary focus:outline-0" 
                                    />
                                    <span>Guardian Phone</span>
                                </label>
                            </div>

                            <div className="form-control">
                                <label className="floating-label">
                                    <input 
                                        type="text" 
                                        name="guardianRelationship"
                                        className="input w-full input-lg focus:input-primary focus:outline-0" 
                                    />
                                    <span>Relationship</span>
                                </label>
                            </div>

                            <div className="form-control col-span-2">
                                <label className="floating-label">
                                    <textarea 
                                        name="allergies"
                                        placeholder="Comma separated list"
                                        className="textarea w-full textarea-lg textarea-primary focus:outline-0" 
                                    />
                                    <span>Allergies (comma separated)</span>
                                </label>
                            </div>

                            <div className="form-control col-span-2">
                                <label className="floating-label">
                                    <textarea 
                                        name="currentMedications"
                                        placeholder="Comma separated list"
                                        className="textarea w-full textarea-lg textarea-primary focus:outline-0" 
                                    />
                                    <span>Current Medications (comma separated)</span>
                                </label>
                            </div>

                            <div className="form-control col-span-2">
                                <label className="floating-label">
                                    <textarea 
                                        name="chronicDiseases"
                                        placeholder="Comma separated list"
                                        className="textarea w-full textarea-lg textarea-primary focus:outline-0" 
                                    />
                                    <span>Chronic Diseases (comma separated)</span>
                                </label>
                            </div>

                            <div className="form-control col-span-2">
                                <label className="floating-label">
                                    <textarea 
                                        name="medicalHistory"
                                        className="textarea w-full textarea-lg textarea-primary focus:outline-0" 
                                    />
                                    <span>Medical History</span>
                                </label>
                            </div>

                            <div className="form-control col-span-2">
                                <p className="text-sm mb-2">Profile Picture</p>
                                <input 
                                    type="file" 
                                    name="picture" 
                                    accept="image/*"
                                    onChange={(e) => {
                                        const file = e.target.files[0]
                                        if (file) {
                                            const reader = new FileReader()
                                            reader.onloadend = () => {
                                                const preview = document.getElementById('patient-picture-preview')
                                                if (preview) {
                                                    preview.src = reader.result
                                                    preview.style.display = 'block'
                                                }
                                            }
                                            reader.readAsDataURL(file)
                                        }
                                    }}
                                    className="file-input w-full focus:file-input-primary focus:outline-0" 
                                />
                                <p className="text-xs mt-1">Max size 2MB</p>
                                <img 
                                    id="patient-picture-preview"
                                    src="" 
                                    alt="Preview" 
                                    className="w-20 h-20 object-cover rounded mt-2 hidden"
                                />
                            </div>

                            <div className="form-control col-span-2">
                                <p className="text-sm mb-2">Guardian Picture</p>
                                <input 
                                    type="file" 
                                    name="g_picture" 
                                    accept="image/*"
                                    onChange={(e) => {
                                        const file = e.target.files[0]
                                        if (file) {
                                            const reader = new FileReader()
                                            reader.onloadend = () => {
                                                const preview = document.getElementById('guardian-picture-preview')
                                                if (preview) {
                                                    preview.src = reader.result
                                                    preview.style.display = 'block'
                                                }
                                            }
                                            reader.readAsDataURL(file)
                                        }
                                    }}
                                    className="file-input w-full focus:file-input-primary focus:outline-0" 
                                />
                                <p className="text-xs mt-1">Max size 2MB</p>
                                <img 
                                    id="guardian-picture-preview"
                                    src="" 
                                    alt="Preview" 
                                    className="w-20 h-20 object-cover rounded mt-2 hidden"
                                />
                            </div>
                        </div>

                        <div className="flex justify-end mt-4 gap-2">
                            <button type="button" onClick={closeModal} className="btn">Cancel</button>
                            <button type="submit" className="btn btn-primary">Submit</button>
                        </div>
                    </form>
                </div>
            </dialog>

            <div className="overflow-x-auto rounded-box border border-base-content/5 bg-base-100">
                <table className="table">
                    <thead>
                        <tr className="bg-primary">
                            <th>Sl</th>
                            <th>Picture</th>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Phone</th>
                            <th>Gender</th>
                            <th>Age</th>
                            <th>Department</th>
                            <th>Doctor</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {patients.map((patient, i) => (
                            <tr key={patient.id}>
                                <td>{i + 1}</td>
                                <td>
                                    {patient.user?.picture || patient.picture ? (
                                        <div className="avatar">
                                            <div className="w-12 h-12 rounded-full">
                                                <img src={`${baseUrl}/public/${patient.user?.picture || patient.picture}`} alt={patient.name} />
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="avatar placeholder">
                                            <div className="bg-neutral text-neutral-content rounded-full w-12">
                                                <span className="text-xs">{patient.name.charAt(0)}</span>
                                            </div>
                                        </div>
                                    )}
                                </td>
                                <td>{patient.name}</td>
                                <td>{patient.email || 'N/A'}</td>
                                <td>{patient.phone}</td>
                                <td>{patient.gender}</td>
                                <td>{patient.age || 'N/A'}</td>
                                <td>{patient.department?.name || 'N/A'}</td>
                                <td>{patient.doctor?.name || 'N/A'}</td>
                                <td>
                                    <button 
                                        onClick={() => openModal(patient.id)} 
                                        className="btn btn-sm btn-info me-1"
                                    >
                                        <i className="fa-solid fa-pen-to-square"></i>
                                    </button>
                                    <button 
                                        onClick={() => handleDelete(patient.id)} 
                                        className="btn btn-sm btn-error"
                                    >
                                        <i className="fa-solid fa-trash"></i>
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {patients.length === 0 && (
                            <tr>
                                <td colSpan="10" className="text-center py-4">No patients found</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {paginationData && (
                <Pagination paginationData={paginationData} />
            )}
        </AuthLayout>
    )
}
