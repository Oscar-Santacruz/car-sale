import { test, expect } from '@playwright/test';

/**
 * SUITE DE PRUEBAS E2E - FLUJO COMPLETO DE VENTAS
 * 
 * Casos de Uso:
 * 1. Venta al Contado (Cash Sale)
 * 2. Venta a Crédito sin Refuerzos (Credit Sale - Simple)
 * 3. Venta a Crédito con Refuerzos (Credit Sale - With Extra Payments)
 */

// Test Setup - Login Helper
const login = async (page: any) => {
    await page.goto('/login');
    // Usar credenciales de prueba válidas (ajustar según tu setup)
    await page.getByLabel('Correo Electrónico').fill('admin@test.com');
    await page.getByLabel('Contraseña').fill('test123');
    await page.getByRole('button', { name: 'Iniciar Sesión' }).click();

    // Esperar redirect a dashboard
    await page.waitForURL(/.*dashboard/, { timeout: 10000 });
};

// Helper: Crear Cliente de Prueba
const createTestClient = async (page: any, clientName: string, ci: string) => {
    await page.goto('/clientes');
    await page.getByRole('button', { name: /Nuevo Cliente/i }).click();

    await page.getByLabel('Nombre Completo').fill(clientName);
    await page.getByLabel('CI').fill(ci);
    await page.getByLabel(/Teléfono/i).fill('0981123456');
    await page.getByLabel(/Dirección/i).fill('Asunción, Paraguay');

    await page.getByRole('button', { name: /Guardar/i }).click();
    await page.waitForTimeout(2000); // Esperar guardado
};

// Helper: Crear Vehículo de Prueba
const createTestVehicle = async (page: any, brand: string, model: string, year: number, price: number) => {
    await page.goto('/inventario');
    await page.getByRole('button', { name: /Nuevo Vehículo/i }).click();

    await page.getByLabel(/Marca/i).fill(brand);
    await page.getByLabel(/Modelo/i).fill(model);
    await page.getByLabel(/Año/i).fill(year.toString());
    await page.getByLabel(/Chasis/i).fill(`CHASIS${Date.now()}`);
    await page.getByLabel(/Color/i).fill('Negro');
    await page.getByLabel(/Precio de Lista/i).fill(price.toLocaleString('es-PY'));

    await page.getByRole('button', { name: /Guardar/i }).click();
    await page.waitForTimeout(2000);
};

test.describe('Flujo Completo de Ventas', () => {

    test.beforeEach(async ({ page }) => {
        await login(page);
    });

    test('Caso 1: Venta al Contado', async ({ page }) => {
        // 1. Crear datos de prueba
        const clientName = `Cliente Contado ${Date.now()}`;
        const ci = `${Math.floor(Math.random() * 10000000)}`;
        await createTestClient(page, clientName, ci);

        const brand = 'Toyota';
        const model = 'Hilux';
        const year = 2024;
        const price = 150000000;
        await createTestVehicle(page, brand, model, year, price);

        // 2. Ir a Nueva Venta
        await page.goto('/sales/new');
        await expect(page.getByText('Datos de la Operación')).toBeVisible();

        // 3. Seleccionar Cliente
        await page.getByLabel('Cliente').selectOption({ label: new RegExp(clientName) });

        // 4. Seleccionar Tipo de Venta: Al Contado
        await page.getByLabel('Tipo de Venta').selectOption('contado');

        // 5. Seleccionar Vehículo
        await page.getByLabel('Vehículo').selectOption({ label: new RegExp(`${brand} ${model}`) });

        // 6. Verificar que el precio se autocargó
        const precioInput = page.getByLabel('Precio Venta');
        await expect(precioInput).toHaveValue(price.toLocaleString('es-PY'));

        // 7. Verificar que la entrega inicial = precio total (contado)
        const entregaInput = page.getByLabel('Entrega Inicial');
        await expect(entregaInput).toHaveValue(price.toLocaleString('es-PY'));

        // 8. Verificar Saldo a Financiar = 0
        await expect(page.getByText('Gs. 0')).toBeVisible(); // Saldo

        // 9. Seleccionar Forma de Pago
        await page.getByLabel('Forma de Pago').selectOption('cash');

        // 10. Guardar Venta
        await page.getByRole('button', { name: 'Guardar Venta' }).click();

        // 11. Verificar redirección exitosa
        await page.waitForURL(/.*sales/, { timeout: 15000 });

        // 12. Verificar que aparece en el listado
        await expect(page.getByText(clientName)).toBeVisible();
    });

    test('Caso 2: Venta a Crédito sin Refuerzos', async ({ page }) => {
        // 1. Crear datos de prueba
        const clientName = `Cliente Crédito ${Date.now()}`;
        const ci = `${Math.floor(Math.random() * 10000000)}`;
        await createTestClient(page, clientName, ci);

        const brand = 'Nissan';
        const model = 'Frontier';
        const year = 2023;
        const price = 120000000;
        await createTestVehicle(page, brand, model, year, price);

        // 2. Ir a Nueva Venta
        await page.goto('/sales/new');

        // 3. Seleccionar Cliente
        await page.getByLabel('Cliente').selectOption({ label: new RegExp(clientName) });

        // 4. Seleccionar Tipo de Venta: A Cuotas
        await page.getByLabel('Tipo de Venta').selectOption('cuotas');

        // 5. Seleccionar Vehículo
        await page.getByLabel('Vehículo').selectOption({ label: new RegExp(`${brand} ${model}`) });

        // 6. Configurar Plan de Financiamiento
        const downPayment = 24000000; // 20%
        await page.getByLabel('Entrega Inicial').fill(downPayment.toLocaleString('es-PY'));

        // 7. Configurar Plazo e Interés
        await page.getByLabel('Plazo (Meses)').fill('12');
        await page.getByLabel('Interés Anual (%)').fill('10');

        // 8. Configurar Primer Vencimiento
        const firstPaymentDate = new Date();
        firstPaymentDate.setMonth(firstPaymentDate.getMonth() + 1);
        const dateStr = firstPaymentDate.toISOString().split('T')[0];
        await page.getByLabel(/Primer Venc/i).fill(dateStr);

        // 9. Verificar que la tabla de amortización se generó
        await expect(page.getByText('Tabla de Amortización (Proyección)')).toBeVisible();

        // Verificar que hay 12 cuotas en la tabla
        const rows = await page.locator('tbody tr').count();
        expect(rows).toBe(12);

        // 10. Seleccionar Forma de Pago Inicial
        await page.getByLabel('Forma de Pago').selectOption('cash');

        // 11. Guardar Venta
        await page.getByRole('button', { name: 'Guardar Venta' }).click();

        // 12. Verificar redirección
        await page.waitForURL(/.*sales/, { timeout: 15000 });
        await expect(page.getByText(clientName)).toBeVisible();
    });

    test('Caso 3: Venta a Crédito con Refuerzos', async ({ page }) => {
        // 1. Crear datos de prueba
        const clientName = `Cliente Refuerzo ${Date.now()}`;
        const ci = `${Math.floor(Math.random() * 10000000)}`;
        await createTestClient(page, clientName, ci);

        const brand = 'Ford';
        const model = 'Ranger';
        const year = 2024;
        const price = 140000000;
        await createTestVehicle(page, brand, model, year, price);

        // 2. Ir a Nueva Venta
        await page.goto('/sales/new');

        // 3. Seleccionar Cliente
        await page.getByLabel('Cliente').selectOption({ label: new RegExp(clientName) });

        // 4. Seleccionar Tipo de Venta: A Cuotas
        await page.getByLabel('Tipo de Venta').selectOption('cuotas');

        // 5. Seleccionar Vehículo
        await page.getByLabel('Vehículo').selectOption({ label: new RegExp(`${brand} ${model}`) });

        // 6. Configurar Plan Básico
        const downPayment = 28000000; // 20%
        await page.getByLabel('Entrega Inicial').fill(downPayment.toLocaleString('es-PY'));
        await page.getByLabel('Plazo (Meses)').fill('18');
        await page.getByLabel('Interés Anual (%)').fill('12');

        const firstPaymentDate = new Date();
        firstPaymentDate.setMonth(firstPaymentDate.getMonth() + 1);
        await page.getByLabel(/Primer Venc/i).fill(firstPaymentDate.toISOString().split('T')[0]);

        // 7. AGREGAR REFUERZOS
        // Refuerzo 1: en 6 meses
        await page.getByRole('button', { name: /Agregar/i, exact: false }).click();

        const refuerzo1Date = new Date();
        refuerzo1Date.setMonth(refuerzo1Date.getMonth() + 6);

        // Encontrar el primer input de refuerzo (fecha)
        const refuerzoDateInputs = page.locator('input[type="date"]').filter({ hasText: '' });
        const refuerzoIndex = await refuerzoDateInputs.count() - 1;

        await refuerzoDateInputs.nth(refuerzoIndex).fill(refuerzo1Date.toISOString().split('T')[0]);

        // Monto del refuerzo
        const refuerzoAmountInput = page.locator('input[type="text"]').filter({ hasText: '' }).last();
        await refuerzoAmountInput.fill('10000000'); // 10 millones

        // 8. Agregar segundo refuerzo
        await page.getByRole('button', { name: /Agregar/i, exact: false }).click();

        const refuerzo2Date = new Date();
        refuerzo2Date.setMonth(refuerzo2Date.getMonth() + 12);

        const refuerzoDateInputs2 = page.locator('input[type="date"]').filter({ hasText: '' });
        await refuerzoDateInputs2.last().fill(refuerzo2Date.toISOString().split('T')[0]);

        const refuerzoAmountInput2 = page.locator('input[type="text"]').filter({ hasText: '' }).last();
        await refuerzoAmountInput2.fill('15000000'); // 15 millones

        // 9. Verificar que el resumen muestra 2 refuerzos
        await expect(page.getByText('2')).toBeVisible(); // Contador de refuerzos en resumen

        // 10. Verificar tabla de amortización incluye refuerzos (más de 18 filas)
        await page.waitForTimeout(1000); // Dar tiempo a recalcular
        const totalRows = await page.locator('tbody tr').count();
        expect(totalRows).toBeGreaterThan(18); // 18 cuotas + 2 refuerzos

        // 11. Verificar que hay filas marcadas como refuerzo (bg amarillo)
        const refuerzoRows = await page.locator('tbody tr.bg-yellow-50').count();
        expect(refuerzoRows).toBe(2);

        // 12. Guardar Venta
        await page.getByRole('button', { name: 'Guardar Venta' }).click();

        // 13. Verificar éxito
        await page.waitForURL(/.*sales/, { timeout: 15000 });
        await expect(page.getByText(clientName)).toBeVisible();
    });

    test('Caso 4: Validaciones de Formulario', async ({ page }) => {
        // Probar validaciones sin llenar campos requeridos
        await page.goto('/sales/new');

        // Intentar guardar sin datos
        await page.getByRole('button', { name: 'Guardar Venta' }).click();

        // Debe aparecer un toast de advertencia
        await expect(page.getByText(/Seleccione cliente y vehículo/i)).toBeVisible({ timeout: 5000 });
    });
});
