"use client"
import AuthLayout from "@/components/authLayout"
import Pagination from "@/components/pagination"
import getToken from "@/lib/getToken"
import { baseUrl } from "@/lib/base_url"
import { useCallback, useEffect, useState, useRef } from "react"
import { useSearchParams } from "next/navigation"

export default function Department() {
    const [departments, setDepartments] = useState([])
    const [paginationData, setPaginationData] = useState(null)
    const [editingId, setEditingId] = useState(null)
    const [message, setMessage] = useState(null)
    const formRef = useRef(null)
    const searchParams = useSearchParams()
    const page = searchParams.get('page') || 1
    const limit = searchParams.get('limit') || 10

    const getDepartment = useCallback(async () => {
        const token = getToken()
        const res = await fetch(`${baseUrl}/api/departments?page=${page}&limit=${limit}`, {
            method: "GET",
            headers: {
                "Authorization": "Bearer " + token
            }
        })
        const { data } = await res.json()
        if (data) {
            setDepartments(data.data || [])
            setPaginationData(data)
        }
    }, [page, limit])

    useEffect(() => {
        getDepartment()
    }, [getDepartment])

    const openModal = async (id = null) => {
        setEditingId(id)
        setMessage(null)
        const modal = document.getElementById('department-store')
        
        // Reset form
        if (formRef.current) {
            formRef.current.reset()
            // Clear file input
            const fileInput = formRef.current.querySelector('[name="picture"]')
            if (fileInput) {
                fileInput.value = ''
            }
            // Remove picture previews
            const preview = document.getElementById('department-picture-preview')
            if (preview) {
                preview.src = ''
                preview.style.display = 'none'
            }
            const currentPreview = document.getElementById('department-current-picture')
            if (currentPreview && currentPreview.parentElement) {
                currentPreview.parentElement.remove()
            }
        }
        
        if (id) {
            // Edit mode - populate form
            modal.setAttribute('open', true)
            const token = getToken()
            const res = await fetch(`${baseUrl}/api/departments/${id}`, {
                method: "GET",
                headers: {
                    "Authorization": "Bearer " + token
                }
            })
            const { department } = await res.json()
            if (department && formRef.current) {
                formRef.current.querySelector('[name="name"]').value = department.name || ''
                formRef.current.querySelector('[name="code"]').value = department.code || ''
                formRef.current.querySelector('[name="description"]').value = department.description || ''
                formRef.current.querySelector('[name="email"]').value = department.email || ''
                formRef.current.querySelector('[name="phone"]').value = department.phone || ''
                formRef.current.querySelector('[name="status"]').value = department.status || 'active'
                
                // Show current picture if exists
                if (department.picture) {
                    const fileInput = formRef.current.querySelector('[name="picture"]')
                    if (fileInput && fileInput.parentElement) {
                        const div = document.createElement('div')
                        div.className = 'mt-2'
                        div.innerHTML = `<p class="text-xs mb-1">Current Picture:</p>`
                        const img = document.createElement('img')
                        img.id = 'department-current-picture'
                        img.src = `${baseUrl}/public/${department.picture}`
                        img.className = 'w-20 h-20 object-cover rounded'
                        img.alt = 'Current'
                        div.appendChild(img)
                        fileInput.parentElement.appendChild(div)
                    }
                }
            }
        } else {
            // Add mode
            modal.setAttribute('open', true)
        }
    }

    const closeModal = () => {
        document.getElementById('department-store').removeAttribute('open')
        setEditingId(null)
        // setMessage(null)
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setMessage(null)
        const token = getToken()
        const formdata = new FormData(e.currentTarget)
        
        try {
            const url = editingId 
                ? `${baseUrl}/api/departments/${editingId}`
                : `${baseUrl}/api/departments`
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
                    getDepartment()
                }, 1000)
            } else {
                setMessage(data.message || "Operation failed")
            }
        } catch (error) {
            setMessage("An error occurred")
        }
    }

    const handleDelete = async (id) => {
        if (!confirm("Are you sure you want to delete this department?")) return
        
        const token = getToken()
        const res = await fetch(`${baseUrl}/api/departments/${id}`, {
            method: "DELETE",
            headers: {
                "Authorization": "Bearer " + token
            }
        })
        const data = await res.json()
        
        if (res.ok) {
            setMessage("Department deleted successfully")
            getDepartment()
        } else {
            setMessage(data.message || "Delete failed")
        }
    }

    return (
        <AuthLayout>
            <div className="flex justify-between mb-4">
                <h2 className="text-xl font-bold">Department</h2>
                <button onClick={() => openModal()} className="btn btn-primary">
                    <i className="fa-solid fa-plus"></i> Add Department
                </button>
            </div>

            {message && (
                <div role="alert" className={`alert mb-4 ${message.includes('success') || message.includes('Success') ? 'alert-success' : 'alert-error'}`}>
                    <span>{message}</span>
                </div>
            )}

            <dialog id="department-store" className="modal">
                <div className="modal-box max-w-3xl">
                    <button onClick={closeModal} className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
                    <h3 className="font-bold text-lg mb-4">
                        {editingId ? 'Edit Department' : 'Add New Department'}
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
                                        name="code" 
                                        required
                                        className="input w-full input-lg focus:input-primary focus:outline-0" 
                                    />
                                    <span>Code <span className="text-error">*</span></span>
                                </label>
                            </div>

                            <div className="col-span-2 form-control">
                                <p className="text-sm mb-2">Picture</p>
                                <input 
                                    type="file" 
                                    name="picture" 
                                    accept="image/*"
                                    onChange={(e) => {
                                        const file = e.target.files[0]
                                        if (file) {
                                            const reader = new FileReader()
                                            reader.onloadend = () => {
                                                const preview = document.getElementById('department-picture-preview')
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
                                    id="department-picture-preview"
                                    src="" 
                                    alt="Preview" 
                                    className="w-20 h-20 object-cover rounded mt-2 hidden"
                                />
                            </div>

                            <div className="col-span-2 form-control">
                                <label className="floating-label">
                                    <textarea 
                                        name="description" 
                                        className="textarea w-full textarea-lg textarea-primary focus:outline-0" 
                                    />
                                    <span>Description</span>
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
                                        className="input w-full input-lg focus:input-primary focus:outline-0" 
                                    />
                                    <span>Phone</span>
                                </label>
                            </div>

                            <div className="form-control">
                                <select 
                                    name="status"
                                    defaultValue="active"
                                    className="select w-full select-primary focus:outline-0"
                                >
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                </select>
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
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {departments.map((department, i) => (
                            <tr key={department.id}>
                                <td>{i + 1}</td>
                                <td>
                                    {department.picture ? (
                                        <div className="avatar">
                                            <div className="w-12 h-12 rounded-full">
                                                <img src={`${baseUrl}/public/${department.picture}`} alt={department.name} />
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="avatar placeholder">
                                            <div className="bg-neutral text-neutral-content rounded-full w-12">
                                                <span className="text-xs">{department.name.charAt(0)}</span>
                                            </div>
                                        </div>
                                    )}
                                </td>
                                <td>{department.name}</td>
                                <td>{department.email}</td>
                                <td>{department.phone}</td>
                                <td>
                                    <button 
                                        onClick={() => openModal(department.id)} 
                                        className="btn btn-sm btn-info me-1"
                                    >
                                        <i className="fa-solid fa-pen-to-square"></i>
                                    </button>
                                    <button 
                                        onClick={() => handleDelete(department.id)} 
                                        className="btn btn-sm btn-error"
                                    >
                                        <i className="fa-solid fa-trash"></i>
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {departments.length === 0 && (
                            <tr>
                                <td colSpan="6" className="text-center py-4">No departments found</td>
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
