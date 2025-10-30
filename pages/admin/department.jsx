"use client"
import AuthLayout from "@/components/authLayout"
import Pagination from "@/components/pagination"
import getToken from "@/lib/getToken"
import { Fetch } from "@/lib/fetch"
import { useEffect, useState } from "react"
export default function Department() {
    const [departments, setDepartments] = useState([])
    // const [page, setPage] = useState(1);

    const [formdata, setFormData] = useState({
        name: '',
        code: '',
        description: '',
        floor: '',
        roomNumber: '',
        headDoctor: '',
        email: '',
        phone: '',
        totalStaff: '',
        totalBeds: '',
        status: '',
        address: {
            first_add: '',
            secound_add: ""
        }
    })

    // 3. Single handler function for all *top-level* fields
    const handleChange = (e) => {
        const { name, value } = e.target;

        // Use the spread operator (...) to keep all existing fields
        // and only update the field matching the input's 'name'
        setFormData(prevData => ({
            ...prevData,
            [name]: value, // This updates the specific top-level field (e.g., 'name', 'code')
        }));
    };

    // 4. Dedicated handler function for *nested* fields (address)
    // const handleAddressChange = (e) => {
    //     const { name, value } = e.target;

    //     // Use nested spread operators:
    //     setFormData(prevData => ({
    //         ...prevData,           // 1. Keep all top-level fields (name, code, etc.)
    //         address: {             // 2. Target the 'address' object
    //             ...prevData.address, // 3. Keep all existing address fields (first_add, secound_add)
    //             [name]: value,     // 4. Update the specific address field
    //         }
    //     }));
    // };

    async function getDepartment() {
        const token = await getToken()
        const res = await Fetch(`/api/departments`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + token
            }
        })
        const { data } = await res.json()
        setDepartments(data.data)
    }

    useEffect(() => {
        getDepartment()
    }, [departments])


    function handleSubmit() {

    }


    return (
        <AuthLayout>
            <div className="flex justify-between">
                <h2 className="text-xl font-bold">Department</h2>
                <button onClick={() => document.getElementById('department-store').showModal()} className="btn btn-primary"><i className="fa-solid fa-plus"></i> Add Department</button>
            </div>

            <dialog id="department-store" className="modal">
                <div className="modal-box">
                    <form method="dialog">
                        <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
                    </form>
                    <span className="font-bold py-2 px-4 rounded text-white bg-primary text-lg">Department</span>
                    <div className="grid grid-cols-2 p-2">
                        
                        <div className="col-span-2 form-control my-3">
                            <label className="floating-label">
                                <input type="text" placeholder="Medium" className="input w-full input-md input-primary focus:border-0" />
                                <span>Medium</span>
                            </label>
                        </div>

                        <div className="col-span-2 form-control mb-3">
                            <label className="floating-label">
                                <input type="text" placeholder="Medium" className="input w-full input-md input-primary focus:border-0" />
                                <span>Medium</span>
                            </label>
                        </div>

                    <button className="btn btn-primary">Submit</button>

                    </div>
                </div>
            </dialog>
            <br />
            <div className="overflow-x-auto rounded-box border border-base-content/5 bg-base-100">
                <table className="table">
                    {/* head */}
                    <thead>
                        <tr className="bg-primary">
                            <th>Sl</th>
                            <th>Name</th>
                            <th>department Head</th>
                            <th>Email</th>
                            <th>Phone</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {departments.map((department, i) => (
                            <tr key={department.id}>
                                <td>{i + 1}</td>
                                <td>{department.name}</td>
                                <td>{department?.headDoctor?.name}</td>
                                <td>{department.email}</td>
                                <td>{department.phone}</td>
                                <td>
                                    <button className="btn btn-sm btn-info me-1"><i className="fa-solid fa-pen-to-square"></i></button>
                                    <button className="btn btn-sm btn-error me-1"><i className="fa-solid fa-trash"></i></button>

                                </td>
                            </tr>
                        ))}


                    </tbody>
                </table>
            </div>

            <div className="mt-4">
                <Pagination />
            </div>

        </AuthLayout>
    )
}