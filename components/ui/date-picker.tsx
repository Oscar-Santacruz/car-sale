"use client"

import * as React from "react"
import { isValid, parse, format as formatDate } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"
import { es } from "date-fns/locale"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Input } from "@/components/ui/input"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"

interface DatePickerProps {
    date?: Date
    setDate: (date?: Date) => void
    label?: string
    placeholder?: string
    className?: string
    size?: "default" | "sm" | "lg" | "icon"
}

export function DatePicker({ date, setDate, label, placeholder, className, size = "default" }: DatePickerProps) {
    const [inputValue, setInputValue] = React.useState("")

    // Sync input value with external date changes
    React.useEffect(() => {
        if (date && isValid(date)) {
            setInputValue(formatDate(date, "dd/MM/yyyy"))
        } else {
            setInputValue("")
        }
    }, [date])

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value
        setInputValue(val)

        // Try to parse DD/MM/YYYY
        if (val.length === 10) {
            const parsedDate = parse(val, "dd/MM/yyyy", new Date())
            if (isValid(parsedDate)) {
                setDate(parsedDate)
            }
        }
    }

    const handleBlur = () => {
        if (!inputValue) {
            setDate(undefined)
            return
        }
        const parsedDate = parse(inputValue, "dd/MM/yyyy", new Date())
        if (isValid(parsedDate)) {
            setDate(parsedDate)
        } else {
            // Revert to current date if invalid on blur
            if (date) {
                setInputValue(formatDate(date, "dd/MM/yyyy"))
            } else {
                setInputValue("")
            }
        }
    }

    return (
        <div className={cn(label ? "grid gap-2" : "", className)}>
            {label && <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">{label}</label>}
            <div className="flex gap-1">
                <Input
                    type="text"
                    placeholder={placeholder || "DD/MM/YYYY"}
                    value={inputValue}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    className={cn(
                        "flex-1",
                        size === "sm" ? "h-8 text-xs px-2" : ""
                    )}
                />
                <Popover>
                    <PopoverTrigger asChild>
                        <Button
                            type="button"
                            variant={"outline"}
                            size={size === "sm" ? "icon" : "icon"}
                            className={cn(
                                "shrink-0",
                                size === "sm" ? "h-8 w-8" : "h-10 w-10"
                            )}
                        >
                            <CalendarIcon className="h-4 w-4" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="end">
                        <Calendar
                            mode="single"
                            selected={date}
                            onSelect={(d) => {
                                setDate(d)
                                if (d) setInputValue(formatDate(d, "dd/MM/yyyy"))
                            }}
                            initialFocus
                            locale={es}
                        />
                    </PopoverContent>
                </Popover>
            </div>
        </div>
    )
}
