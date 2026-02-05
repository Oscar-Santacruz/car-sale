export type Refuerzo = {
    monthIndex: number; // 1-based index of the month
    amount: number;
};

export type AmortizationRow = {
    paymentNumber: number;
    dueDate: Date;
    installmentAmount: number;
    interest: number;
    capital: number;
    balance: number;
    isRefuerzo?: boolean;
};

export function calculateAmortizationSchedule(
    amount: number, // Total amount to finance (Saldo)
    months: number,
    annualInterestRate: number,
    startDate: Date,
    refuerzos: Refuerzo[] = []
): AmortizationRow[] {
    const schedule: AmortizationRow[] = [];
    let currentBalance = amount;
    const monthlyRate = annualInterestRate / 12 / 100;

    // 1. Deduct Refuerzos from the principal to find the base for regular installments?
    // Strategy: If interest is 0, it's simple. (Total - Refuerzos) / Months = Regular Installment.
    // If interest > 0, it's complex. Refuerzos act as balloon payments or specific irregular payments.

    // Simplified logic for this MVP:
    // We assume Refuerzos are "extra" payments on top of regular ones OR they replace them?
    // The requirement says "Gestión de Refuerzos: Opción para cargar manualmente montos ...". 
    // Usuallly in car sales here: You have a fixed price. You say "I pay $X now (Down), and $Y every December (Refuerzo)". The rest is divided in months.
    // So: BaseToAmortize = Amount - Sum(Refuerzos).

    const totalRefuerzos = refuerzos.reduce((sum, r) => sum + r.amount, 0);
    const baseAmortizable = amount - totalRefuerzos;

    if (baseAmortizable < 0) {
        // Error handling or just return 0
        return [];
    }

    // Calculate regular monthly payment
    let regularMonthlyPayment = 0;
    if (monthlyRate === 0) {
        regularMonthlyPayment = baseAmortizable / months;
    } else {
        // PMT formula: P * r * (1+r)^n / ((1+r)^n - 1)
        // Note: This logic assumes Refuerzos don't accrue interest differently or they are at the end? 
        // To be perfectly accurate with interest, we should run a simulation.
        // But for MVP with 0% interest (common) or low interest, we stick to the simple "Subtract then divide" model which is standard in "Playa de Autos" logic often used with direct financing.
        regularMonthlyPayment = (baseAmortizable * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -months));
    }

    for (let i = 1; i <= months; i++) {
        const dueDate = new Date(startDate);
        dueDate.setMonth(startDate.getMonth() + i);

        // Check if there is a Refuerzo for this month (or we treat Refuerzos as separate rows? Usually separate or combined)
        // Let's check if we have a Refuerzo scheduled for this "month index".
        // Actually, usually Refuerzos are "Every 6 months" or "In Dec". 
        // For now, let's just create the regular schedule row.

        // Interest for this period (on the previous balance)
        // Note: If we subtracted Refuerzos upfront from baseAmortizable, the interest calculation might be off if we don't account for the fact that the capital is still there until paid.
        // BUT, commonly, "Refuerzos" are treated as deferred down payments in simple financing.
        // Let's stick to: Installment = RegularPayment.

        let payment = Math.round(regularMonthlyPayment);
        // Recalculate interest/capital based on rounded payment to keep balance consistent-ish? 
        // Or just round everything.
        // Rounding payment is the rule.
        const interest = Math.round(currentBalance * monthlyRate);
        let capital = payment - interest;

        // Adjust last payment to fix rounding errors?
        if (i === months) {
            payment = Math.round(currentBalance + interest);
            capital = currentBalance;
        }

        currentBalance -= capital;

        schedule.push({
            paymentNumber: i,
            dueDate: dueDate,
            installmentAmount: payment,
            interest: interest,
            capital: capital,
            balance: Math.max(0, Math.round(currentBalance)),
            isRefuerzo: false
        });

        const refuerzo = refuerzos.find(r => r.monthIndex === i);
        if (refuerzo) {
            const refuerzoAmount = Math.round(refuerzo.amount);
            schedule[i - 1].installmentAmount += refuerzoAmount;
            schedule[i - 1].capital += refuerzoAmount;
            schedule[i - 1].isRefuerzo = true;

            // Deduct from the running balance so it's not charged again at the end
            currentBalance -= refuerzoAmount;
            schedule[i - 1].balance = Math.max(0, Math.round(currentBalance));
        }
    }

    return schedule;
}
