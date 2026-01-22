import Link from "next/link"
import { usePathname } from "next/navigation"
export default function Sidebar() {

    const pathname = usePathname()

    function active(path) {
        if (pathname == path) {
            return "active"
        } else {
            return ""
        }
    }

    return (
        <ul className="menu bg-base-200 gap-1 rounded-box w-full min-h-screen">
            
            <li><Link className={`${active("/admin/dashboard")}`} href={'/admin/dashboard'}>
                <span className="icon"><i className="fa-solid fa-house"></i></span>Dashboard
            </Link></li>

            <li><Link className={`${active("/admin/department")}`} href={"/admin/department"}>
                <span className="icon"><i className="fa-solid fa-building"></i></span>Department
            </Link></li>

            <li><Link className={`${active("/admin/doctor")}`} href={"/admin/doctor"}> 
                <span className="icon"><i className="fa-solid fa-user-doctor"></i></span>Doctor
            </Link></li>

            <li><Link className={`${active("/admin/patient")}`} href={"/admin/patient"}> 
                <span className="icon"><i className="fa-solid fa-user-injured"></i></span>Patient
            </Link></li>

            <li><Link className={`${active("/admin/appointment")}`} href={"/admin/appointment"}> 
                <span className="icon"><i className="fa-solid fa-calendar-check"></i></span>Appointment
            </Link></li>

            <li><Link className={`${active("/admin/room")}`} href={"/admin/room"}> 
                <span className="icon"><i className="fa-solid fa-bed"></i></span>Room
            </Link></li>

            <li><Link className={`${active("/admin/hospital")}`} href={"/admin/hospital"}> 
                <span className="icon"><i className="fa-solid fa-hospital"></i></span>Hospital
            </Link></li>

            <li><Link className={`${active("/admin/medicine")}`} href={"/admin/medicine"}> 
                <span className="icon"><i className="fa-solid fa-pills"></i></span>Medicine
            </Link></li>

            <li><Link className={`${active("/admin/prescription")}`} href={"/admin/prescription"}> 
                <span className="icon"><i className="fa-solid fa-prescription"></i></span>Prescription
            </Link></li>

            <li><Link className={`${active("/admin/bill")}`} href={"/admin/bill"}> 
                <span className="icon"><i className="fa-solid fa-file-invoice-dollar"></i></span>Bill
            </Link></li>

            <li><Link className={`${active("/admin/payment")}`} href={"/admin/payment"}> 
                <span className="icon"><i className="fa-solid fa-money-bill-wave"></i></span>Payment
            </Link></li>

            <li><Link className={`${active("/admin/settings")}`} href={"/admin/settings"}> 
                <span className="icon"><i className="fa-solid fa-gear"></i></span>Settings
            </Link></li>
        </ul>
    )
}