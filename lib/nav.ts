import { LayoutDashboard, Users, Car, Calculator, FileText, Settings, Wallet } from "lucide-react"

export const sidebarLinks = [
    {
        title: "Dashboard",
        href: "/dashboard",
        icon: LayoutDashboard,
        roles: ["admin"],
    },
    {
        title: "Clientes",
        href: "/clients",
        icon: Users,
        roles: ["admin", "user"],
    },
    {
        title: "Inventario",
        href: "/inventory",
        icon: Car,
        roles: ["admin", "user"],
    },
    {
        title: "Ventas y Cuotero",
        href: "/sales",
        icon: Calculator,
        roles: ["admin", "user"],
    },
    {
        title: "Caja",
        href: "/collections",
        icon: Wallet,
        roles: ["admin", "user"],
    },
    {
        title: "Reportes",
        href: "/reports/collections", // Direct link to the main report for now
        icon: FileText,
        roles: ["admin", "user"],
    },
    {
        title: "Auditoría",
        href: "/admin/audit",
        icon: FileText,
        roles: ["admin"],
    },
    {
        title: "Usuarios",
        href: "/users",
        icon: Users,
        roles: ["admin"],
    },
    {
        title: "Configuración",
        href: "/settings",
        icon: Settings,
        roles: ["admin"],
    },
]
