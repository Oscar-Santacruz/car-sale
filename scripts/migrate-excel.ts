
import * as XLSX from 'xlsx';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const sqlFile = path.join(process.cwd(), 'scripts', 'migration.sql');
const filePath = path.join(process.cwd(), 'planilla 06 de junio (1).xlsm');

function escape(str: any): string {
    if (str === null || str === undefined || str === '') return 'NULL';
    return `'${String(str).replace(/'/g, "''").trim()}'`;
}

function escapeNum(val: any): string {
    if (val === null || val === undefined || val === '') return '0';
    return String(Number(val));
}

async function main() {
    console.log("Generating migration.sql...");
    const workbook = XLSX.readFile(filePath);
    const sqlStatements: string[] = [];

    const orgId = '28dabdb4-8728-4365-a898-1a15df4f599d';

    sqlStatements.push(`-- Migration generated at ${new Date().toISOString()}`);

    // 2. Clients
    const clientsSheet = workbook.Sheets['CLIENTES'];
    if (clientsSheet) {
        const clients = XLSX.utils.sheet_to_json(clientsSheet, { header: 1 });
        console.log(`Processing ${clients.length} clients...`);

        for (let i = 1; i < clients.length; i++) {
            const row = clients[i] as any[];
            if (!row || row.length === 0) continue;

            const ci = row[1] ? String(row[1]).trim() : null;
            if (!ci) continue;

            const name = escape(row[3]);
            const ruc = escape(row[2]);
            const address = escape(row[4]);
            const phone = escape(row[5]);
            const email = escape(row[6]);
            const details = escape(row[10]);

            sqlStatements.push(`
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM clients WHERE ci = '${ci}') THEN
        UPDATE clients SET name=${name}, phone=${phone}, email=${email}, ruc=${ruc}, address=${address}, details=${details} WHERE ci = '${ci}';
    ELSE
        INSERT INTO clients (organization_id, ci, name, ruc, address, phone, email, details)
        VALUES ('${orgId}', '${ci}', ${name}, ${ruc}, ${address}, ${phone}, ${email}, ${details});
    END IF;
END $$;
`);
        }
    }

    // 3. Vehicles
    const stockSheet = workbook.Sheets['AT'];
    if (stockSheet) {
        const rows = XLSX.utils.sheet_to_json(stockSheet, { header: 1 });
        console.log(`Processing ${rows.length} vehicles...`);

        for (let i = 1; i < rows.length; i++) {
            const row = rows[i] as any[];
            if (!row || row.length === 0) continue;

            const cod = row[0];
            if (!cod) continue;

            const brandName = escape(String(row[1] || 'Unknown').trim().toUpperCase());
            const modelName = escape(String(row[2] || 'Unknown').trim().toUpperCase());

            const statusRaw = String(row[19] || '').trim();
            const status = (statusRaw === 'SOLD' || statusRaw === 'VENDIDO') ? 'sold' : 'available';

            const year = escapeNum(row[3]);
            const plate = escape(row[4]);
            const color = escape(row[5]);
            const vin = escape(row[6]);
            const motor = escape(row[7]);
            const details = escape(row[8]);
            const listPrice = escapeNum(row[10]);
            const totalCost = escapeNum(row[11]);

            sqlStatements.push(`
DO $$
DECLARE
    v_org_id uuid := '${orgId}';
    v_brand_id uuid;
    v_model_id uuid;
    v_vehicle_id uuid;
    v_client_id uuid;
    v_sale_id uuid;
BEGIN
    -- Ensure Brand
    SELECT id INTO v_brand_id FROM brands WHERE name = ${brandName} LIMIT 1;
    IF v_brand_id IS NULL THEN
        INSERT INTO brands (organization_id, name) VALUES (v_org_id, ${brandName}) RETURNING id INTO v_brand_id;
    END IF;

    -- Ensure Model
    SELECT id INTO v_model_id FROM models WHERE brand_id = v_brand_id AND name = ${modelName} LIMIT 1;
    IF v_model_id IS NULL THEN
        INSERT INTO models (organization_id, brand_id, name) VALUES (v_org_id, v_brand_id, ${modelName}) RETURNING id INTO v_model_id;
    END IF;
    
    -- Ensure Vehicle
    SELECT id INTO v_vehicle_id FROM vehicles WHERE cod = '${cod}' LIMIT 1;
    IF v_vehicle_id IS NULL THEN
        INSERT INTO vehicles (organization_id, cod, brand_id, model_id, year, plate, color, chassis_number, motor_number, details, list_price, total_cost, status, brand, model)
        VALUES (v_org_id, '${cod}', v_brand_id, v_model_id, ${year}, ${plate}, ${color}, ${vin}, ${motor}, ${details}, ${listPrice}, ${totalCost}, '${status}', ${brandName}, ${modelName})
        RETURNING id INTO v_vehicle_id;
    ELSE
        UPDATE vehicles SET status = '${status}', list_price = ${listPrice}, total_cost = ${totalCost} WHERE id = v_vehicle_id;
    END IF;

    -- Sales Logic
    IF '${status}' = 'sold' THEN
`);

            if (status === 'sold') {
                const ci = row[13] ? String(row[13]).trim() : null;
                if (ci) {
                    const saleDate = escape(row[9] || new Date().toISOString());
                    const downPayment = escapeNum(row[15]);
                    const balance = escapeNum(row[16]);
                    const totalAmount = escapeNum(row[17] || row[10]);

                    const numCuotas = Number(row[27] || 0);

                    let firstDueDateStr = new Date().toISOString();
                    const rawDate = row[18];
                    if (typeof rawDate === 'number') {
                        const date = new Date(Math.round((rawDate - 25569) * 86400 * 1000));
                        firstDueDateStr = date.toISOString();
                    } else if (rawDate) {
                        firstDueDateStr = String(rawDate);
                    }
                    const firstDueDateEscaped = escape(firstDueDateStr);

                    sqlStatements.push(`
        SELECT id INTO v_client_id FROM clients WHERE ci = '${ci}' LIMIT 1;
        
        IF v_client_id IS NOT NULL THEN
            SELECT id INTO v_sale_id FROM sales WHERE vehicle_id = v_vehicle_id LIMIT 1;

            IF v_sale_id IS NULL THEN
                INSERT INTO sales (organization_id, client_id, vehicle_id, sale_date, total_amount, down_payment, balance, status)
                VALUES (v_org_id, v_client_id, v_vehicle_id, ${saleDate}, ${totalAmount}, ${downPayment}, ${balance}, 'active')
                RETURNING id INTO v_sale_id;
                
                IF ${escapeNum(balance)} > 0 AND ${numCuotas} > 0 THEN
                     FOR i IN 1..${numCuotas} LOOP
                        INSERT INTO installments (sale_id, installment_number, amount, due_date, status)
                        VALUES (v_sale_id, i, ROUND(${escapeNum(balance)} / ${numCuotas}), ${firstDueDateEscaped}::date + (i - 1) * interval '1 month', 'pending');
                     END LOOP;
                END IF;
            END IF;
        END IF;
`);
                }
            }

            sqlStatements.push(`
    END IF;
END $$;
`);
        }
    }

    fs.writeFileSync(sqlFile, sqlStatements.join('\n'));
    console.log(`Generated ${sqlStatements.length} SQL blocks in ${sqlFile}`);
}

main().catch(console.error);
