
import { differenceInDays, parseISO, startOfDay } from "date-fns"

export type Installment = {
    id: string
    number: number
    due_date: string
    amount: number
    status: string | 'pending' | 'paid' | 'partial'
    payment_date?: string | null
    sale_id?: string
}

/**
 * Calculates the number of days an installment is overdue.
 * Returns 0 if not overdue.
 */
export function calculateDaysOverdue(dueDate: string | Date): number {
    const due = typeof dueDate === 'string' ? parseISO(dueDate) : dueDate
    const today = startOfDay(new Date())

    // If due date is in the future or today, it's not overdue
    if (due >= today) return 0

    return differenceInDays(today, due)
}

/**
 * Calculates the total amount overdue from a list of installments.
 * Only considers installments with status != 'paid' and due_date < today.
 */
export function calculateTotalOverdue(installments: Installment[]): number {
    const today = startOfDay(new Date())

    return installments.reduce((total, inst) => {
        // Skip if paid
        if (inst.status === 'paid') return total

        // Check if overdue
        const due = parseISO(inst.due_date)
        if (due < today) {
            return total + Number(inst.amount)
        }

        return total
    }, 0)
}

/**
 * Counts the number of overdue installments.
 */
export function countOverdueInstallments(installments: Installment[]): number {
    const today = startOfDay(new Date())

    return installments.filter(inst => {
        if (inst.status === 'paid') return false
        const due = parseISO(inst.due_date)
        return due < today
    }).length
}

/**
 * Calculates the average days overdue for overdue installments.
 */
export function calculateAverageDaysOverdue(installments: Installment[]): number {
    const overdueInstallments = installments.filter(inst => {
        if (inst.status === 'paid') return false
        return calculateDaysOverdue(inst.due_date) > 0
    })

    if (overdueInstallments.length === 0) return 0

    const totalDays = overdueInstallments.reduce((sum, inst) => {
        return sum + calculateDaysOverdue(inst.due_date)
    }, 0)

    return Math.round(totalDays / overdueInstallments.length)
}

/**
 * Gets the maximum days overdue from a list of installments.
 * Useful for "Días de mora" metric (usually based on the oldest unpaid installment).
 */
export function getMaxDaysOverdue(installments: Installment[]): number {
    let maxDays = 0

    installments.forEach(inst => {
        if (inst.status === 'paid') return
        const days = calculateDaysOverdue(inst.due_date)
        if (days > maxDays) maxDays = days
    })

    return maxDays
}
