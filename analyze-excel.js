const XLSX = require('xlsx');
const path = require('path');

const filePath = path.join(process.cwd(), 'planilla 06 de junio (1).xlsm');

try {
    console.log('Reading file:', filePath);
    const workbook = XLSX.readFile(filePath);

    // Sheets of interest
    const targetSheets = ["AT", "CLIENTES", "VENTAS", "PAGOS"];

    targetSheets.forEach(sheetName => {
        console.log(`\n================================`);
        console.log(`SHEET: ${sheetName}`);
        console.log(`================================`);

        if (workbook.Sheets[sheetName]) {
            const worksheet = workbook.Sheets[sheetName];
            // Get raw JSON 2D array
            const json = XLSX.utils.sheet_to_json(worksheet, { header: 1, range: 0, defval: '' });

            // Print first 10 rows to identify headers
            console.log(`First 10 rows:`);
            json.slice(0, 10).forEach((row, i) => {
                console.log(`[Row ${i}]`, JSON.stringify(row));
            });
        } else {
            console.log(`!!! Sheet not found !!!`);
        }
    });

} catch (error) {
    console.error('Error reading excel:', error);
}
