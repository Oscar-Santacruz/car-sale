'use client'

import { Search, Calendar as CalendarIcon } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { DateRange } from "react-day-picker"
import { Calendar } from "@/components/ui/calendar"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { es } from "date-fns/locale"

export type FilterPeriod = 'today' | 'week' | 'month' | 'all'

export interface CollectionsToolbarProps {
    searchTerm: string
    onSearchChange: (value: string) => void
    period: FilterPeriod
    onPeriodChange: (period: FilterPeriod) => void
    dateRange: DateRange | undefined
    onDateRangeChange: (range: DateRange | undefined) => void
}

export function CollectionsToolbar({
    searchTerm,
    onSearchChange,
    period,
    onPeriodChange,
    dateRange,
    onDateRangeChange,
}: CollectionsToolbarProps) {
    return (
        <div className="flex flex-col gap-4 p-1">
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                <div className="relative w-full sm:w-[350px]">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Buscar por Cliente, Vehículo, CI..."
                        className="pl-9 w-full"
                        value={searchTerm}
                        onChange={(e) => onSearchChange(e.target.value)}
                    />
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">

                    <div className="flex items-center gap-1 bg-muted p-1 rounded-lg w-full sm:w-auto overflow-x-auto">
                        <Button
                            variant={period === 'today' ? 'default' : 'ghost'}
                            size="sm"
                            onClick={() => onPeriodChange('today')}
                            className="flex-1 sm:flex-none"
                        >
                            Hoy
                        </Button>
                        <Button
                            variant={period === 'week' ? 'default' : 'ghost'}
                            size="sm"
                            onClick={() => onPeriodChange('week')}
                            className="flex-1 sm:flex-none"
                        >
                            Semana
                        </Button>
                        <Button
                            variant={period === 'month' ? 'default' : 'ghost'}
                            size="sm"
                            onClick={() => onPeriodChange('month')}
                            className="flex-1 sm:flex-none"
                        >
                            Mes
                        </Button>
                        <Button
                            variant={period === 'all' ? 'default' : 'ghost'}
                            size="sm"
                            onClick={() => onPeriodChange('all')}
                            className="flex-1 sm:flex-none"
                        >
                            Todos
                        </Button>
                    </div>
                </div>
            </div>

            <div className="flex justify-end">
                <Popover>
                    <PopoverTrigger asChild>
                        <Button
                            variant={"outline"}
                            className={cn(
                                "justify-start text-left font-normal w-full sm:w-[240px]",
                                !dateRange && "text-muted-foreground"
                            )}
                        >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {dateRange?.from ? (
                                dateRange.to ? (
                                    <>
                                        {format(dateRange.from, "LLL dd, y", { locale: es })} -{" "}
                                        {format(dateRange.to, "LLL dd, y", { locale: es })}
                                    </>
                                ) : (
                                    format(dateRange.from, "LLL dd, y", { locale: es })
                                )
                            ) : (
                                <span>Filtrar por Fecha</span>
                            )}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="end">
                        <Calendar
                            initialFocus
                            mode="range"
                            defaultMonth={dateRange?.from}
                            selected={dateRange}
                            onSelect={onDateRangeChange}
                            numberOfMonths={2}
                        />
                    </PopoverContent>
                </Popover>
            </div>
        </div>
    )
}
