"use client"
import AuthLayout from "@/components/authLayout"
import Pagination from "@/components/pagination"
import getToken from "@/lib/getToken"
import { baseUrl } from "@/lib/base_url"
import { useCallback, useEffect, useState, useRef } from "react"
import { useSearchParams } from "next/navigation"

export default function Payment() {
    const [payments, setPayments] = useState([])
    const [bills, setBills] = useState([])
    const [paginationData, setPaginationData] = useState(null)
    const [editingId, setEditingId] = useState(null)
    const [message, setMessage] = useState(null)
    const formRef = useRef(null)
    const searchParams = useSearchParams()
    const page = searchParams.get('page') || 1
    const limit = searchParams.get('limit') || 10

    const getPayments = useCallback(async () => {
        const token = getToken()
        const res = await fetch(`${baseUrl}/api/payments?page=${page}&limit=${limit}`, {
            headers: { "Authorization": "Bearer " + token }
        })
        const { data } = await res.json()
        if (data) {
            setPayments(data.data || [])
            setPaginationData(data) // Store pagination metadata
        }
    }, [page, limit])

    const getBills = useCallback(async () => {
        const token = getToken()
        const res = await fetch(`${baseUrl}/api/bills?limit=100`, {
            headers: { "Authorization": "Bearer " + token }
        })
        const { data } = await res.json()
        if (data) setBills(data.data || [])
    }, [])

    useEffect(() => {
        getPayments()
        getBills()
    }, [getPayments, getBills])

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
        const preview = document.getElementById('payment-picture-preview')
        if (preview) {
            preview.src = ''
            preview.style.display = 'none'
        }
        const currentPreview = document.getElementById('payment-current-picture')
        if (currentPreview && currentPreview.parentElement) {
            currentPreview.parentElement.remove()
        }
        
        if (id) {
            document.getElementById('payment-modal').showModal()
            const token = getToken()
            const res = await fetch(`${baseUrl}/api/payments/${id}`, {
                headers: { "Authorization": "Bearer " + token }
            })
            const { payment } = await res.json()
            if (payment && formRef.current) {
                formRef.current.querySelector('[name="bill"]').value = payment.bill?._id || payment.bill || ''
                formRef.current.querySelector('[name="amountPaid"]').value = payment.amountPaid || 0
                formRef.current.querySelector('[name="paymentDate"]').value = payment.paymentDate ? new Date(payment.paymentDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
                formRef.current.querySelector('[name="method"]').value = payment.method || 'cash'
                
                // Show current picture if exists
                if (payment.picture) {
                    const fileInput = formRef.current.querySelector('[name="picture"]')
                    if (fileInput && fileInput.parentElement) {
                        const div = document.createElement('div')
                        div.className = 'mt-2'
                        div.innerHTML = `<p class="text-xs mb-1">Current Picture:</p>`
                        const img = document.createElement('img')
                        img.id = 'payment-current-picture'
                        img.src = `${baseUrl}/public/${payment.picture}`
                        img.className = 'w-20 h-20 object-cover rounded'
                        img.alt = 'Current'
                        div.appendChild(img)
                        fileInput.parentElement.appendChild(div)
                    }
                }
            }
        } else {
            document.getElementById('payment-modal').showModal()
        }
    }

    const closeModal = () => {
        document.getElementById('payment-modal').close()
        setEditingId(null)
        setMessage(null)
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        const token = getToken()
        const formdata = new FormData(e.currentTarget)
        try {
            const url = editingId ? `${baseUrl}/api/payments/${editingId}` : `${baseUrl}/api/payments`
            const res = await fetch(url, {
                method: editingId ? 'PUT' : 'POST',
                body: formdata,
                headers: { "Authorization": "Bearer " + token }
            })
            const data = await res.json()
            if (res.ok) {
                setMessage(data.success || "Success")
                setTimeout(() => { closeModal(); getPayments() }, 1000)
            } else {
                setMessage(data.message || "Failed")
            }
        } catch (error) {
            setMessage("Error occurred")
        }
    }

    const handleDelete = async (id) => {
        if (!confirm("Delete this payment?")) return
        const token = getToken()
        const res = await fetch(`${baseUrl}/api/payments/${id}`, {
            method: "DELETE",
            headers: { "Authorization": "Bearer " + token }
        })
        if (res.ok) {
            setMessage("Deleted successfully")
            getPayments()
        }
    }

    return (
        <AuthLayout>
            <div className="flex justify-between mb-4">
                <h2 className="text-xl font-bold">Payments</h2>
                <button onClick={() => openModal()} className="btn btn-primary">
                    <i className="fa-solid fa-plus"></i> Add Payment
                </button>
            </div>

            {message && (
                <div className={`alert mb-4 ${message.includes('success') || message.includes('Success') ? 'alert-success' : 'alert-error'}`}>
                    <span>{message}</span>
                </div>
            )}

            <dialog id="payment-modal" className="modal">
                <div className="modal-box max-w-2xl">
                    <button onClick={closeModal} className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
                    <h3 className="font-bold text-lg mb-4">{editingId ? 'Edit Payment' : 'Add Payment'}</h3>
                    <form ref={formRef} onSubmit={handleSubmit} encType="multipart/form-data">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="form-control">
                                <select name="bill" required className="select w-full select-primary focus:outline-0">
                                    <option value="">Select Bill</option>
                                    {bills.map(b => <option key={b.id} value={b.id}>Bill #{b.id} - {b.patient?.name} - {b.totalAmount}</option>)}
                                </select>
                            </div>
                            <div className="form-control">
                                <label className="floating-label">
                                    <input type="number" name="amountPaid" defaultValue="0" min="0" required className="input w-full input-lg focus:input-primary focus:outline-0" />
                                    <span>Amount Paid <span className="text-error">*</span></span>
                                </label>
                            </div>
                            <div className="form-control">
                                <label className="floating-label">
                                    <input type="date" name="paymentDate" defaultValue={new Date().toISOString().split('T')[0]} required className="input w-full input-lg focus:input-primary focus:outline-0" />
                                    <span>Payment Date <span className="text-error">*</span></span>
                                </label>
                            </div>
                            <div className="form-control">
                                <select name="method" defaultValue="cash" required className="select w-full select-primary focus:outline-0">
                                    <option value="cash">Cash</option>
                                    <option value="card">Card</option>
                                    <option value="bkash">bKash</option>
                                    <option value="nagad">Nagad</option>
                                    <option value="rocket">Rocket</option>
                                </select>
                            </div>
                            <div className="form-control col-span-2">
                                <p className="text-sm mb-2">Payment Proof (Optional)</p>
                                <input type="file" name="picture" accept="image/*" className="file-input w-full focus:file-input-primary focus:outline-0" />
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
                            <th>Bill</th>
                            <th>Patient</th>
                            <th>Amount Paid</th>
                            <th>Method</th>
                            <th>Date</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {payments.map((payment, i) => (
                            <tr key={payment.id}>
                                <td>{i + 1}</td>
                                <td>Bill #{payment.bill?._id || payment.bill}</td>
                                <td>{payment.bill?.patient?.name || 'N/A'}</td>
                                <td>{payment.amountPaid}</td>
                                <td>{payment.method}</td>
                                <td>{new Date(payment.paymentDate).toLocaleDateString()}</td>
                                <td>
                                    <button onClick={() => openModal(payment.id)} className="btn btn-sm btn-info me-1"><i className="fa-solid fa-pen-to-square"></i></button>
                                    <button onClick={() => handleDelete(payment.id)} className="btn btn-sm btn-error"><i className="fa-solid fa-trash"></i></button>
                                </td>
                            </tr>
                        ))}
                        {payments.length === 0 && <tr><td colSpan="7" className="text-center py-4">No payments found</td></tr>}
                    </tbody>
                </table>
            </div>
            {paginationData && (
                <Pagination paginationData={paginationData} />
            )}
        </AuthLayout>
    )
}
