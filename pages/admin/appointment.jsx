"use client"
import AuthLayout from "@/components/authLayout"
import Pagination from "@/components/pagination"
import getToken from "@/lib/getToken"
import { baseUrl } from "@/lib/base_url"
import { useCallback, useEffect, useState, useRef } from "react"
import { useSearchParams } from "next/navigation"

export default function Appointment() {
    const [appointments, setAppointments] = useState([])
    const [patients, setPatients] = useState([])
    const [doctors, setDoctors] = useState([])
    const [departments, setDepartments] = useState([])
    const [paginationData, setPaginationData] = useState(null)
    const [editingId, setEditingId] = useState(null)
    const [message, setMessage] = useState(null)
    const formRef = useRef(null)
    const searchParams = useSearchParams()
    const page = searchParams.get('page') || 1
    const limit = searchParams.get('limit') || 10

    const getAppointments = useCallback(async () => {
        const token = getToken()
        const res = await fetch(`${baseUrl}/api/appointments?page=${page}&limit=${limit}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + token
            }
        })
        const { data } = await res.json()
        if (data) {
            setAppointments(data.data || [])
            setPaginationData(data)
        }
    }, [page, limit])

    const getPatients = useCallback(async () => {
        const token = getToken()
        const res = await fetch(`${baseUrl}/api/patients?limit=100`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + token
            }
        })
        const { data } = await res.json()
        if (data) {
            setPatients(data.data || [])
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
        getAppointments()
        getPatients()
        getDoctors()
        getDepartments()
    }, [getAppointments, getPatients, getDoctors, getDepartments])

    const openModal = async (id = null) => {
        setEditingId(id)
        setMessage(null)
        
        // Reset form
        if (formRef.current) {
            formRef.current.reset()
        }
        
        if (id) {
            document.getElementById('appointment-modal').showModal()
            const token = getToken()
            const res = await fetch(`${baseUrl}/api/appointments/${id}`, {
                method: "GET",
                headers: {
                    "Authorization": "Bearer " + token
                }
            })
            const { appointment } = await res.json()
            if (appointment && formRef.current) {
                formRef.current.querySelector('[name="patient"]').value = appointment.patient?._id || appointment.patient || ''
                formRef.current.querySelector('[name="doctor"]').value = appointment.doctor?._id || appointment.doctor || ''
                formRef.current.querySelector('[name="department"]').value = appointment.department?._id || appointment.department || ''
                formRef.current.querySelector('[name="appointmentDate"]').value = appointment.appointmentDate ? new Date(appointment.appointmentDate).toISOString().split('T')[0] : ''
                formRef.current.querySelector('[name="appointmentTime"]').value = appointment.appointmentTime || ''
                formRef.current.querySelector('[name="reason"]').value = appointment.reason || ''
                formRef.current.querySelector('[name="visitType"]').value = appointment.visitType || 'in-person'
                formRef.current.querySelector('[name="mode"]').value = appointment.mode || 'pre-booked'
                formRef.current.querySelector('[name="duration"]').value = appointment.duration || 10
                formRef.current.querySelector('[name="status"]').value = appointment.status || 'scheduled'
                formRef.current.querySelector('[name="paymentStatus"]').value = appointment.paymentStatus || 'pending'
                formRef.current.querySelector('[name="paymentMethod"]').value = appointment.paymentMethod || 'cash'
                formRef.current.querySelector('[name="consultationFee"]').value = appointment.consultationFee || 0
            }
        } else {
            document.getElementById('appointment-modal').showModal()
        }
    }

    const closeModal = () => {
        document.getElementById('appointment-modal').close()
        setEditingId(null)
        setMessage(null)
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        const token = getToken()
        
        // Get form values directly
        const form = e.currentTarget
        const appointmentDate = form.querySelector('[name="appointmentDate"]').value
        const payload = {
            patient: form.querySelector('[name="patient"]').value,
            doctor: form.querySelector('[name="doctor"]').value,
            department: form.querySelector('[name="department"]').value,
            appointmentDate: new Date(appointmentDate).toISOString(),
            appointmentTime: form.querySelector('[name="appointmentTime"]').value,
            reason: form.querySelector('[name="reason"]').value,
            visitType: form.querySelector('[name="visitType"]').value,
            mode: form.querySelector('[name="mode"]').value,
            duration: Number(form.querySelector('[name="duration"]').value),
            status: form.querySelector('[name="status"]').value,
            paymentStatus: form.querySelector('[name="paymentStatus"]').value,
            paymentMethod: form.querySelector('[name="paymentMethod"]').value,
            consultationFee: Number(form.querySelector('[name="consultationFee"]').value) || 0
        }

        try {
            const url = editingId 
                ? `${baseUrl}/api/appointments/${editingId}`
                : `${baseUrl}/api/appointments`
            const method = editingId ? 'PUT' : 'POST'

            const res = await fetch(url, {
                method: method,
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + token
                },
                body: JSON.stringify(payload)
            })
            const data = await res.json()
            
            if (res.ok) {
                setMessage(data.success || "Operation successful")
                setTimeout(() => {
                    closeModal()
                    getAppointments()
                }, 1000)
            } else {
                setMessage(data.message || "Operation failed")
            }
        } catch (error) {
            setMessage("An error occurred")
        }
    }

    const handleDelete = async (id) => {
        if (!confirm("Are you sure you want to delete this appointment?")) return
        
        const token = getToken()
        const res = await fetch(`${baseUrl}/api/appointments/${id}`, {
            method: "DELETE",
            headers: {
                "Authorization": "Bearer " + token
            }
        })
        const data = await res.json()
        
        if (res.ok) {
            setMessage("Appointment deleted successfully")
            getAppointments()
        } else {
            setMessage(data.message || "Delete failed")
        }
    }

    const getStatusBadge = (status) => {
        const badges = {
            scheduled: 'badge-info',
            ongoing: 'badge-warning',
            completed: 'badge-success',
            cancelled: 'badge-error',
            'no-show': 'badge-error'
        }
        return badges[status] || 'badge'
    }

    return (
        <AuthLayout>
            <div className="flex justify-between mb-4">
                <h2 className="text-xl font-bold">Appointments</h2>
                <button onClick={() => openModal()} className="btn btn-primary">
                    <i className="fa-solid fa-plus"></i> Add Appointment
                </button>
            </div>

            {message && (
                <div role="alert" className={`alert mb-4 ${message.includes('success') || message.includes('Success') ? 'alert-success' : 'alert-error'}`}>
                    <span>{message}</span>
                </div>
            )}

            <dialog id="appointment-modal" className="modal">
                <div className="modal-box max-w-4xl max-h-[90vh] overflow-y-auto">
                    <button onClick={closeModal} className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
                    <h3 className="font-bold text-lg mb-4">
                        {editingId ? 'Edit Appointment' : 'Add New Appointment'}
                    </h3>
                    
                    <form ref={formRef} onSubmit={handleSubmit}>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="form-control">
                                <select 
                                    name="patient"
                                    required
                                    className="select w-full select-primary focus:outline-0"
                                >
                                    <option value="">Select Patient</option>
                                    {patients.map(patient => (
                                        <option key={patient.id} value={patient.id}>{patient.name} - {patient.phone}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-control">
                                <select 
                                    name="doctor"
                                    required
                                    className="select w-full select-primary focus:outline-0"
                                >
                                    <option value="">Select Doctor</option>
                                    {doctors.map(doctor => (
                                        <option key={doctor.id} value={doctor.id}>{doctor.name} - {doctor.specialization}</option>
                                    ))}
                                </select>
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
                                        type="date" 
                                        name="appointmentDate"
                                        required
                                        min={new Date().toISOString().split('T')[0]}
                                        className="input w-full input-lg focus:input-primary focus:outline-0" 
                                    />
                                    <span>Appointment Date <span className="text-error">*</span></span>
                                </label>
                            </div>

                            <div className="form-control">
                                <label className="floating-label">
                                    <input 
                                        type="time" 
                                        name="appointmentTime"
                                        className="input w-full input-lg focus:input-primary focus:outline-0" 
                                    />
                                    <span>Appointment Time</span>
                                </label>
                            </div>

                            <div className="form-control col-span-2">
                                <label className="floating-label">
                                    <textarea 
                                        name="reason"
                                        required
                                        className="textarea w-full textarea-lg textarea-primary focus:outline-0" 
                                    />
                                    <span>Reason for Visit <span className="text-error">*</span></span>
                                </label>
                            </div>

                            <div className="form-control">
                                <select 
                                    name="visitType"
                                    defaultValue="in-person"
                                    className="select w-full select-primary focus:outline-0"
                                >
                                    <option value="in-person">In-Person</option>
                                    <option value="online">Online</option>
                                </select>
                            </div>

                            <div className="form-control">
                                <select 
                                    name="mode"
                                    defaultValue="pre-booked"
                                    className="select w-full select-primary focus:outline-0"
                                >
                                    <option value="walk-in">Walk-in</option>
                                    <option value="pre-booked">Pre-booked</option>
                                    <option value="follow-up">Follow-up</option>
                                </select>
                            </div>

                            <div className="form-control">
                                <label className="floating-label">
                                    <input 
                                        type="number" 
                                        name="duration"
                                        defaultValue="10"
                                        min="1"
                                        className="input w-full input-lg focus:input-primary focus:outline-0" 
                                    />
                                    <span>Duration (minutes)</span>
                                </label>
                            </div>

                            <div className="form-control">
                                <select 
                                    name="status"
                                    defaultValue="scheduled"
                                    className="select w-full select-primary focus:outline-0"
                                >
                                    <option value="scheduled">Scheduled</option>
                                    <option value="ongoing">Ongoing</option>
                                    <option value="completed">Completed</option>
                                    <option value="cancelled">Cancelled</option>
                                    <option value="no-show">No-Show</option>
                                </select>
                            </div>

                            <div className="form-control">
                                <label className="floating-label">
                                    <input 
                                        type="number" 
                                        name="consultationFee"
                                        defaultValue="0"
                                        min="0"
                                        className="input w-full input-lg focus:input-primary focus:outline-0" 
                                    />
                                    <span>Consultation Fee</span>
                                </label>
                            </div>

                            <div className="form-control">
                                <select 
                                    name="paymentStatus"
                                    defaultValue="pending"
                                    className="select w-full select-primary focus:outline-0"
                                >
                                    <option value="pending">Pending</option>
                                    <option value="paid">Paid</option>
                                    <option value="refunded">Refunded</option>
                                </select>
                            </div>

                            <div className="form-control">
                                <select 
                                    name="paymentMethod"
                                    defaultValue="cash"
                                    className="select w-full select-primary focus:outline-0"
                                >
                                    <option value="cash">Cash</option>
                                    <option value="card">Card</option>
                                    <option value="online">Online</option>
                                    <option value="insurance">Insurance</option>
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
                            <th>Doctor</th>
                            <th>Department</th>
                            <th>Date</th>
                            <th>Time</th>
                            <th>Status</th>
                            <th>Payment</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {appointments.map((appointment, i) => (
                            <tr key={appointment.id}>
                                <td>{i + 1}</td>
                                <td>{appointment.patient?.name || 'N/A'}</td>
                                <td>{appointment.doctor?.name || 'N/A'}</td>
                                <td>{appointment.department?.name || 'N/A'}</td>
                                <td>{appointment.appointmentDate ? new Date(appointment.appointmentDate).toLocaleDateString() : 'N/A'}</td>
                                <td>{appointment.appointmentTime || 'N/A'}</td>
                                <td>
                                    <span className={`badge ${getStatusBadge(appointment.status)}`}>
                                        {appointment.status}
                                    </span>
                                </td>
                                <td>
                                    <span className={`badge ${appointment.paymentStatus === 'paid' ? 'badge-success' : 'badge-warning'}`}>
                                        {appointment.paymentStatus}
                                    </span>
                                </td>
                                <td>
                                    <button 
                                        onClick={() => openModal(appointment.id)} 
                                        className="btn btn-sm btn-info me-1"
                                    >
                                        <i className="fa-solid fa-pen-to-square"></i>
                                    </button>
                                    <button 
                                        onClick={() => handleDelete(appointment.id)} 
                                        className="btn btn-sm btn-error"
                                    >
                                        <i className="fa-solid fa-trash"></i>
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {appointments.length === 0 && (
                            <tr>
                                <td colSpan="9" className="text-center py-4">No appointments found</td>
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
