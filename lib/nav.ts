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
        roles: ["admin", "operator"],
    },
    {
        title: "Inventario",
        href: "/inventory",
        icon: Car,
        roles: ["admin", "operator"],
    },
    {
        title: "Ventas y Cuotero",
        href: "/sales",
        icon: Calculator,
        roles: ["admin", "operator"],
    },
    {
        title: "Caja",
        href: "/collections",
        icon: Wallet,
        roles: ["admin", "operator"],
    },
    {
        title: "Configuración",
        href: "/settings",
        icon: Settings,
        roles: ["admin"],
    },
]
