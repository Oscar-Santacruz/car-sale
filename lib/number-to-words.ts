
export function numberToWords(num: number): string {
    if (num === 0) return "CERO";

    const unidades = ["", "UN", "DOS", "TRES", "CUATRO", "CINCO", "SEIS", "SIETE", "OCHO", "NUEVE"];
    const decenas = ["", "DIEZ", "VEINTE", "TREINTA", "CUARENTA", "CINCUENTA", "SESENTA", "SETENTA", "OCHENTA", "NOVENTA"];
    const diez_veinte = ["DIEZ", "ONCE", "DOCE", "TRECE", "CATORCE", "QUINCE", "DIECISEIS", "DIECISIETE", "DIECIOCHO", "DIECINUEVE"];
    const veintenas = ["VEINTE", "VEINTIUN", "VEINTIDOS", "VEINTITRES", "VEINTICUATRO", "VEINTICINCO", "VEINTISEIS", "VEINTISIETE", "VEINTIOCHO", "VEINTINUEVE"];
    const centenas = ["", "CIENTO", "DOSCIENTOS", "TRESCIENTOS", "CUATROCIENTOS", "QUINIENTOS", "SEISCIENTOS", "SETECIENTOS", "OCHOCIENTOS", "NOVECIENTOS"];

    function convertGroup(n: number): string {
        let output = "";

        if (n === 100) return "CIEN";

        // Centenas
        const c = Math.floor(n / 100);
        const remainder = n % 100;
        if (c > 0) output += centenas[c] + " ";

        // Decenas y Unidades
        if (remainder > 0) {
            if (remainder < 10) {
                output += unidades[remainder];
            } else if (remainder >= 10 && remainder < 20) {
                output += diez_veinte[remainder - 10];
            } else if (remainder >= 20 && remainder < 30) {
                output += veintenas[remainder - 20];
            } else {
                const d = Math.floor(remainder / 10);
                const u = remainder % 10;
                output += decenas[d];
                if (u > 0) output += " Y " + unidades[u];
            }
        }

        return output.trim();
    }

    let words = "";

    // Millones
    const millones = Math.floor(num / 1000000);
    const restoMillones = num % 1000000;

    if (millones > 0) {
        if (millones === 1) {
            words += "UN MILLON ";
        } else {
            words += convertGroup(millones) + " MILLONES ";
        }
    }

    // Miles
    const miles = Math.floor(restoMillones / 1000);
    const restoMiles = restoMillones % 1000;

    if (miles > 0) {
        if (miles === 1) {
            words += "MIL ";
        } else {
            words += convertGroup(miles) + " MIL ";
        }
    }

    // Unidades finales
    if (restoMiles > 0) {
        words += convertGroup(restoMiles);
    }

    return words.trim();
}
