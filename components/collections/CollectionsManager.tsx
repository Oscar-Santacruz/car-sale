'use client'

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { CollectionsToolbar, FilterPeriod } from "./CollectionsToolbar"
import { ClientResultsList } from "./ClientResultsList"
import { DateRange } from "react-day-picker"

// Reuse types from actions, or just any for now since we are simplifying
// Ideally verify import path matches exactly what page.tsx passes
import { ClientSummary } from "@/app/collection-actions"

export function CollectionsManager({ clients: initialItems, settings, bankAccounts = [] }: { clients: any[], settings?: any, bankAccounts?: any[] }) {
    const router = useRouter()

    // Filter State
    const [searchTerm, setSearchTerm] = useState("")
    const [period, setPeriod] = useState<FilterPeriod>('all')
    const [dateRange, setDateRange] = useState<DateRange | undefined>()

    // UI State
    const [filteredItems, setFilteredItems] = useState<any[]>(initialItems)
    const [allItems, setAllItems] = useState<any[]>(initialItems)

    // Load Data Effect
    useEffect(() => {
        // Update allItems if prop changes (e.g. revalidation)
        setAllItems(initialItems)
    }, [initialItems])


    // Filter Logic
    useEffect(() => {
        let result = allItems

        // 1. Search Text
        if (searchTerm) {
            const lowerQuery = searchTerm.toLowerCase()
            result = result.filter(item =>
                item.name.toLowerCase().includes(lowerQuery) ||
                (item.ci && item.ci.includes(searchTerm))
            )
        }

        // 2. Period Logic
        const today = new Date()
        today.setHours(0, 0, 0, 0)

        if (period !== 'all' || dateRange?.from) {
            result = result.filter(item => {
                if (!item.nearestDueDate) return false
                const due = new Date(item.nearestDueDate)
                due.setHours(0, 0, 0, 0)

                // Date Range Strategy
                if (dateRange?.from) {
                    const from = dateRange.from
                    const to = dateRange.to || dateRange.from
                    return due >= from && due <= to
                }

                // Preset Periods
                if (period === 'today') {
                    return due.getTime() <= today.getTime()
                }
                if (period === 'week') {
                    const endOfWeek = new Date(today)
                    endOfWeek.setDate(today.getDate() + 7)
                    return due <= endOfWeek
                }
                if (period === 'month') {
                    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0)
                    return due <= endOfMonth
                }
                return true
            })
        }

        setFilteredItems(result)
    }, [allItems, searchTerm, period, dateRange])


    const handleSelectItem = (id: string) => {
        // Navigate directly to Payment Plan / Sale Detail
        router.push(`/sales/${id}`)
    }

    return (
        <div className="flex flex-col h-[calc(100vh-140px)] gap-4">

            {/* Toolbar */}
            <CollectionsToolbar
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                period={period}
                onPeriodChange={setPeriod}
                dateRange={dateRange}
                onDateRangeChange={setDateRange}
            />

            {/* Results */}
            <div className="flex-1 overflow-auto">
                <ClientResultsList
                    clients={filteredItems}
                    onSelectClient={handleSelectItem}
                />
            </div>
        </div>
    )
}
