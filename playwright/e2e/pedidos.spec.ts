import { test, expect } from '@playwright/test';

test('Deve consultar um pedido aprovado', async ({ page }) => {
  // Dado que o usuário está na página de consulta de pedidos
    await page.goto('http://localhost:5173/');
    // Então o usuário deve ver o título da página
  await expect(page.getByTestId('hero-section').getByRole('heading')).toContainText('Velô Sprint');
  
  // Quando o usuário clica no link de consulta de pedidos
  await page.getByRole('link', { name: 'Consultar Pedido' }).click();
  
  // Então o usuário deve ver o pedido aprovado
  await page.getByTestId('search-order-id').click();
  await page.getByTestId('search-order-id').fill('VLO-EHWTGA');
  await page.getByTestId('search-order-button').click();

  // Então o usuário deve ver o pedido aprovado
  await expect(page.getByTestId('order-result-status')).toBeVisible();
  await expect(page.getByTestId('order-result-id')).toContainText('VLO-EHWTGA');
  await expect(page.getByTestId('order-result-status')).toBeVisible();
  await expect(page.getByTestId('order-result-status')).toContainText('APROVADO');
});