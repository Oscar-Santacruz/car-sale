import { Button } from "@/components/ui/button"
import { Plus, Upload } from "lucide-react"
import { InventoryList } from "@/components/inventory/InventoryList"
import { VehicleFilters } from "@/components/inventory/VehicleFilters"
import Link from "next/link"
import { cookies } from "next/headers"
import { createServerClient } from "@supabase/ssr"
import { getParametricData } from "@/app/settings-actions"

// Helper to safely get string from searchParams
const getString = (val: string | string[] | undefined) => {
    if (!val) return undefined
    return Array.isArray(val) ? val[0] : val
}

async function getVehicles(searchParams: { [key: string]: string | string[] | undefined }) {
    const cookieStore = await cookies()

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get(name: string) {
                    return cookieStore.get(name)?.value
                },
            },
        }
    )

    let query = supabase
        .from('vehicles')
        .select('*')
        .is('deleted_at', null)
        .order('created_at', { ascending: false })

    // Apply filters safely
    const brandId = getString(searchParams.brandId)
    if (brandId) query = query.eq('brand_id', brandId)

    const modelId = getString(searchParams.modelId)
    if (modelId) query = query.eq('model_id', modelId)

    const categoryId = getString(searchParams.categoryId)
    if (categoryId) query = query.eq('category_id', categoryId)

    const typeId = getString(searchParams.typeId)
    if (typeId) query = query.eq('type_id', typeId)

    const status = getString(searchParams.status)
    if (status && status !== 'all') query = query.eq('status', status)

    const minYear = getString(searchParams.minYear)
    if (minYear) query = query.gte('year', minYear)

    const maxYear = getString(searchParams.maxYear)
    if (maxYear) query = query.lte('year', maxYear)

    const minPrice = getString(searchParams.minPrice)
    if (minPrice) query = query.gte('list_price', minPrice)

    const maxPrice = getString(searchParams.maxPrice)
    if (maxPrice) query = query.lte('list_price', maxPrice)

    const { data } = await query
    return data || []
}

interface InventoryPageProps {
    searchParams: Promise<{ [key: string]: string | undefined }>
}

export default async function InventoryPage({ searchParams }: InventoryPageProps) {
    const params = await searchParams
    const vehicles = await getVehicles(params)
    const parametricData = await getParametricData()

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">Inventario</h2>
                <div className="flex gap-2">
                    <Link href="/inventory/bulk-import">
                        <Button variant="outline">
                            <Upload className="mr-2 h-4 w-4" /> Carga Masiva
                        </Button>
                    </Link>
                    <Link href="/inventory/new">
                        <Button>
                            <Plus className="mr-2 h-4 w-4" /> Nuevo Vehículo
                        </Button>
                    </Link>
                </div>
            </div>

            <VehicleFilters data={parametricData} />

            <InventoryList vehicles={vehicles} />
        </div>
    )
}
