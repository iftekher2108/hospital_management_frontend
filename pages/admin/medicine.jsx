"use client"
import AuthLayout from "@/components/authLayout"
import Pagination from "@/components/pagination"
import getToken from "@/lib/getToken"
import { baseUrl } from "@/lib/base_url"
import { useCallback, useEffect, useState, useRef } from "react"
import { useSearchParams } from "next/navigation"

export default function Medicine() {
    const [medicines, setMedicines] = useState([])
    const [paginationData, setPaginationData] = useState(null)
    const [editingId, setEditingId] = useState(null)
    const [message, setMessage] = useState(null)
    const formRef = useRef(null)
    const searchParams = useSearchParams()
    const page = searchParams.get('page') || 1
    const limit = searchParams.get('limit') || 10

    const getMedicines = useCallback(async () => {
        const token = getToken()
        const res = await fetch(`${baseUrl}/api/medicines?page=${page}&limit=${limit}`, {
            headers: { "Authorization": "Bearer " + token }
        })
        const { data } = await res.json()
        if (data) {
            setMedicines(data.data || [])
            setPaginationData(data) // Store pagination metadata
        }
    }, [page, limit])

    useEffect(() => { getMedicines() }, [getMedicines])

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
        const preview = document.getElementById('medicine-picture-preview')
        if (preview) {
            preview.src = ''
            preview.style.display = 'none'
        }
        const currentPreview = document.getElementById('medicine-current-picture')
        if (currentPreview && currentPreview.parentElement) {
            currentPreview.parentElement.remove()
        }
        
        if (id) {
            document.getElementById('medicine-modal').showModal()
            const token = getToken()
            const res = await fetch(`${baseUrl}/api/medicines/${id}`, {
                headers: { "Authorization": "Bearer " + token }
            })
            const { medicine } = await res.json()
            if (medicine && formRef.current) {
                formRef.current.querySelector('[name="name"]').value = medicine.name || ''
                formRef.current.querySelector('[name="genericName"]').value = medicine.genericName || ''
                formRef.current.querySelector('[name="type"]').value = medicine.type || ''
                formRef.current.querySelector('[name="manufacturer"]').value = medicine.manufacturer || ''
                formRef.current.querySelector('[name="batchNumber"]').value = medicine.batchNumber || ''
                formRef.current.querySelector('[name="barcode"]').value = medicine.barcode || ''
                formRef.current.querySelector('[name="description"]').value = medicine.description || ''
                formRef.current.querySelector('[name="unit"]').value = medicine.unit || 'pcs'
                formRef.current.querySelector('[name="quantityInStock"]').value = medicine.quantityInStock || 0
                formRef.current.querySelector('[name="minStockLevel"]').value = medicine.minStockLevel || 10
                formRef.current.querySelector('[name="price"]').value = medicine.price || 0
                formRef.current.querySelector('[name="discount"]').value = medicine.discount || 0
                formRef.current.querySelector('[name="tax"]').value = medicine.tax || 0
                formRef.current.querySelector('[name="manufacturedDate"]').value = medicine.manufacturedDate ? new Date(medicine.manufacturedDate).toISOString().split('T')[0] : ''
                formRef.current.querySelector('[name="expiryDate"]').value = medicine.expiryDate ? new Date(medicine.expiryDate).toISOString().split('T')[0] : ''
                formRef.current.querySelector('[name="requiresPrescription"]').checked = medicine.requiresPrescription || false
                formRef.current.querySelector('[name="supplier"]').value = medicine.supplier || ''
                formRef.current.querySelector('[name="status"]').value = medicine.status || 'available'
                
                // Show current picture if exists
                if (medicine.picture) {
                    const fileInput = formRef.current.querySelector('[name="picture"]')
                    if (fileInput && fileInput.parentElement) {
                        const div = document.createElement('div')
                        div.className = 'mt-2'
                        div.innerHTML = `<p class="text-xs mb-1">Current Picture:</p>`
                        const img = document.createElement('img')
                        img.id = 'medicine-current-picture'
                        img.src = `${baseUrl}/public/${medicine.picture}`
                        img.className = 'w-20 h-20 object-cover rounded'
                        img.alt = 'Current'
                        div.appendChild(img)
                        fileInput.parentElement.appendChild(div)
                    }
                }
            }
        } else {
            document.getElementById('medicine-modal').showModal()
        }
    }

    const closeModal = () => {
        document.getElementById('medicine-modal').close()
        setEditingId(null)
        setMessage(null)
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        const token = getToken()
        const formdata = new FormData(e.currentTarget)
        try {
            const url = editingId ? `${baseUrl}/api/medicines/${editingId}` : `${baseUrl}/api/medicines`
            const res = await fetch(url, {
                method: editingId ? 'PUT' : 'POST',
                body: formdata,
                headers: { "Authorization": "Bearer " + token }
            })
            const data = await res.json()
            if (res.ok) {
                setMessage(data.success || "Success")
                setTimeout(() => { closeModal(); getMedicines() }, 1000)
            } else {
                setMessage(data.message || "Failed")
            }
        } catch (error) {
            setMessage("Error occurred")
        }
    }

    const handleDelete = async (id) => {
        if (!confirm("Delete this medicine?")) return
        const token = getToken()
        const res = await fetch(`${baseUrl}/api/medicines/${id}`, {
            method: "DELETE",
            headers: { "Authorization": "Bearer " + token }
        })
        if (res.ok) {
            setMessage("Deleted successfully")
            getMedicines()
        }
    }

    return (
        <AuthLayout>
            <div className="flex justify-between mb-4">
                <h2 className="text-xl font-bold">Medicines</h2>
                <button onClick={() => openModal()} className="btn btn-primary">
                    <i className="fa-solid fa-plus"></i> Add Medicine
                </button>
            </div>

            {message && (
                <div className={`alert mb-4 ${message.includes('success') || message.includes('Success') ? 'alert-success' : 'alert-error'}`}>
                    <span>{message}</span>
                </div>
            )}

            <dialog id="medicine-modal" className="modal">
                <div className="modal-box max-w-5xl max-h-[90vh] overflow-y-auto">
                    <button onClick={closeModal} className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
                    <h3 className="font-bold text-lg mb-4">{editingId ? 'Edit Medicine' : 'Add Medicine'}</h3>
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
                                    <input type="text" name="genericName" className="input w-full input-lg focus:input-primary focus:outline-0" />
                                    <span>Generic Name</span>
                                </label>
                            </div>
                            <div className="form-control">
                                <select name="type" required className="select w-full select-primary focus:outline-0">
                                    <option value="">Select Type</option>
                                    <option value="Tablet">Tablet</option>
                                    <option value="Syrup">Syrup</option>
                                    <option value="Injection">Injection</option>
                                    <option value="Capsule">Capsule</option>
                                    <option value="Cream">Cream</option>
                                </select>
                            </div>
                            <div className="form-control">
                                <label className="floating-label">
                                    <input type="text" name="manufacturer" required className="input w-full input-lg focus:input-primary focus:outline-0" />
                                    <span>Manufacturer <span className="text-error">*</span></span>
                                </label>
                            </div>
                            <div className="form-control">
                                <label className="floating-label">
                                    <input type="text" name="batchNumber" className="input w-full input-lg focus:input-primary focus:outline-0" />
                                    <span>Batch Number</span>
                                </label>
                            </div>
                            <div className="form-control">
                                <label className="floating-label">
                                    <input type="text" name="barcode" className="input w-full input-lg focus:input-primary focus:outline-0" />
                                    <span>Barcode</span>
                                </label>
                            </div>
                            <div className="form-control">
                                <label className="floating-label">
                                    <input type="text" name="unit" defaultValue="pcs" className="input w-full input-lg focus:input-primary focus:outline-0" />
                                    <span>Unit</span>
                                </label>
                            </div>
                            <div className="form-control">
                                <label className="floating-label">
                                    <input type="number" name="quantityInStock" defaultValue="0" min="0" className="input w-full input-lg focus:input-primary focus:outline-0" />
                                    <span>Quantity in Stock</span>
                                </label>
                            </div>
                            <div className="form-control">
                                <label className="floating-label">
                                    <input type="number" name="minStockLevel" defaultValue="10" min="0" className="input w-full input-lg focus:input-primary focus:outline-0" />
                                    <span>Min Stock Level</span>
                                </label>
                            </div>
                            <div className="form-control">
                                <label className="floating-label">
                                    <input type="number" name="price" defaultValue="0" min="0" className="input w-full input-lg focus:input-primary focus:outline-0" />
                                    <span>Price</span>
                                </label>
                            </div>
                            <div className="form-control">
                                <label className="floating-label">
                                    <input type="number" name="discount" defaultValue="0" min="0" className="input w-full input-lg focus:input-primary focus:outline-0" />
                                    <span>Discount</span>
                                </label>
                            </div>
                            <div className="form-control">
                                <label className="floating-label">
                                    <input type="number" name="tax" defaultValue="0" min="0" className="input w-full input-lg focus:input-primary focus:outline-0" />
                                    <span>Tax</span>
                                </label>
                            </div>
                            <div className="form-control">
                                <label className="floating-label">
                                    <input type="date" name="manufacturedDate" className="input w-full input-lg focus:input-primary focus:outline-0" />
                                    <span>Manufactured Date</span>
                                </label>
                            </div>
                            <div className="form-control">
                                <label className="floating-label">
                                    <input type="date" name="expiryDate" className="input w-full input-lg focus:input-primary focus:outline-0" />
                                    <span>Expiry Date</span>
                                </label>
                            </div>
                            <div className="form-control">
                                <label className="floating-label">
                                    <input type="text" name="supplier" className="input w-full input-lg focus:input-primary focus:outline-0" />
                                    <span>Supplier</span>
                                </label>
                            </div>
                            <div className="form-control">
                                <select name="status" defaultValue="available" className="select w-full select-primary focus:outline-0">
                                    <option value="available">Available</option>
                                    <option value="out-of-stock">Out of Stock</option>
                                    <option value="expired">Expired</option>
                                </select>
                            </div>
                            <div className="form-control col-span-2">
                                <label className="floating-label">
                                    <textarea name="description" className="textarea w-full textarea-lg textarea-primary focus:outline-0" />
                                    <span>Description</span>
                                </label>
                            </div>
                            <div className="form-control col-span-2">
                                <label className="label cursor-pointer">
                                    <span className="label-text">Requires Prescription</span>
                                    <input type="checkbox" name="requiresPrescription" className="checkbox checkbox-primary" />
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
                                                const preview = document.getElementById('medicine-picture-preview')
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
                                            id="medicine-current-picture"
                                            src={`${baseUrl}/public/${formData.picture}`} 
                                            alt="Current" 
                                            className="w-20 h-20 object-cover rounded"
                                        />
                                    </div>
                                )}
                                <img 
                                    id="medicine-picture-preview"
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
                            <th>Type</th>
                            <th>Manufacturer</th>
                            <th>Stock</th>
                            <th>Price</th>
                            <th>Status</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {medicines.map((medicine, i) => (
                            <tr key={medicine.id}>
                                <td>{i + 1}</td>
                                <td>
                                    {medicine.picture ? (
                                        <div className="avatar">
                                            <div className="w-12 h-12 rounded">
                                                <img src={`${baseUrl}/public/${medicine.picture}`} alt={medicine.name} />
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="avatar placeholder">
                                            <div className="bg-neutral text-neutral-content rounded w-12">
                                                <span className="text-xs">M</span>
                                            </div>
                                        </div>
                                    )}
                                </td>
                                <td>{medicine.name}</td>
                                <td>{medicine.type}</td>
                                <td>{medicine.manufacturer}</td>
                                <td>{medicine.quantityInStock}</td>
                                <td>{medicine.price}</td>
                                <td><span className={`badge ${medicine.status === 'available' ? 'badge-success' : 'badge-error'}`}>{medicine.status}</span></td>
                                <td>
                                    <button onClick={() => openModal(medicine.id)} className="btn btn-sm btn-info me-1"><i className="fa-solid fa-pen-to-square"></i></button>
                                    <button onClick={() => handleDelete(medicine.id)} className="btn btn-sm btn-error"><i className="fa-solid fa-trash"></i></button>
                                </td>
                            </tr>
                        ))}
                        {medicines.length === 0 && <tr><td colSpan="9" className="text-center py-4">No medicines found</td></tr>}
                    </tbody>
                </table>
            </div>
            {paginationData && (
                <Pagination paginationData={paginationData} />
            )}
        </AuthLayout>
    )
}
