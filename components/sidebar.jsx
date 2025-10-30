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

            <li><Link className={`${active("/admin/doctor")}`} href={"/admin/doctor"}> <span className="icon">
                <i className="fa-solid fa-user-doctor"></i></span>Doctor
            </Link></li>

            <li>
                <details >
                    <summary>Parent</summary>
                    <ul>
                        <li><a>Submenu 1</a></li>
                        <li><a>Submenu 2</a></li>
                    </ul>
                </details>
            </li>
            <li><a>Item 3</a></li>
        </ul>
    )
}