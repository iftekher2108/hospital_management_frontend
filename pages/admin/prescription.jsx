"use client"
import AuthLayout from "@/components/authLayout"
import Pagination from "@/components/pagination"
import getToken from "@/lib/getToken"
import { baseUrl } from "@/lib/base_url"
import { useCallback, useEffect, useState, useRef } from "react"
import { useSearchParams } from "next/navigation"

export default function Prescription() {
    const [prescriptions, setPrescriptions] = useState([])
    const [appointments, setAppointments] = useState([])
    const [doctors, setDoctors] = useState([])
    const [patients, setPatients] = useState([])
    const [medicines, setMedicines] = useState([])
    const [paginationData, setPaginationData] = useState(null)
    const [editingId, setEditingId] = useState(null)
    const [message, setMessage] = useState(null)
    const formRef = useRef(null)
    const searchParams = useSearchParams()
    const page = searchParams.get('page') || 1
    const limit = searchParams.get('limit') || 10

    const getPrescriptions = useCallback(async () => {
        const token = getToken()
        const res = await fetch(`${baseUrl}/api/prescriptions?page=${page}&limit=${limit}`, {
            headers: { "Authorization": "Bearer " + token }
        })
        const { data } = await res.json()
        if (data) {
            setPrescriptions(data.data || [])
            setPaginationData(data) // Store pagination metadata
        }
    }, [page, limit])

    const getAppointments = useCallback(async () => {
        const token = getToken()
        const res = await fetch(`${baseUrl}/api/appointments?limit=100`, {
            headers: { "Authorization": "Bearer " + token }
        })
        const { data } = await res.json()
        if (data) setAppointments(data.data || [])
    }, [])

    const getDoctors = useCallback(async () => {
        const token = getToken()
        const res = await fetch(`${baseUrl}/api/doctors?limit=100`, {
            headers: { "Authorization": "Bearer " + token }
        })
        const { data } = await res.json()
        if (data) setDoctors(data.data || [])
    }, [])

    const getPatients = useCallback(async () => {
        const token = getToken()
        const res = await fetch(`${baseUrl}/api/patients?limit=100`, {
            headers: { "Authorization": "Bearer " + token }
        })
        const { data } = await res.json()
        if (data) setPatients(data.data || [])
    }, [])

    const getMedicines = useCallback(async () => {
        const token = getToken()
        const res = await fetch(`${baseUrl}/api/medicines?limit=100`, {
            headers: { "Authorization": "Bearer " + token }
        })
        const { data } = await res.json()
        if (data) setMedicines(data.data || [])
    }, [])

    useEffect(() => {
        getPrescriptions()
        getAppointments()
        getDoctors()
        getPatients()
        getMedicines()
    }, [getPrescriptions, getAppointments, getDoctors, getPatients, getMedicines])

    const openModal = async (id = null) => {
        setEditingId(id)
        setMessage(null)
        
        // Reset form
        if (formRef.current) {
            formRef.current.reset()
        }
        
        if (id) {
            document.getElementById('prescription-modal').showModal()
            const token = getToken()
            const res = await fetch(`${baseUrl}/api/prescriptions/${id}`, {
                headers: { "Authorization": "Bearer " + token }
            })
            const { prescription } = await res.json()
            if (prescription && formRef.current) {
                formRef.current.querySelector('[name="appointment"]').value = prescription.appointment?._id || prescription.appointment || ''
                formRef.current.querySelector('[name="doctor"]').value = prescription.doctor?._id || prescription.doctor || ''
                formRef.current.querySelector('[name="patient"]').value = prescription.patient?._id || prescription.patient || ''
                formRef.current.querySelector('[name="diagnosis"]').value = prescription.diagnosis || ''
                formRef.current.querySelector('[name="symptoms"]').value = Array.isArray(prescription.symptoms) ? prescription.symptoms.join(', ') : ''
                formRef.current.querySelector('[name="notes"]').value = prescription.notes || ''
                formRef.current.querySelector('[name="followUpDate"]').value = prescription.followUpDate ? new Date(prescription.followUpDate).toISOString().split('T')[0] : ''
            }
        } else {
            document.getElementById('prescription-modal').showModal()
        }
    }

    const closeModal = () => {
        document.getElementById('prescription-modal').close()
        setEditingId(null)
        setMessage(null)
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        const token = getToken()
        const form = e.currentTarget
        const symptomsValue = form.querySelector('[name="symptoms"]').value
        const payload = {
            appointment: form.querySelector('[name="appointment"]').value,
            doctor: form.querySelector('[name="doctor"]').value,
            patient: form.querySelector('[name="patient"]').value,
            diagnosis: form.querySelector('[name="diagnosis"]').value,
            symptoms: symptomsValue ? symptomsValue.split(',').map(s => s.trim()).filter(s => s) : [],
            notes: form.querySelector('[name="notes"]').value,
            followUpDate: form.querySelector('[name="followUpDate"]').value || null
        }
        try {
            const url = editingId ? `${baseUrl}/api/prescriptions/${editingId}` : `${baseUrl}/api/prescriptions`
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
                setTimeout(() => { closeModal(); getPrescriptions() }, 1000)
            } else {
                setMessage(data.message || "Failed")
            }
        } catch (error) {
            setMessage("Error occurred")
        }
    }

    const handleDelete = async (id) => {
        if (!confirm("Delete this prescription?")) return
        const token = getToken()
        const res = await fetch(`${baseUrl}/api/prescriptions/${id}`, {
            method: "DELETE",
            headers: { "Authorization": "Bearer " + token }
        })
        if (res.ok) {
            setMessage("Deleted successfully")
            getPrescriptions()
        }
    }

    return (
        <AuthLayout>
            <div className="flex justify-between mb-4">
                <h2 className="text-xl font-bold">Prescriptions</h2>
                <button onClick={() => openModal()} className="btn btn-primary">
                    <i className="fa-solid fa-plus"></i> Add Prescription
                </button>
            </div>

            {message && (
                <div className={`alert mb-4 ${message.includes('success') || message.includes('Success') ? 'alert-success' : 'alert-error'}`}>
                    <span>{message}</span>
                </div>
            )}

            <dialog id="prescription-modal" className="modal">
                <div className="modal-box max-w-4xl max-h-[90vh] overflow-y-auto">
                    <button onClick={closeModal} className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
                    <h3 className="font-bold text-lg mb-4">{editingId ? 'Edit Prescription' : 'Add Prescription'}</h3>
                    <form ref={formRef} onSubmit={handleSubmit}>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="form-control">
                                <select name="appointment" required className="select w-full select-primary focus:outline-0">
                                    <option value="">Select Appointment</option>
                                    {appointments.map(a => <option key={a.id} value={a.id}>{a.patient?.name} - {new Date(a.appointmentDate).toLocaleDateString()}</option>)}
                                </select>
                            </div>
                            <div className="form-control">
                                <select name="doctor" required className="select w-full select-primary focus:outline-0">
                                    <option value="">Select Doctor</option>
                                    {doctors.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                                </select>
                            </div>
                            <div className="form-control">
                                <select name="patient" required className="select w-full select-primary focus:outline-0">
                                    <option value="">Select Patient</option>
                                    {patients.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                </select>
                            </div>
                            <div className="form-control">
                                <label className="floating-label">
                                    <input type="date" name="followUpDate" className="input w-full input-lg focus:input-primary focus:outline-0" />
                                    <span>Follow Up Date</span>
                                </label>
                            </div>
                            <div className="form-control col-span-2">
                                <label className="floating-label">
                                    <input type="text" name="diagnosis" required className="input w-full input-lg focus:input-primary focus:outline-0" />
                                    <span>Diagnosis <span className="text-error">*</span></span>
                                </label>
                            </div>
                            <div className="form-control col-span-2">
                                <label className="floating-label">
                                    <input type="text" name="symptoms" placeholder="Comma separated" className="input w-full input-lg focus:input-primary focus:outline-0" />
                                    <span>Symptoms (comma separated)</span>
                                </label>
                            </div>
                            <div className="form-control col-span-2">
                                <label className="floating-label">
                                    <textarea name="notes" className="textarea w-full textarea-lg textarea-primary focus:outline-0" />
                                    <span>Notes</span>
                                </label>
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
                            <th>Doctor</th>
                            <th>Diagnosis</th>
                            <th>Date</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {prescriptions.map((prescription, i) => (
                            <tr key={prescription.id}>
                                <td>{i + 1}</td>
                                <td>{prescription.patient?.name || 'N/A'}</td>
                                <td>{prescription.doctor?.name || 'N/A'}</td>
                                <td>{prescription.diagnosis}</td>
                                <td>{new Date(prescription.createdAt).toLocaleDateString()}</td>
                                <td>
                                    <button onClick={() => openModal(prescription.id)} className="btn btn-sm btn-info me-1"><i className="fa-solid fa-pen-to-square"></i></button>
                                    <button onClick={() => handleDelete(prescription.id)} className="btn btn-sm btn-error"><i className="fa-solid fa-trash"></i></button>
                                </td>
                            </tr>
                        ))}
                        {prescriptions.length === 0 && <tr><td colSpan="6" className="text-center py-4">No prescriptions found</td></tr>}
                    </tbody>
                </table>
            </div>
            {paginationData && (
                <Pagination paginationData={paginationData} />
            )}
        </AuthLayout>
    )
}
