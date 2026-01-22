"use client"
import AuthLayout from "@/components/authLayout"
import Pagination from "@/components/pagination"
import getToken from "@/lib/getToken"
import { baseUrl } from "@/lib/base_url"
import { useCallback, useEffect, useState, useRef } from "react"
import { useSearchParams } from "next/navigation"

export default function Doctor() {
    const [doctors, setDoctors] = useState([])
    const [departments, setDepartments] = useState([])
    const [paginationData, setPaginationData] = useState(null)
    const [editingId, setEditingId] = useState(null)
    const [message, setMessage] = useState(null)
    const [currentPicture, setCurrentPicture] = useState('')
    const formRef = useRef(null)
    const searchParams = useSearchParams()
    const page = searchParams.get('page') || 1
    const limit = searchParams.get('limit') || 10

    const getDoctors = useCallback(async () => {
        const token = getToken()
        const res = await fetch(`${baseUrl}/api/doctors?page=${page}&limit=${limit}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + token
            }
        })
        const { data } = await res.json()
        if (data) {
            setDoctors(data.data || [])
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

    useEffect(() => {
        getDoctors()
        getDepartments()
    }, [getDoctors, getDepartments])

    const openModal = async (id = null) => {
        setEditingId(id)
        setMessage(null)
        setCurrentPicture('')
        
        // Reset form and previews
        if (formRef.current) {
            formRef.current.reset()
            // Clear file input
            const fileInput = formRef.current.querySelector('[name="picture"]')
            if (fileInput) {
                fileInput.value = ''
            }
            // Hide previews
            const preview = document.getElementById('doctor-picture-preview')
            if (preview) {
                preview.src = ''
                preview.style.display = 'none'
            }
            const currentPreview = document.getElementById('doctor-current-picture')
            if (currentPreview && currentPreview.parentElement) {
                currentPreview.parentElement.remove()
            }
        }
        
        if (id) {
            // Edit mode - populate form
            document.getElementById('doctor-modal').showModal()
            const token = getToken()
            const res = await fetch(`${baseUrl}/api/doctors/${id}`, {
                method: "GET",
                headers: {
                    "Authorization": "Bearer " + token
                }
            })
            const { doctor } = await res.json()
            if (doctor && formRef.current) {
                formRef.current.querySelector('[name="name"]').value = doctor.name || ''
                formRef.current.querySelector('[name="username"]').value = doctor.user?.username || ''
                formRef.current.querySelector('[name="email"]').value = doctor.email || ''
                formRef.current.querySelector('[name="phone"]').value = doctor.phone || ''
                formRef.current.querySelector('[name="gender"]').value = doctor.gender || ''
                formRef.current.querySelector('[name="specialization"]').value = doctor.specialization || ''
                formRef.current.querySelector('[name="qualification"]').value = doctor.qualification || ''
                formRef.current.querySelector('[name="experienceYears"]').value = doctor.experienceYears || ''
                formRef.current.querySelector('[name="department"]').value = doctor.department?._id || doctor.department || ''
                formRef.current.querySelector('[name="consultationFee"]').value = doctor.consultationFee || ''
                formRef.current.querySelector('[name="chamberName"]').value = doctor.chamberName || ''
                formRef.current.querySelector('[name="chamberAddress"]').value = doctor.chamberAddress || ''
                formRef.current.querySelector('[name="visitingHours"]').value = doctor.visitingHours || ''
                
                // Store current picture for display
                const pic = doctor.user?.picture || doctor.picture || ''
                if (pic) {
                    setCurrentPicture(pic)
                    const fileInput = formRef.current.querySelector('[name="picture"]')
                    if (fileInput && fileInput.parentElement) {
                        const div = document.createElement('div')
                        div.className = 'mt-2'
                        div.innerHTML = `<p class="text-xs mb-1">Current Picture:</p>`
                        const img = document.createElement('img')
                        img.id = 'doctor-current-picture'
                        img.src = `${baseUrl}/public/${pic}`
                        img.className = 'w-20 h-20 object-cover rounded'
                        img.alt = 'Current'
                        div.appendChild(img)
                        fileInput.parentElement.appendChild(div)
                    }
                }
            }
        } else {
            // Add mode
            document.getElementById('doctor-modal').showModal()
        }
    }

    const closeModal = () => {
        document.getElementById('doctor-modal').close()
        setEditingId(null)
        setMessage(null)
        setCurrentPicture('')
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        const token = getToken()
        const formdata = new FormData(e.currentTarget)
        
        // Password validation - check form directly
        const passwordInput = e.currentTarget.querySelector('[name="password"]')
        if (!editingId && (!passwordInput || !passwordInput.value)) {
            setMessage("Password is required for new doctors")
            return
        }
        // Remove password if editing and not provided
        if (editingId && (!passwordInput || !passwordInput.value)) {
            formdata.delete('password')
        }

        try {
            const url = editingId 
                ? `${baseUrl}/api/doctors/${editingId}`
                : `${baseUrl}/api/doctors`
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
                    getDoctors()
                }, 1000)
            } else {
                setMessage(data.message || "Operation failed")
            }
        } catch (error) {
            setMessage("An error occurred")
        }
    }

    const handleDelete = async (id) => {
        if (!confirm("Are you sure you want to delete this doctor?")) return
        
        const token = getToken()
        const res = await fetch(`${baseUrl}/api/doctors/${id}`, {
            method: "DELETE",
            headers: {
                "Authorization": "Bearer " + token
            }
        })
        const data = await res.json()
        
        if (res.ok) {
            setMessage("Doctor deleted successfully")
            getDoctors()
        } else {
            setMessage(data.message || "Delete failed")
        }
    }

    return (
        <AuthLayout>
            <div className="flex justify-between mb-4">
                <h2 className="text-xl font-bold">Doctors</h2>
                <button onClick={() => openModal()} className="btn btn-primary">
                    <i className="fa-solid fa-plus"></i> Add Doctor
                </button>
            </div>

            {message && (
                <div role="alert" className={`alert mb-4 ${message.includes('success') || message.includes('Success') ? 'alert-success' : 'alert-error'}`}>
                    <span>{message}</span>
                </div>
            )}

            <dialog id="doctor-modal" className="modal">
                <div className="modal-box max-w-4xl max-h-[90vh] overflow-y-auto">
                    <button onClick={closeModal} className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
                    <h3 className="font-bold text-lg mb-4">
                        {editingId ? 'Edit Doctor' : 'Add New Doctor'}
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
                                        required
                                        className="input w-full input-lg focus:input-primary focus:outline-0" 
                                    />
                                    <span>Email <span className="text-error">*</span></span>
                                </label>
                            </div>

                            <div className="form-control">
                                <label className="floating-label">
                                    <input 
                                        type="text" 
                                        name="phone"
                                        className="input w-full input-lg focus:input-primary focus:outline-0" 
                                    />
                                    <span>Phone</span>
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
                                        type="text" 
                                        name="specialization"
                                        required
                                        className="input w-full input-lg focus:input-primary focus:outline-0" 
                                    />
                                    <span>Specialization <span className="text-error">*</span></span>
                                </label>
                            </div>

                            <div className="form-control">
                                <label className="floating-label">
                                    <input 
                                        type="text" 
                                        name="qualification"
                                        required
                                        className="input w-full input-lg focus:input-primary focus:outline-0" 
                                    />
                                    <span>Qualification <span className="text-error">*</span></span>
                                </label>
                            </div>

                            <div className="form-control">
                                <label className="floating-label">
                                    <input 
                                        type="number" 
                                        name="experienceYears"
                                        min="0"
                                        className="input w-full input-lg focus:input-primary focus:outline-0" 
                                    />
                                    <span>Experience Years</span>
                                </label>
                            </div>

                            <div className="form-control">
                                <select 
                                    name="department"
                                    required
                                    className="select w-full select-primary focus:outline-0"
                                >
                                    <option value="">Select Department</option>
                                    {departments.map(dept => (
                                        <option key={dept.id} value={dept.id}>{dept.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-control">
                                <label className="floating-label">
                                    <input 
                                        type="number" 
                                        name="consultationFee"
                                        min="0"
                                        className="input w-full input-lg focus:input-primary focus:outline-0" 
                                    />
                                    <span>Consultation Fee</span>
                                </label>
                            </div>

                            <div className="form-control">
                                <label className="floating-label">
                                    <input 
                                        type="text" 
                                        name="chamberName"
                                        className="input w-full input-lg focus:input-primary focus:outline-0" 
                                    />
                                    <span>Chamber Name</span>
                                </label>
                            </div>

                            <div className="form-control col-span-2">
                                <label className="floating-label">
                                    <input 
                                        type="text" 
                                        name="chamberAddress"
                                        className="input w-full input-lg focus:input-primary focus:outline-0" 
                                    />
                                    <span>Chamber Address</span>
                                </label>
                            </div>

                            <div className="form-control col-span-2">
                                <label className="floating-label">
                                    <input 
                                        type="text" 
                                        name="visitingHours"
                                        placeholder="e.g., 10 AM - 2 PM"
                                        className="input w-full input-lg focus:input-primary focus:outline-0" 
                                    />
                                    <span>Visiting Hours</span>
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
                                                const preview = document.getElementById('doctor-picture-preview')
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
                                    id="doctor-picture-preview"
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
                            <th>Specialization</th>
                            <th>Department</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {doctors.map((doctor, i) => (
                            <tr key={doctor.id}>
                                <td>{i + 1}</td>
                                <td>
                                    {doctor.user?.picture || doctor.picture ? (
                                        <div className="avatar">
                                            <div className="w-12 h-12 rounded-full">
                                                <img src={`${baseUrl}/public/${doctor.user?.picture || doctor.picture}`} alt={doctor.name} />
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="avatar placeholder">
                                            <div className="bg-neutral text-neutral-content rounded-full w-12">
                                                <span className="text-xs">{doctor.name.charAt(0)}</span>
                                            </div>
                                        </div>
                                    )}
                                </td>
                                <td>{doctor.name}</td>
                                <td>{doctor.email}</td>
                                <td>{doctor.phone}</td>
                                <td>{doctor.specialization}</td>
                                <td>{doctor.department?.name || 'N/A'}</td>
                                <td>
                                    <button 
                                        onClick={() => openModal(doctor.id)} 
                                        className="btn btn-sm btn-info me-1"
                                    >
                                        <i className="fa-solid fa-pen-to-square"></i>
                                    </button>
                                    <button 
                                        onClick={() => handleDelete(doctor.id)} 
                                        className="btn btn-sm btn-error"
                                    >
                                        <i className="fa-solid fa-trash"></i>
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {doctors.length === 0 && (
                            <tr>
                                <td colSpan="8" className="text-center py-4">No doctors found</td>
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
