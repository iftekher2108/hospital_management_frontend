export default function Sidebar() {
    return (
        <ul className="menu bg-base-200 rounded-box w-full">
            <li><a>Item 1</a></li>
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