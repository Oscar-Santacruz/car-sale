'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { startTransition, useEffect, useState } from 'react'

export function MonthYearSelector({
    currentYear,
    currentMonth,
    baseUrl = '/dashboard'
}: {
    currentYear: number
    currentMonth: number
    baseUrl?: string
}) {
    const router = useRouter()
    const searchParams = useSearchParams()

    const [year, setYear] = useState(currentYear.toString())
    const [month, setMonth] = useState(currentMonth.toString())

    // Generate years (current year +/- 5 years)
    const currentYearReal = new Date().getFullYear()
    const years = Array.from({ length: 11 }, (_, i) => currentYearReal - 5 + i)

    const months = [
        'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ]

    const handleChange = (type: 'year' | 'month', value: string) => {
        if (type === 'year') setYear(value)
        else setMonth(value)

        const params = new URLSearchParams(searchParams)
        if (type === 'year') params.set('year', value)
        else params.set('year', year) // Keep current year if changing month

        if (type === 'month') params.set('month', value)
        else params.set('month', month) // Keep current month if changing year

        startTransition(() => {
            router.push(`${baseUrl}?${params.toString()}`)
        })
    }

    // Sync state with props if they change externally (though typically this is driven by URL)
    useEffect(() => {
        setYear(currentYear.toString())
        setMonth(currentMonth.toString())
    }, [currentYear, currentMonth])

    return (
        <div className="flex items-center gap-2 mb-6 bg-card p-2 rounded-lg border w-fit shadow-sm">
            <span className="text-sm font-medium text-muted-foreground ml-2 mr-1">Periodo:</span>
            <Select value={month} onValueChange={(v) => handleChange('month', v)}>
                <SelectTrigger className="w-[140px] border-0 focus:ring-0 shadow-none font-medium">
                    <SelectValue placeholder="Mes" />
                </SelectTrigger>
                <SelectContent>
                    {months.map((m, i) => (
                        <SelectItem key={i} value={i.toString()}>
                            {m}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>

            <div className="h-4 w-[1px] bg-border mx-1" />

            <Select value={year} onValueChange={(v) => handleChange('year', v)}>
                <SelectTrigger className="w-[100px] border-0 focus:ring-0 shadow-none font-medium">
                    <SelectValue placeholder="Año" />
                </SelectTrigger>
                <SelectContent>
                    {years.map((y) => (
                        <SelectItem key={y} value={y.toString()}>
                            {y}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    )
}
