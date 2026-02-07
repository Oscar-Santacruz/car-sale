"use client"

import { useState, useEffect, useMemo } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useDebounce } from "use-debounce"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { Check, ChevronsUpDown, X, ChevronDown, ChevronUp, FilterX } from "lucide-react"
import { cn } from "@/lib/utils"

interface ParametricData {
    brands: any[]
    models: any[]
    categories: any[]
    types: any[]
}

export function VehicleFilters({ data }: { data: ParametricData }) {
    const router = useRouter()
    const searchParams = useSearchParams()

    // Collapsible state - persist in localStorage
    const [isExpanded, setIsExpanded] = useState(() => {
        if (typeof window !== 'undefined') {
            const stored = localStorage.getItem('filters-expanded')
            return stored !== null ? stored === 'true' : true
        }
        return true
    })

    // State for filters
    const [brandId, setBrandId] = useState(searchParams.get('brandId') || '')
    const [modelId, setModelId] = useState(searchParams.get('modelId') || '')
    const [categoryId, setCategoryId] = useState(searchParams.get('categoryId') || '')
    const [typeId, setTypeId] = useState(searchParams.get('typeId') || '')
    const [status, setStatus] = useState(searchParams.get('status') || '')

    const [minYear, setMinYear] = useState(searchParams.get('minYear') || '')
    const [maxYear, setMaxYear] = useState(searchParams.get('maxYear') || '')
    const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '')
    const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '')

    // Debounce range inputs
    const [debouncedMinYear] = useDebounce(minYear, 500)
    const [debouncedMaxYear] = useDebounce(maxYear, 500)
    const [debouncedMinPrice] = useDebounce(minPrice, 500)
    const [debouncedMaxPrice] = useDebounce(maxPrice, 500)

    // Persist collapsed state
    useEffect(() => {
        if (typeof window !== 'undefined') {
            localStorage.setItem('filters-expanded', isExpanded.toString())
        }
    }, [isExpanded])

    // Derived state for models based on selected brand
    const filteredModels = brandId
        ? data.models.filter(m => m.brand_id === brandId)
        : data.models

    // Count active filters
    const activeFiltersCount = useMemo(() => {
        let count = 0
        if (brandId) count++
        if (modelId) count++
        if (categoryId && categoryId !== 'all') count++
        if (typeId && typeId !== 'all') count++
        if (status && status !== 'all') count++
        if (minYear && minYear !== '2000') count++
        if (maxYear && maxYear !== '2030') count++
        if (minPrice && minPrice !== '0') count++
        if (maxPrice && maxPrice !== '200000000') count++
        return count
    }, [brandId, modelId, categoryId, typeId, status, minYear, maxYear, minPrice, maxPrice])

    // Get active filter badges
    const activeFilterBadges = useMemo(() => {
        const badges: Array<{ id: string; label: string; onRemove: () => void }> = []

        if (brandId) {
            const brand = data.brands.find(b => b.id === brandId)
            badges.push({
                id: 'brand',
                label: `Marca: ${brand?.name || 'N/A'}`,
                onRemove: () => {
                    setBrandId('')
                    setModelId('')
                }
            })
        }

        if (modelId) {
            const model = filteredModels.find(m => m.id === modelId)
            badges.push({
                id: 'model',
                label: `Modelo: ${model?.name || 'N/A'}`,
                onRemove: () => setModelId('')
            })
        }

        if (categoryId && categoryId !== 'all') {
            const category = data.categories.find(c => c.id === categoryId)
            badges.push({
                id: 'category',
                label: `Condición: ${category?.name || 'N/A'}`,
                onRemove: () => setCategoryId('')
            })
        }

        if (typeId && typeId !== 'all') {
            const type = data.types.find(t => t.id === typeId)
            badges.push({
                id: 'type',
                label: `Tipo: ${type?.name || 'N/A'}`,
                onRemove: () => setTypeId('')
            })
        }

        if (status && status !== 'all') {
            const statusLabels: Record<string, string> = {
                available: 'Disponible',
                sold: 'Vendido',
                reserved: 'Reservado'
            }
            badges.push({
                id: 'status',
                label: `Estado: ${statusLabels[status] || status}`,
                onRemove: () => setStatus('')
            })
        }

        if (minYear && minYear !== '2000') {
            badges.push({
                id: 'minYear',
                label: `Año desde: ${minYear}`,
                onRemove: () => setMinYear('')
            })
        }

        if (maxYear && maxYear !== '2030') {
            badges.push({
                id: 'maxYear',
                label: `Año hasta: ${maxYear}`,
                onRemove: () => setMaxYear('')
            })
        }

        if (minPrice && minPrice !== '0') {
            badges.push({
                id: 'minPrice',
                label: `Precio desde: Gs. ${parseInt(minPrice).toLocaleString('es-PY')}`,
                onRemove: () => setMinPrice('')
            })
        }

        if (maxPrice && maxPrice !== '200000000') {
            badges.push({
                id: 'maxPrice',
                label: `Precio hasta: Gs. ${parseInt(maxPrice).toLocaleString('es-PY')}`,
                onRemove: () => setMaxPrice('')
            })
        }

        return badges
    }, [brandId, modelId, categoryId, typeId, status, minYear, maxYear, minPrice, maxPrice, data, filteredModels])

    // Effect to update URL
    useEffect(() => {
        const params = new URLSearchParams(searchParams.toString())

        if (brandId) params.set('brandId', brandId)
        else params.delete('brandId')

        if (modelId) params.set('modelId', modelId)
        else params.delete('modelId')

        if (categoryId && categoryId !== 'all') params.set('categoryId', categoryId)
        else params.delete('categoryId')

        if (typeId && typeId !== 'all') params.set('typeId', typeId)
        else params.delete('typeId')

        if (status && status !== 'all') params.set('status', status)
        else params.delete('status')

        if (debouncedMinYear) params.set('minYear', debouncedMinYear)
        else params.delete('minYear')

        if (debouncedMaxYear) params.set('maxYear', debouncedMaxYear)
        else params.delete('maxYear')

        if (debouncedMinPrice) params.set('minPrice', debouncedMinPrice)
        else params.delete('minPrice')

        if (debouncedMaxPrice) params.set('maxPrice', debouncedMaxPrice)
        else params.delete('maxPrice')

        router.replace(`?${params.toString()}`)
    }, [
        brandId,
        modelId,
        categoryId,
        typeId,
        status,
        debouncedMinYear,
        debouncedMaxYear,
        debouncedMinPrice,
        debouncedMaxPrice,
        router,
        searchParams
    ])

    const clearFilters = () => {
        setBrandId('')
        setModelId('')
        setCategoryId('')
        setTypeId('')
        setStatus('')
        setMinYear('')
        setMaxYear('')
        setMinPrice('')
        setMaxPrice('')
        router.replace('?')
    }

    const [openBrand, setOpenBrand] = useState(false)
    const [openModel, setOpenModel] = useState(false)

    return (
        <div className="space-y-3 p-4 border rounded-lg bg-card shadow-sm transition-all duration-200 hover:shadow-md">
            {/* Header with collapse button */}
            <div className="flex items-center justify-between">
                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="flex items-center gap-2 hover:opacity-70 transition-opacity"
                >
                    <h3 className="font-semibold text-sm">Filtros Avanzados</h3>
                    {activeFiltersCount > 0 && (
                        <Badge variant="secondary" className="h-5 min-w-[20px] flex items-center justify-center text-xs">
                            {activeFiltersCount}
                        </Badge>
                    )}
                    {isExpanded ? (
                        <ChevronUp className="h-4 w-4 text-muted-foreground" />
                    ) : (
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    )}
                </button>
                {activeFiltersCount > 0 && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={clearFilters}
                        className="h-8 px-2 lg:px-3 hover:bg-destructive/10 hover:text-destructive transition-colors"
                    >
                        <FilterX className="mr-2 h-4 w-4" />
                        Limpiar Todo
                    </Button>
                )}
            </div>

            {/* Active filter badges - always visible */}
            {activeFilterBadges.length > 0 && !isExpanded && (
                <div className="flex flex-wrap gap-2 animate-in fade-in-50 duration-200">
                    {activeFilterBadges.map((badge) => (
                        <Badge
                            key={badge.id}
                            variant="secondary"
                            className="pl-2 pr-1 py-1 text-xs flex items-center gap-1 hover:bg-secondary/80 transition-colors"
                        >
                            <span>{badge.label}</span>
                            <button
                                onClick={badge.onRemove}
                                className="ml-1 h-4 w-4 rounded-full hover:bg-background/20 flex items-center justify-center transition-colors"
                            >
                                <X className="h-3 w-3" />
                            </button>
                        </Badge>
                    ))}
                </div>
            )}

            {/* Filters content - collapsible */}
            <div
                className={cn(
                    "grid transition-all duration-300 ease-in-out",
                    isExpanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                )}
            >
                <div className="overflow-hidden">
                    <div className="space-y-4 pt-2">
                        {/* Active filter badges - in expanded view */}
                        {activeFilterBadges.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                                {activeFilterBadges.map((badge) => (
                                    <Badge
                                        key={badge.id}
                                        variant="secondary"
                                        className="pl-2 pr-1 py-1 text-xs flex items-center gap-1 hover:bg-secondary/80 transition-colors"
                                    >
                                        <span>{badge.label}</span>
                                        <button
                                            onClick={badge.onRemove}
                                            className="ml-1 h-4 w-4 rounded-full hover:bg-background/20 flex items-center justify-center transition-colors"
                                        >
                                            <X className="h-3 w-3" />
                                        </button>
                                    </Badge>
                                ))}
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {/* Brand */}
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label className="text-xs font-medium">Marca</Label>
                                    {brandId && (
                                        <button
                                            onClick={() => {
                                                setBrandId('')
                                                setModelId('')
                                            }}
                                            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                                        >
                                            <X className="h-3 w-3" />
                                        </button>
                                    )}
                                </div>
                                <Popover open={openBrand} onOpenChange={setOpenBrand}>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            role="combobox"
                                            aria-expanded={openBrand}
                                            className={cn(
                                                "w-full justify-between h-9 text-xs transition-all",
                                                brandId && "border-primary ring-1 ring-primary/20"
                                            )}
                                        >
                                            {brandId
                                                ? data.brands.find((brand) => brand.id === brandId)?.name
                                                : "Todas las marcas..."}
                                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-[200px] p-0">
                                        <Command>
                                            <CommandInput placeholder="Buscar marca..." />
                                            <CommandList>
                                                <CommandEmpty>No encontrado.</CommandEmpty>
                                                <CommandGroup>
                                                    <CommandItem
                                                        value="all"
                                                        onSelect={() => {
                                                            setBrandId("")
                                                            setModelId("")
                                                            setOpenBrand(false)
                                                        }}
                                                    >
                                                        <Check
                                                            className={cn(
                                                                "mr-2 h-4 w-4",
                                                                brandId === "" ? "opacity-100" : "opacity-0"
                                                            )}
                                                        />
                                                        Todas
                                                    </CommandItem>
                                                    {data.brands.map((brand) => (
                                                        <CommandItem
                                                            key={brand.id}
                                                            value={brand.name}
                                                            onSelect={() => {
                                                                setBrandId(brand.id === brandId ? "" : brand.id)
                                                                setModelId("")
                                                                setOpenBrand(false)
                                                            }}
                                                        >
                                                            <Check
                                                                className={cn(
                                                                    "mr-2 h-4 w-4",
                                                                    brandId === brand.id ? "opacity-100" : "opacity-0"
                                                                )}
                                                            />
                                                            {brand.name}
                                                        </CommandItem>
                                                    ))}
                                                </CommandGroup>
                                            </CommandList>
                                        </Command>
                                    </PopoverContent>
                                </Popover>
                            </div>

                            {/* Model */}
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label className="text-xs font-medium">Modelo</Label>
                                    {modelId && (
                                        <button
                                            onClick={() => setModelId('')}
                                            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                                        >
                                            <X className="h-3 w-3" />
                                        </button>
                                    )}
                                </div>
                                <Popover open={openModel} onOpenChange={setOpenModel}>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            role="combobox"
                                            aria-expanded={openModel}
                                            className={cn(
                                                "w-full justify-between h-9 text-xs transition-all",
                                                modelId && "border-primary ring-1 ring-primary/20"
                                            )}
                                            disabled={!brandId}
                                        >
                                            {modelId
                                                ? filteredModels.find((model) => model.id === modelId)?.name
                                                : "Todos los modelos..."}
                                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-[200px] p-0">
                                        <Command>
                                            <CommandInput placeholder="Buscar modelo..." />
                                            <CommandList>
                                                <CommandEmpty>No encontrado.</CommandEmpty>
                                                <CommandGroup>
                                                    <CommandItem
                                                        value="all"
                                                        onSelect={() => {
                                                            setModelId("")
                                                            setOpenModel(false)
                                                        }}
                                                    >
                                                        <Check
                                                            className={cn(
                                                                "mr-2 h-4 w-4",
                                                                modelId === "" ? "opacity-100" : "opacity-0"
                                                            )}
                                                        />
                                                        Todos
                                                    </CommandItem>
                                                    {filteredModels.map((model) => (
                                                        <CommandItem
                                                            key={model.id}
                                                            value={model.name}
                                                            onSelect={() => {
                                                                setModelId(model.id === modelId ? "" : model.id)
                                                                setOpenModel(false)
                                                            }}
                                                        >
                                                            <Check
                                                                className={cn(
                                                                    "mr-2 h-4 w-4",
                                                                    modelId === model.id ? "opacity-100" : "opacity-0"
                                                                )}
                                                            />
                                                            {model.name}
                                                        </CommandItem>
                                                    ))}
                                                </CommandGroup>
                                            </CommandList>
                                        </Command>
                                    </PopoverContent>
                                </Popover>
                            </div>

                            {/* Category (Condition) */}
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label className="text-xs font-medium">Condición</Label>
                                    {categoryId && categoryId !== 'all' && (
                                        <button
                                            onClick={() => setCategoryId('')}
                                            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                                        >
                                            <X className="h-3 w-3" />
                                        </button>
                                    )}
                                </div>
                                <Select value={categoryId} onValueChange={setCategoryId}>
                                    <SelectTrigger className={cn(
                                        "h-9 text-xs transition-all",
                                        categoryId && categoryId !== 'all' && "border-primary ring-1 ring-primary/20"
                                    )}>
                                        <SelectValue placeholder="Todas" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Todas</SelectItem>
                                        {data.categories.map((c) => (
                                            <SelectItem key={c.id} value={c.id}>
                                                {c.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Type */}
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label className="text-xs font-medium">Tipo</Label>
                                    {typeId && typeId !== 'all' && (
                                        <button
                                            onClick={() => setTypeId('')}
                                            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                                        >
                                            <X className="h-3 w-3" />
                                        </button>
                                    )}
                                </div>
                                <Select value={typeId} onValueChange={setTypeId}>
                                    <SelectTrigger className={cn(
                                        "h-9 text-xs transition-all",
                                        typeId && typeId !== 'all' && "border-primary ring-1 ring-primary/20"
                                    )}>
                                        <SelectValue placeholder="Todos" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Todos</SelectItem>
                                        {data.types.map((t) => (
                                            <SelectItem key={t.id} value={t.id}>
                                                {t.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {/* Status */}
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label className="text-xs font-medium">Estado</Label>
                                    {status && status !== 'all' && (
                                        <button
                                            onClick={() => setStatus('')}
                                            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                                        >
                                            <X className="h-3 w-3" />
                                        </button>
                                    )}
                                </div>
                                <Select value={status} onValueChange={setStatus}>
                                    <SelectTrigger className={cn(
                                        "h-9 text-xs transition-all",
                                        status && status !== 'all' && "border-primary ring-1 ring-primary/20"
                                    )}>
                                        <SelectValue placeholder="Todos" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Todos</SelectItem>
                                        <SelectItem value="available">Disponible</SelectItem>
                                        <SelectItem value="sold">Vendido</SelectItem>
                                        <SelectItem value="reserved">Reservado</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Year Range with Slider */}
                            <div className="space-y-3 col-span-1 lg:col-span-1">
                                <div className="flex items-center justify-between">
                                    <Label className="text-xs font-medium">Año</Label>
                                    {(minYear && minYear !== '2000') || (maxYear && maxYear !== '2030') ? (
                                        <button
                                            onClick={() => {
                                                setMinYear('')
                                                setMaxYear('')
                                            }}
                                            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                                        >
                                            <X className="h-3 w-3" />
                                        </button>
                                    ) : null}
                                </div>
                                <div className="space-y-3">
                                    <Slider
                                        min={2000}
                                        max={2030}
                                        step={1}
                                        value={[
                                            minYear ? parseInt(minYear) : 2000,
                                            maxYear ? parseInt(maxYear) : 2030
                                        ]}
                                        onValueChange={(values) => {
                                            setMinYear(values[0].toString())
                                            setMaxYear(values[1].toString())
                                        }}
                                        className="w-full"
                                    />
                                    <div className="flex items-center justify-between text-xs font-medium text-muted-foreground">
                                        <span>{minYear || '2000'}</span>
                                        <span>{maxYear || '2030'}</span>
                                    </div>
                                    <div className="flex gap-2">
                                        <Input
                                            placeholder="Min"
                                            type="number"
                                            min={2000}
                                            max={2030}
                                            className={cn(
                                                "h-9 text-xs transition-all",
                                                minYear && minYear !== '2000' && "border-primary ring-1 ring-primary/20"
                                            )}
                                            value={minYear}
                                            onChange={(e) => setMinYear(e.target.value)}
                                        />
                                        <Input
                                            placeholder="Max"
                                            type="number"
                                            min={2000}
                                            max={2030}
                                            className={cn(
                                                "h-9 text-xs transition-all",
                                                maxYear && maxYear !== '2030' && "border-primary ring-1 ring-primary/20"
                                            )}
                                            value={maxYear}
                                            onChange={(e) => setMaxYear(e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Price Range with Slider */}
                            <div className="space-y-3 col-span-1 lg:col-span-2">
                                <div className="flex items-center justify-between">
                                    <Label className="text-xs font-medium">Precio (Gs)</Label>
                                    {(minPrice && minPrice !== '0') || (maxPrice && maxPrice !== '200000000') ? (
                                        <button
                                            onClick={() => {
                                                setMinPrice('')
                                                setMaxPrice('')
                                            }}
                                            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                                        >
                                            <X className="h-3 w-3" />
                                        </button>
                                    ) : null}
                                </div>
                                <div className="space-y-3">
                                    <Slider
                                        min={0}
                                        max={200000000}
                                        step={1000000}
                                        value={[
                                            minPrice ? parseInt(minPrice) : 0,
                                            maxPrice ? parseInt(maxPrice) : 200000000
                                        ]}
                                        onValueChange={(values) => {
                                            setMinPrice(values[0].toString())
                                            setMaxPrice(values[1].toString())
                                        }}
                                        className="w-full"
                                    />
                                    <div className="flex items-center justify-between text-xs font-medium text-muted-foreground">
                                        <span>Gs. {(minPrice ? parseInt(minPrice) : 0).toLocaleString('es-PY')}</span>
                                        <span>Gs. {(maxPrice ? parseInt(maxPrice) : 200000000).toLocaleString('es-PY')}</span>
                                    </div>
                                    <div className="flex gap-2">
                                        <Input
                                            placeholder="Mínimo"
                                            type="number"
                                            step={1000000}
                                            className={cn(
                                                "h-9 text-xs transition-all",
                                                minPrice && minPrice !== '0' && "border-primary ring-1 ring-primary/20"
                                            )}
                                            value={minPrice}
                                            onChange={(e) => setMinPrice(e.target.value)}
                                        />
                                        <Input
                                            placeholder="Máximo"
                                            type="number"
                                            step={1000000}
                                            className={cn(
                                                "h-9 text-xs transition-all",
                                                maxPrice && maxPrice !== '200000000' && "border-primary ring-1 ring-primary/20"
                                            )}
                                            value={maxPrice}
                                            onChange={(e) => setMaxPrice(e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
