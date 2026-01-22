"use client"
import AuthLayout from "@/components/authLayout"
import Pagination from "@/components/pagination"
import getToken from "@/lib/getToken"
import { baseUrl } from "@/lib/base_url"
import { useCallback, useEffect, useState, useRef } from "react"
import { useSearchParams } from "next/navigation"

export default function Settings() {
    const [settings, setSettings] = useState([])
    const [paginationData, setPaginationData] = useState(null)
    const [editingId, setEditingId] = useState(null)
    const [message, setMessage] = useState(null)
    const formRef = useRef(null)
    const searchParams = useSearchParams()
    const page = searchParams.get('page') || 1
    const limit = searchParams.get('limit') || 10

    const getSettings = useCallback(async () => {
        const token = getToken()
        const res = await fetch(`${baseUrl}/api/settings?page=${page}&limit=${limit}`, {
            headers: { "Authorization": "Bearer " + token }
        })
        const { data } = await res.json()
        if (data) {
            setSettings(data.data || [])
            setPaginationData(data) // Store pagination metadata
        }
    }, [page, limit])

    useEffect(() => { getSettings() }, [getSettings])

    const openModal = async (id = null) => {
        setEditingId(id)
        setMessage(null)
        
        // Reset form
        if (formRef.current) {
            formRef.current.reset()
        }
        
        if (id) {
            document.getElementById('setting-modal').showModal()
            const token = getToken()
            const res = await fetch(`${baseUrl}/api/settings/${id}`, {
                headers: { "Authorization": "Bearer " + token }
            })
            const { setting } = await res.json()
            if (setting && formRef.current) {
                formRef.current.querySelector('[name="key"]').value = setting.key || ''
                formRef.current.querySelector('[name="value"]').value = setting.value || ''
            }
        } else {
            document.getElementById('setting-modal').showModal()
        }
    }

    const closeModal = () => {
        document.getElementById('setting-modal').close()
        setEditingId(null)
        setMessage(null)
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        const token = getToken()
        const form = e.currentTarget
        const payload = {
            key: form.querySelector('[name="key"]').value,
            value: form.querySelector('[name="value"]').value
        }
        try {
            const url = editingId ? `${baseUrl}/api/settings/${editingId}` : `${baseUrl}/api/settings`
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
                setTimeout(() => { closeModal(); getSettings() }, 1000)
            } else {
                setMessage(data.message || "Failed")
            }
        } catch (error) {
            setMessage("Error occurred")
        }
    }

    const handleDelete = async (id) => {
        if (!confirm("Delete this setting?")) return
        const token = getToken()
        const res = await fetch(`${baseUrl}/api/settings/${id}`, {
            method: "DELETE",
            headers: { "Authorization": "Bearer " + token }
        })
        if (res.ok) {
            setMessage("Deleted successfully")
            getSettings()
        }
    }

    return (
        <AuthLayout>
            <div className="flex justify-between mb-4">
                <h2 className="text-xl font-bold">Settings</h2>
                <button onClick={() => openModal()} className="btn btn-primary">
                    <i className="fa-solid fa-plus"></i> Add Setting
                </button>
            </div>

            {message && (
                <div className={`alert mb-4 ${message.includes('success') || message.includes('Success') ? 'alert-success' : 'alert-error'}`}>
                    <span>{message}</span>
                </div>
            )}

            <dialog id="setting-modal" className="modal">
                <div className="modal-box max-w-2xl">
                    <button onClick={closeModal} className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
                    <h3 className="font-bold text-lg mb-4">{editingId ? 'Edit Setting' : 'Add Setting'}</h3>
                    <form ref={formRef} onSubmit={handleSubmit}>
                        <div className="grid grid-cols-1 gap-4">
                            <div className="form-control">
                                <label className="floating-label">
                                    <input type="text" name="key" required className="input w-full input-lg focus:input-primary focus:outline-0" />
                                    <span>Key <span className="text-error">*</span></span>
                                </label>
                            </div>
                            <div className="form-control">
                                <label className="floating-label">
                                    <textarea name="value" className="textarea w-full textarea-lg textarea-primary focus:outline-0" />
                                    <span>Value</span>
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
                            <th>Key</th>
                            <th>Value</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {settings.map((setting, i) => (
                            <tr key={setting.id}>
                                <td>{i + 1}</td>
                                <td>{setting.key}</td>
                                <td>{setting.value}</td>
                                <td>
                                    <button onClick={() => openModal(setting.id)} className="btn btn-sm btn-info me-1"><i className="fa-solid fa-pen-to-square"></i></button>
                                    <button onClick={() => handleDelete(setting.id)} className="btn btn-sm btn-error"><i className="fa-solid fa-trash"></i></button>
                                </td>
                            </tr>
                        ))}
                        {settings.length === 0 && <tr><td colSpan="4" className="text-center py-4">No settings found</td></tr>}
                    </tbody>
                </table>
            </div>
            {paginationData && (
                <Pagination paginationData={paginationData} />
            )}
        </AuthLayout>
    )
}
