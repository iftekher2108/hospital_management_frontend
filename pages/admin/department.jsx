"use client"
import AuthLayout from "@/components/authLayout"
import Pagination from "@/components/pagination"
import getToken from "@/lib/getToken"
import { baseUrl } from "@/lib/base_url"
import { useCallback, useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
export default function Department() {
    const [model, setModel] = useState(false)
    const [departments, setDepartments] = useState([])
    const searchParams = useSearchParams()
    // const [page, setPage] = useState(1);
    const page = searchParams.get('page') || 1;
    const limit = searchParams.get('limit') || 10;


    // 3. Single handler function for all *top-level* fields
    // const handleChange = (e) => {
    //     const { name, value } = e.target;

    //     console.log(`${name} = `, value)
    //     // Use the spread operator (...) to keep all existing fields
    //     // and only update the field matching the input's 'name'
    //     setFormData(prevData => ({
    //         ...prevData,
    //         [name]: value, // This updates the specific top-level field (e.g., 'name', 'code')
    //     }));
    // };

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

    const getDepartment = useCallback(async () => {
        const token = getToken()
        const res = await fetch(`${baseUrl}/api/departments?page=${page}&limit=${limit}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + token
            }
        })
        const { data } = await res.json()
        setDepartments(data.data)
    },[page, limit])

    useEffect(() => {
        getDepartment();
    }, [getDepartment])

    const modelOpen = async (id = null) => {
        if (id == null) {
            document.getElementById('department-store').setAttribute('open', true)
        } else {
            document.getElementById('department-store').setAttribute('open', true)
            const token = getToken();
            const res = await fetch(`${baseUrl}/api/departments/${id}`, {
                method: "GET",
                headers: {
                    "Authorization": "Bearer " + token
                }
            })
            const data = await res.json()
            console.log(data)

        }
    }


    const handleSubmit = async(e) => {
        e.preventDefault()
        // if (id == null) {
        //     document.getElementById('department-store').setAttribute('open', true)
        // } else {
        // document.getElementById('department-store').setAttribute('open', true)
        const token = getToken();
        const formdata = new FormData(e.currentTarget)
        const res = await fetch(`${baseUrl}/api/departments`, {
            method: "POST",
            body: formdata,
            headers: {
                "Authorization": "Bearer " + token
            }
        })
        const data = await res.json()
        console.log(data.success)

        // }
    }


    return (
        <AuthLayout>
            <div className="flex justify-between">
                <h2 className="text-xl font-bold">Department</h2>
                <button onClick={() => modelOpen()} className="btn btn-primary"><i className="fa-solid fa-plus"></i> Add Department</button>
            </div>
            <dialog id="department-store" className="modal">
                <div className="modal-box max-w-3/5">

                    <button onClick={() => document.getElementById('department-store').removeAttribute('open')} className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>

                    <span className="font-bold py-2 px-4  rounded text-white bg-primary text-lg">Department</span>
                    <div className="p-2 mt-2">
                        <form onSubmit={handleSubmit} method="POST" encType="multipart/form-data">

                            <div className="grid grid-cols-2 gap-2">
                                <div className="col-span-1 form-control my-2">
                                    <label className="floating-label">
                                        <input type="text" name="name"
                                        //  onChange={handleChange} 
                                         className="input w-full input-lg focus:input-primary focus:outline-0" />
                                        <span>Name <span className="text-error">*</span></span>
                                    </label>
                                </div>

                                <div className="col-span-1 form-control my-2">
                                    <label className="floating-label">
                                        <input type="text"
                                        // onChange={handleChange}
                                         name="code" className="input w-full input-lg focus:input-primary focus:outline-0" />
                                        <span>Code <span className="text-error">*</span></span>
                                    </label>
                                </div>

                                <div className="col-span-2 form-control mb-3">
                                    <p className="text-sm">Pick a file</p>
                                    <input type="file" name="picture" className="file-input w-full focus:file-input-primary focus:outline-0" />
                                    <p className="text-xs">Max size 2MB</p>
                                </div>

                                <div className="col-span-2 form-control mb-2">
                                    <label className="floating-label">
                                        <textarea type="text" name="description" className="textarea w-full textarea-lg textarea-primary focus:outline-0" />
                                        <span>Description</span>
                                    </label>
                                </div>

                                <div className="col-span-1 form-control my-2">
                                    <label className="floating-label">
                                        <input type="email"
                                        //  onChange={handleChange}
                                          name="email" className="input w-full input-lg focus:input-primary focus:outline-0" />
                                        <span>Email <span className="text-error">*</span></span>
                                    </label>
                                </div>

                                <div className="col-span-1 form-control my-2">
                                    <label className="floating-label">
                                        <input type="number"
                                        //  onChange={handleChange} 
                                         name="phone" className="input w-full input-lg focus:input-primary focus:outline-0" />
                                        <span>Phone <span className="text-error">*</span></span>
                                    </label>
                                </div>

                                <div className="col-span-2 form-control mb-2">
                                    <select defaultValue="Status" name="status"
                                    //  onChange={handleChange} 
                                     className="select w-full select-primary focus:outline-0">
                                        <option value={'active'}>Active</option>
                                        <option value={'inactive'}>Inactive</option>
                                    </select>
                                </div>

                            </div>
                            <div className="flex justify-end mt-3">
                                <button type="submit" className="btn px-8 btn-primary">Submit</button>
                            </div>
                        </form>
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
                            {/* <th>department Head</th> */}
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
                                {/* <td>{department?.headDoctor?.name}</td> */}
                                <td>{department.email}</td>
                                <td>{department.phone}</td>
                                <td>
                                    <button onClick={() => modelOpen(department.id)} className="btn btn-sm btn-info me-1"><i className="fa-solid fa-pen-to-square"></i></button>
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