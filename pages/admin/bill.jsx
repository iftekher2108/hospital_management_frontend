"use client"
import AuthLayout from "@/components/authLayout"
import Pagination from "@/components/pagination"
import getToken from "@/lib/getToken"
import { baseUrl } from "@/lib/base_url"
import { useCallback, useEffect, useState, useRef } from "react"
import { useSearchParams } from "next/navigation"

export default function Bill() {
    const [bills, setBills] = useState([])
    const [patients, setPatients] = useState([])
    const [appointments, setAppointments] = useState([])
    const [paginationData, setPaginationData] = useState(null)
    const [editingId, setEditingId] = useState(null)
    const [message, setMessage] = useState(null)
    const formRef = useRef(null)
    const searchParams = useSearchParams()
    const page = searchParams.get('page') || 1
    const limit = searchParams.get('limit') || 10

    const getBills = useCallback(async () => {
        const token = getToken()
        const res = await fetch(`${baseUrl}/api/bills?page=${page}&limit=${limit}`, {
            headers: { "Authorization": "Bearer " + token }
        })
        const { data } = await res.json()
        if (data) {
            setBills(data.data || [])
            setPaginationData(data) // Store pagination metadata
        }
    }, [page, limit])

    const getPatients = useCallback(async () => {
        const token = getToken()
        const res = await fetch(`${baseUrl}/api/patients?limit=100`, {
            headers: { "Authorization": "Bearer " + token }
        })
        const { data } = await res.json()
        if (data) setPatients(data.data || [])
    }, [])

    const getAppointments = useCallback(async () => {
        const token = getToken()
        const res = await fetch(`${baseUrl}/api/appointments?limit=100`, {
            headers: { "Authorization": "Bearer " + token }
        })
        const { data } = await res.json()
        if (data) setAppointments(data.data || [])
    }, [])

    useEffect(() => {
        getBills()
        getPatients()
        getAppointments()
    }, [getBills, getPatients, getAppointments])

    const openModal = async (id = null) => {
        setEditingId(id)
        setMessage(null)
        
        // Reset form
        if (formRef.current) {
            formRef.current.reset()
        }
        
        if (id) {
            document.getElementById('bill-modal').showModal()
            const token = getToken()
            const res = await fetch(`${baseUrl}/api/bills/${id}`, {
                headers: { "Authorization": "Bearer " + token }
            })
            const { bill } = await res.json()
            if (bill && formRef.current) {
                formRef.current.querySelector('[name="patient"]').value = bill.patient?._id || bill.patient || ''
                formRef.current.querySelector('[name="appointment"]').value = bill.appointment?._id || bill.appointment || ''
                formRef.current.querySelector('[name="totalAmount"]').value = bill.totalAmount || 0
                formRef.current.querySelector('[name="status"]').value = bill.status || 'unpaid'
            }
        } else {
            document.getElementById('bill-modal').showModal()
        }
    }

    const closeModal = () => {
        document.getElementById('bill-modal').close()
        setEditingId(null)
        setMessage(null)
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        const token = getToken()
        const form = e.currentTarget
        const payload = {
            patient: form.querySelector('[name="patient"]').value,
            appointment: form.querySelector('[name="appointment"]').value,
            totalAmount: Number(form.querySelector('[name="totalAmount"]').value) || 0,
            status: form.querySelector('[name="status"]').value
        }
        try {
            const url = editingId ? `${baseUrl}/api/bills/${editingId}` : `${baseUrl}/api/bills`
            const res = await fetch(url, {
                method: editingId ? 'PUT' : 'POST',
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + token
                },
                body: JSON.stringify(payload)
            })
            const data = await res.json()
            if (res.ok) {
                setMessage(data.success || "Success")
                setTimeout(() => { closeModal(); getBills() }, 1000)
            } else {
                setMessage(data.message || "Failed")
            }
        } catch (error) {
            setMessage("Error occurred")
        }
    }

    const handleDelete = async (id) => {
        if (!confirm("Delete this bill?")) return
        const token = getToken()
        const res = await fetch(`${baseUrl}/api/bills/${id}`, {
            method: "DELETE",
            headers: { "Authorization": "Bearer " + token }
        })
        if (res.ok) {
            setMessage("Deleted successfully")
            getBills()
        }
    }

    return (
        <AuthLayout>
            <div className="flex justify-between mb-4">
                <h2 className="text-xl font-bold">Bills</h2>
                <button onClick={() => openModal()} className="btn btn-primary">
                    <i className="fa-solid fa-plus"></i> Add Bill
                </button>
            </div>

            {message && (
                <div className={`alert mb-4 ${message.includes('success') || message.includes('Success') ? 'alert-success' : 'alert-error'}`}>
                    <span>{message}</span>
                </div>
            )}

            <dialog id="bill-modal" className="modal">
                <div className="modal-box max-w-2xl">
                    <button onClick={closeModal} className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
                    <h3 className="font-bold text-lg mb-4">{editingId ? 'Edit Bill' : 'Add Bill'}</h3>
                    <form ref={formRef} onSubmit={handleSubmit}>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="form-control">
                                <select name="patient" required className="select w-full select-primary focus:outline-0">
                                    <option value="">Select Patient</option>
                                    {patients.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                </select>
                            </div>
                            <div className="form-control">
                                <select name="appointment" required className="select w-full select-primary focus:outline-0">
                                    <option value="">Select Appointment</option>
                                    {appointments.map(a => <option key={a.id} value={a.id}>{a.patient?.name} - {new Date(a.appointmentDate).toLocaleDateString()}</option>)}
                                </select>
                            </div>
                            <div className="form-control">
                                <label className="floating-label">
                                    <input type="number" name="totalAmount" defaultValue="0" min="0" required className="input w-full input-lg focus:input-primary focus:outline-0" />
                                    <span>Total Amount <span className="text-error">*</span></span>
                                </label>
                            </div>
                            <div className="form-control">
                                <select name="status" defaultValue="unpaid" className="select w-full select-primary focus:outline-0">
                                    <option value="unpaid">Unpaid</option>
                                    <option value="paid">Paid</option>
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
                            <th>Patient</th>
                            <th>Appointment</th>
                            <th>Total Amount</th>
                            <th>Status</th>
                            <th>Created</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {bills.map((bill, i) => (
                            <tr key={bill.id}>
                                <td>{i + 1}</td>
                                <td>{bill.patient?.name || 'N/A'}</td>
                                <td>{bill.appointment ? new Date(bill.appointment.appointmentDate).toLocaleDateString() : 'N/A'}</td>
                                <td>{bill.totalAmount}</td>
                                <td><span className={`badge ${bill.status === 'paid' ? 'badge-success' : 'badge-error'}`}>{bill.status}</span></td>
                                <td>{new Date(bill.createdAt).toLocaleDateString()}</td>
                                <td>
                                    <button onClick={() => openModal(bill.id)} className="btn btn-sm btn-info me-1"><i className="fa-solid fa-pen-to-square"></i></button>
                                    <button onClick={() => handleDelete(bill.id)} className="btn btn-sm btn-error"><i className="fa-solid fa-trash"></i></button>
                                </td>
                            </tr>
                        ))}
                        {bills.length === 0 && <tr><td colSpan="7" className="text-center py-4">No bills found</td></tr>}
                    </tbody>
                </table>
            </div>
            {paginationData && (
                <Pagination paginationData={paginationData} />
            )}
        </AuthLayout>
    )
}
