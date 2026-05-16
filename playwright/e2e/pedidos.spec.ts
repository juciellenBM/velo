import { test, expect } from '@playwright/test';
// AAA - Arrange, Act, Assert

test('Deve consultar um pedido aprovado', async ({ page }) => {
  // Dado que o usuário está na página de consulta de pedidos
//Arrange
  await page.goto('http://localhost:5173/');
  await expect(page.getByTestId('hero-section').getByRole('heading')).toContainText('Velô Sprint');
  await page.getByRole('link', { name: 'Consultar Pedido' }).click();
  await expect (page.getByRole('heading')).toContainText ('Consultar Pedido')
  
  //Act
  await page.getByRole('textbox', { name: 'Número do Pedido' }).fill('VLO-EHWTGA');

  await page.getByRole ('button', {name:'Buscar Pedido'}).click();
//Assert
  
await expect(page.getByText('Pedido',{exact:true})).toBeVisible({timeout: 30000}); //espera 30 segundos para o pedido ser aprovado entretanto aprova caso seja aprovado antes de 30 segundos
await expect(page.getByText('VLO-EHWTGA')).toBeVisible();
await expect(page.getByText('APROVADO')).toBeVisible();

});