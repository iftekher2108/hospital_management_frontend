import { useRouter } from "next/navigation"


export default function Header() {
    const router = useRouter()

const handleLogout = () => {
    if(typeof window !== 'undefined') {
        localStorage.removeItem('token')
        router.replace('/auth/login')
    }
}



    return (
        <div className="navbar bg-base-100 shadow-sm p-3">
            <div className="flex-1">
                <a className="btn btn-ghost text-xl">daisyUI</a>
            </div>
            <div className="flex gap-2">
                {/* <ul className="menu menu-horizontal px-1">
                    <li><a>Link</a></li>
                    <li>
                        <details>
                            <summary>Parent</summary>
                            <ul className="bg-base-100 rounded-t-none p-2">
                                <li><a>Link 1</a></li>
                                <li><a>Link 2</a></li>
                            </ul>
                        </details>
                    </li>
                </ul> */}

                <div className="dropdown dropdown-end">
                    <div tabIndex={0} role="button" className="btn btn-ghost btn-circle avatar">
                        <div className="w-10 rounded-full">
                            <img
                                alt="Tailwind CSS Navbar component"
                                src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp" />
                        </div>
                    </div>
                    <ul
                        tabIndex="-1"
                        className="menu menu-sm dropdown-content bg-base-100 rounded-box z-1 mt-3 w-52 p-2 shadow">
                        <li>
                            <a className="p-2">
                               <i class="fa-solid me-1 fa-user"></i> Profile
                                {/* <span className="badge">New</span> */}
                            </a>
                        </li>
                        <li><a className="p-2"><i class="fa-solid me-1 fa-sliders"></i> Settings</a></li>
                        <li><button onClick={()=> handleLogout()} className="p-2"><i class="fa-solid me-1 fa-arrow-right-from-bracket"></i> Logout</button></li>
                    </ul>
                </div>
            </div>
        </div>
    )
}