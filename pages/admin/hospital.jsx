"use client"
import AuthLayout from "@/components/authLayout"
import Pagination from "@/components/pagination"
import getToken from "@/lib/getToken"
import { baseUrl } from "@/lib/base_url"
import { useCallback, useEffect, useState, useRef } from "react"
import { useSearchParams } from "next/navigation"

export default function Hospital() {
    const [hospitals, setHospitals] = useState([])
    const [paginationData, setPaginationData] = useState(null)
    const [editingId, setEditingId] = useState(null)
    const [message, setMessage] = useState(null)
    const formRef = useRef(null)
    const searchParams = useSearchParams()
    const page = searchParams.get('page') || 1
    const limit = searchParams.get('limit') || 10

    const getHospitals = useCallback(async () => {
        const token = getToken()
        const res = await fetch(`${baseUrl}/api/hospitals?page=${page}&limit=${limit}`, {
            headers: { "Authorization": "Bearer " + token }
        })
        const { data } = await res.json()
        if (data) {
            setHospitals(data.data || [])
            setPaginationData(data) // Store pagination metadata
        }
    }, [page, limit])

    useEffect(() => { getHospitals() }, [getHospitals])

    const openModal = async (id = null) => {
        setEditingId(id)
        setMessage(null)
        
        // Reset form and previews
        if (formRef.current) {
            formRef.current.reset()
            // Clear file input
            const fileInput = formRef.current.querySelector('[name="picture"]')
            if (fileInput) {
                fileInput.value = ''
            }
        }
        const preview = document.getElementById('hospital-picture-preview')
        if (preview) {
            preview.src = ''
            preview.style.display = 'none'
        }
        const currentPreview = document.getElementById('hospital-current-picture')
        if (currentPreview && currentPreview.parentElement) {
            currentPreview.parentElement.remove()
        }
        
        if (id) {
            document.getElementById('hospital-modal').showModal()
            const token = getToken()
            const res = await fetch(`${baseUrl}/api/hospitals/${id}`, {
                headers: { "Authorization": "Bearer " + token }
            })
            const { hospital } = await res.json()
            if (hospital && formRef.current) {
                formRef.current.querySelector('[name="name"]').value = hospital.name || ''
                formRef.current.querySelector('[name="address"]').value = hospital.address || ''
                formRef.current.querySelector('[name="city"]').value = hospital.city || ''
                formRef.current.querySelector('[name="state"]').value = hospital.state || ''
                formRef.current.querySelector('[name="country"]').value = hospital.country || 'Bangladesh'
                formRef.current.querySelector('[name="phone"]').value = hospital.phone || ''
                formRef.current.querySelector('[name="email"]').value = hospital.email || ''
                formRef.current.querySelector('[name="website"]').value = hospital.website || ''
                formRef.current.querySelector('[name="description"]').value = hospital.description || ''
                
                // Show current picture if exists
                if (hospital.picture) {
                    const fileInput = formRef.current.querySelector('[name="picture"]')
                    if (fileInput && fileInput.parentElement) {
                        const div = document.createElement('div')
                        div.className = 'mt-2'
                        div.innerHTML = `<p class="text-xs mb-1">Current Picture:</p>`
                        const img = document.createElement('img')
                        img.id = 'hospital-current-picture'
                        img.src = `${baseUrl}/public/${hospital.picture}`
                        img.className = 'w-20 h-20 object-cover rounded'
                        img.alt = 'Current'
                        div.appendChild(img)
                        fileInput.parentElement.appendChild(div)
                    }
                }
            }
        } else {
            document.getElementById('hospital-modal').showModal()
        }
    }

    const closeModal = () => {
        document.getElementById('hospital-modal').close()
        setEditingId(null)
        setMessage(null)
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        const token = getToken()
        const formdata = new FormData(e.currentTarget)
        try {
            const url = editingId ? `${baseUrl}/api/hospitals/${editingId}` : `${baseUrl}/api/hospitals`
            const res = await fetch(url, {
                method: editingId ? 'PUT' : 'POST',
                body: formdata,
                headers: { "Authorization": "Bearer " + token }
            })
            const data = await res.json()
            if (res.ok) {
                setMessage(data.success || "Success")
                setTimeout(() => { closeModal(); getHospitals() }, 1000)
            } else {
                setMessage(data.message || "Failed")
            }
        } catch (error) {
            setMessage("Error occurred")
        }
    }

    const handleDelete = async (id) => {
        if (!confirm("Delete this hospital?")) return
        const token = getToken()
        const res = await fetch(`${baseUrl}/api/hospitals/${id}`, {
            method: "DELETE",
            headers: { "Authorization": "Bearer " + token }
        })
        if (res.ok) {
            setMessage("Deleted successfully")
            getHospitals()
        }
    }

    return (
        <AuthLayout>
            <div className="flex justify-between mb-4">
                <h2 className="text-xl font-bold">Hospitals</h2>
                <button onClick={() => openModal()} className="btn btn-primary">
                    <i className="fa-solid fa-plus"></i> Add Hospital
                </button>
            </div>

            {message && (
                <div className={`alert mb-4 ${message.includes('success') || message.includes('Success') ? 'alert-success' : 'alert-error'}`}>
                    <span>{message}</span>
                </div>
            )}

            <dialog id="hospital-modal" className="modal">
                <div className="modal-box max-w-4xl max-h-[90vh] overflow-y-auto">
                    <button onClick={closeModal} className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
                    <h3 className="font-bold text-lg mb-4">{editingId ? 'Edit Hospital' : 'Add Hospital'}</h3>
                    <form ref={formRef} onSubmit={handleSubmit} encType="multipart/form-data">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="form-control">
                                <label className="floating-label">
                                    <input type="text" name="name" required className="input w-full input-lg focus:input-primary focus:outline-0" />
                                    <span>Name <span className="text-error">*</span></span>
                                </label>
                            </div>
                            <div className="form-control">
                                <label className="floating-label">
                                    <input type="email" name="email" required className="input w-full input-lg focus:input-primary focus:outline-0" />
                                    <span>Email <span className="text-error">*</span></span>
                                </label>
                            </div>
                            <div className="form-control col-span-2">
                                <label className="floating-label">
                                    <input type="text" name="address" required className="input w-full input-lg focus:input-primary focus:outline-0" />
                                    <span>Address <span className="text-error">*</span></span>
                                </label>
                            </div>
                            <div className="form-control">
                                <label className="floating-label">
                                    <input type="text" name="city" required className="input w-full input-lg focus:input-primary focus:outline-0" />
                                    <span>City <span className="text-error">*</span></span>
                                </label>
                            </div>
                            <div className="form-control">
                                <label className="floating-label">
                                    <input type="text" name="state" className="input w-full input-lg focus:input-primary focus:outline-0" />
                                    <span>State</span>
                                </label>
                            </div>
                            <div className="form-control">
                                <label className="floating-label">
                                    <input type="text" name="country" defaultValue="Bangladesh" className="input w-full input-lg focus:input-primary focus:outline-0" />
                                    <span>Country</span>
                                </label>
                            </div>
                            <div className="form-control">
                                <label className="floating-label">
                                    <input type="text" name="phone" className="input w-full input-lg focus:input-primary focus:outline-0" />
                                    <span>Phone</span>
                                </label>
                            </div>
                            <div className="form-control">
                                <label className="floating-label">
                                    <input type="url" name="website" className="input w-full input-lg focus:input-primary focus:outline-0" />
                                    <span>Website</span>
                                </label>
                            </div>
                            <div className="form-control col-span-2">
                                <label className="floating-label">
                                    <textarea name="description" className="textarea w-full textarea-lg textarea-primary focus:outline-0" />
                                    <span>Description</span>
                                </label>
                            </div>
                            <div className="form-control col-span-2">
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
                                                const preview = document.getElementById('hospital-picture-preview')
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
                                {editingId && formData.picture && (
                                    <div className="mt-2">
                                        <p className="text-xs mb-1">Current Picture:</p>
                                        <img 
                                            id="hospital-current-picture"
                                            src={`${baseUrl}/public/${formData.picture}`} 
                                            alt="Current" 
                                            className="w-20 h-20 object-cover rounded"
                                        />
                                    </div>
                                )}
                                <img 
                                    id="hospital-picture-preview"
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
                            <th>City</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {hospitals.map((hospital, i) => (
                            <tr key={hospital.id}>
                                <td>{i + 1}</td>
                                <td>
                                    {hospital.picture ? (
                                        <div className="avatar">
                                            <div className="w-12 h-12 rounded">
                                                <img src={`${baseUrl}/public/${hospital.picture}`} alt={hospital.name} />
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="avatar placeholder">
                                            <div className="bg-neutral text-neutral-content rounded w-12">
                                                <span className="text-xs">{hospital.name.charAt(0)}</span>
                                            </div>
                                        </div>
                                    )}
                                </td>
                                <td>{hospital.name}</td>
                                <td>{hospital.email}</td>
                                <td>{hospital.phone || 'N/A'}</td>
                                <td>{hospital.city}</td>
                                <td>
                                    <button onClick={() => openModal(hospital.id)} className="btn btn-sm btn-info me-1"><i className="fa-solid fa-pen-to-square"></i></button>
                                    <button onClick={() => handleDelete(hospital.id)} className="btn btn-sm btn-error"><i className="fa-solid fa-trash"></i></button>
                                </td>
                            </tr>
                        ))}
                        {hospitals.length === 0 && <tr><td colSpan="7" className="text-center py-4">No hospitals found</td></tr>}
                    </tbody>
                </table>
            </div>
            {paginationData && (
                <Pagination paginationData={paginationData} />
            )}
        </AuthLayout>
    )
}
