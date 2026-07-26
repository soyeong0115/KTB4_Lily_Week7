export default function SidebarTag({ color, children }) {
    return (
        <span className={`sidebar-tag ${color}`}>{children}</span>
    );
}
