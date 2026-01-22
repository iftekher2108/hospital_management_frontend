"use client"
import AuthLayout from "@/components/authLayout"
import Pagination from "@/components/pagination"
import getToken from "@/lib/getToken"
import { baseUrl } from "@/lib/base_url"
import { useCallback, useEffect, useState, useRef } from "react"
import { useSearchParams } from "next/navigation"

export default function Room() {
    const [rooms, setRooms] = useState([])
    const [departments, setDepartments] = useState([])
    const [patients, setPatients] = useState([])
    const [paginationData, setPaginationData] = useState(null)
    const [editingId, setEditingId] = useState(null)
    const [message, setMessage] = useState(null)
    const formRef = useRef(null)
    const searchParams = useSearchParams()
    const page = searchParams.get('page') || 1
    const limit = searchParams.get('limit') || 10

    const getRooms = useCallback(async () => {
        const token = getToken()
        const res = await fetch(`${baseUrl}/api/rooms?page=${page}&limit=${limit}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + token
            }
        })
        const { data } = await res.json()
        if (data) {
            setRooms(data.data || [])
            setPaginationData(data) // Store pagination metadata
        }
    }, [page, limit])

    const getDepartments = useCallback(async () => {
        const token = getToken()
        const res = await fetch(`${baseUrl}/api/departments?limit=100`, {
            headers: { "Authorization": "Bearer " + token }
        })
        const { data } = await res.json()
        if (data) setDepartments(data.data || [])
    }, [])

    const getPatients = useCallback(async () => {
        const token = getToken()
        const res = await fetch(`${baseUrl}/api/patients?limit=100`, {
            headers: { "Authorization": "Bearer " + token }
        })
        const { data } = await res.json()
        if (data) setPatients(data.data || [])
    }, [])

    useEffect(() => {
        getRooms()
        getDepartments()
        getPatients()
    }, [getRooms, getDepartments, getPatients])

    const openModal = async (id = null) => {
        setEditingId(id)
        setMessage(null)
        
        // Reset form
        if (formRef.current) {
            formRef.current.reset()
        }
        
        if (id) {
            document.getElementById('room-modal').showModal()
            const token = getToken()
            const res = await fetch(`${baseUrl}/api/rooms/${id}`, {
                headers: { "Authorization": "Bearer " + token }
            })
            const { room } = await res.json()
            if (room && formRef.current) {
                formRef.current.querySelector('[name="roomNumber"]').value = room.roomNumber || ''
                formRef.current.querySelector('[name="floor"]').value = room.floor || ''
                formRef.current.querySelector('[name="description"]').value = room.description || ''
                formRef.current.querySelector('[name="roomType"]').value = room.roomType || 'general'
                formRef.current.querySelector('[name="bedCount"]').value = room.bedCount || 1
                formRef.current.querySelector('[name="availableBeds"]').value = room.availableBeds || 1
                formRef.current.querySelector('[name="status"]').value = room.status || 'available'
                formRef.current.querySelector('[name="dailyRate"]').value = room.dailyRate || 0
                formRef.current.querySelector('[name="department"]').value = room.department?._id || room.department || ''
                formRef.current.querySelector('[name="currentPatient"]').value = room.currentPatient?._id || room.currentPatient || ''
                formRef.current.querySelector('[name="amenities"]').value = Array.isArray(room.amenities) ? room.amenities.join(', ') : ''
            }
        } else {
            document.getElementById('room-modal').showModal()
        }
    }

    const closeModal = () => {
        document.getElementById('room-modal').close()
        setEditingId(null)
        setMessage(null)
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        const token = getToken()
        const form = e.currentTarget
        
        const amenitiesValue = form.querySelector('[name="amenities"]').value
        const payload = {
            roomNumber: form.querySelector('[name="roomNumber"]').value,
            floor: form.querySelector('[name="floor"]').value,
            description: form.querySelector('[name="description"]').value,
            roomType: form.querySelector('[name="roomType"]').value,
            bedCount: Number(form.querySelector('[name="bedCount"]').value) || 1,
            availableBeds: Number(form.querySelector('[name="availableBeds"]').value) || 1,
            status: form.querySelector('[name="status"]').value,
            dailyRate: Number(form.querySelector('[name="dailyRate"]').value) || 0,
            department: form.querySelector('[name="department"]').value || null,
            currentPatient: form.querySelector('[name="currentPatient"]').value || null,
            amenities: amenitiesValue ? amenitiesValue.split(',').map(a => a.trim()).filter(a => a) : []
        }

        try {
            const url = editingId ? `${baseUrl}/api/rooms/${editingId}` : `${baseUrl}/api/rooms`
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
                setTimeout(() => { closeModal(); getRooms() }, 1000)
            } else {
                setMessage(data.message || "Failed")
            }
        } catch (error) {
            setMessage("Error occurred")
        }
    }

    const handleDelete = async (id) => {
        if (!confirm("Delete this room?")) return
        const token = getToken()
        const res = await fetch(`${baseUrl}/api/rooms/${id}`, {
            method: "DELETE",
            headers: { "Authorization": "Bearer " + token }
        })
        if (res.ok) {
            setMessage("Deleted successfully")
            getRooms()
        }
    }

    return (
        <AuthLayout>
            <div className="flex justify-between mb-4">
                <h2 className="text-xl font-bold">Rooms</h2>
                <button onClick={() => openModal()} className="btn btn-primary">
                    <i className="fa-solid fa-plus"></i> Add Room
                </button>
            </div>

            {message && (
                <div className={`alert mb-4 ${message.includes('success') || message.includes('Success') ? 'alert-success' : 'alert-error'}`}>
                    <span>{message}</span>
                </div>
            )}

            <dialog id="room-modal" className="modal">
                <div className="modal-box max-w-4xl max-h-[90vh] overflow-y-auto">
                    <button onClick={closeModal} className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
                    <h3 className="font-bold text-lg mb-4">{editingId ? 'Edit Room' : 'Add Room'}</h3>
                    <form ref={formRef} onSubmit={handleSubmit}>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="form-control">
                                <label className="floating-label">
                                    <input type="text" name="roomNumber" required className="input w-full input-lg focus:input-primary focus:outline-0" />
                                    <span>Room Number <span className="text-error">*</span></span>
                                </label>
                            </div>
                            <div className="form-control">
                                <label className="floating-label">
                                    <input type="text" name="floor" className="input w-full input-lg focus:input-primary focus:outline-0" />
                                    <span>Floor</span>
                                </label>
                            </div>
                            <div className="form-control">
                                <select name="roomType" defaultValue="general" className="select w-full select-primary focus:outline-0">
                                    <option value="general">General</option>
                                    <option value="icu">ICU</option>
                                    <option value="private">Private</option>
                                    <option value="semi-private">Semi-Private</option>
                                    <option value="emergency">Emergency</option>
                                    <option value="vip">VIP</option>
                                </select>
                            </div>
                            <div className="form-control">
                                <label className="floating-label">
                                    <input type="number" name="bedCount" defaultValue="1" min="1" className="input w-full input-lg focus:input-primary focus:outline-0" />
                                    <span>Bed Count</span>
                                </label>
                            </div>
                            <div className="form-control">
                                <label className="floating-label">
                                    <input type="number" name="availableBeds" defaultValue="1" min="0" className="input w-full input-lg focus:input-primary focus:outline-0" />
                                    <span>Available Beds</span>
                                </label>
                            </div>
                            <div className="form-control">
                                <select name="status" defaultValue="available" className="select w-full select-primary focus:outline-0">
                                    <option value="available">Available</option>
                                    <option value="occupied">Occupied</option>
                                    <option value="maintenance">Maintenance</option>
                                </select>
                            </div>
                            <div className="form-control">
                                <label className="floating-label">
                                    <input type="number" name="dailyRate" defaultValue="0" min="0" className="input w-full input-lg focus:input-primary focus:outline-0" />
                                    <span>Daily Rate</span>
                                </label>
                            </div>
                            <div className="form-control">
                                <select name="department" className="select w-full select-primary focus:outline-0">
                                    <option value="">Select Department</option>
                                    {departments.map(dept => <option key={dept.id} value={dept.id}>{dept.name}</option>)}
                                </select>
                            </div>
                            <div className="form-control">
                                <select name="currentPatient" className="select w-full select-primary focus:outline-0">
                                    <option value="">Select Patient</option>
                                    {patients.map(patient => <option key={patient.id} value={patient.id}>{patient.name}</option>)}
                                </select>
                            </div>
                            <div className="form-control col-span-2">
                                <label className="floating-label">
                                    <textarea name="description" className="textarea w-full textarea-lg textarea-primary focus:outline-0" />
                                    <span>Description</span>
                                </label>
                            </div>
                            <div className="form-control col-span-2">
                                <label className="floating-label">
                                    <input type="text" name="amenities" placeholder="Comma separated" className="input w-full input-lg focus:input-primary focus:outline-0" />
                                    <span>Amenities (comma separated)</span>
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
                            <th>Room Number</th>
                            <th>Floor</th>
                            <th>Type</th>
                            <th>Beds</th>
                            <th>Status</th>
                            <th>Daily Rate</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rooms.map((room, i) => (
                            <tr key={room.id}>
                                <td>{i + 1}</td>
                                <td>{room.roomNumber}</td>
                                <td>{room.floor || 'N/A'}</td>
                                <td>{room.roomType}</td>
                                <td>{room.availableBeds}/{room.bedCount}</td>
                                <td><span className={`badge ${room.status === 'available' ? 'badge-success' : room.status === 'occupied' ? 'badge-warning' : 'badge-error'}`}>{room.status}</span></td>
                                <td>{room.dailyRate}</td>
                                <td>
                                    <button onClick={() => openModal(room.id)} className="btn btn-sm btn-info me-1"><i className="fa-solid fa-pen-to-square"></i></button>
                                    <button onClick={() => handleDelete(room.id)} className="btn btn-sm btn-error"><i className="fa-solid fa-trash"></i></button>
                                </td>
                            </tr>
                        ))}
                        {rooms.length === 0 && <tr><td colSpan="8" className="text-center py-4">No rooms found</td></tr>}
                    </tbody>
                </table>
            </div>
            {paginationData && (
                <Pagination paginationData={paginationData} />
            )}
        </AuthLayout>
    )
}
