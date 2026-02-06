import { calculateAmortizationSchedule, Refuerzo } from './lib/financing';

// Test case from the user image
const amount = 8000000; // 10 cuotas * 800.000 (roughly, assuming 0 interest for simplicity to see the math)
// Actually in the image:
// Cuota 1-5: 800.000
// Cuota 6: 2.800.000 (2.000.000 refuerzo + 800.000 cuota?)
// Cuota 7-9: 800.000
// Cuota 10: 2.800.000 (Incorrect)
// Total 10 cuotas. 
// If cuotas are 800.000, and there is one refuerzo of 2.000.000.
// Total principal = 10 * 800.000 + 2.000.000 = 10.000.000
// Let's try simulating: Amount = 10.000.000, 10 months, 0% interest.
// Refuerzo at month 6 of 2.000.000.

const totalAmount = 10000000;
const months = 10;
const rate = 0;
const startDate = new Date('2026-02-04');
const refuerzos: Refuerzo[] = [{ date: '2026-08-04', amount: 2000000 }];

const schedule = calculateAmortizationSchedule(totalAmount, months, rate, startDate, refuerzos);

console.log("Schedule:");
schedule.forEach(row => {
    console.log(`Month ${row.paymentNumber}: Payment=${row.installmentAmount}, Capital=${row.capital}, Balance=${row.balance}, IsRefuerzo=${row.isRefuerzo}`);
});
