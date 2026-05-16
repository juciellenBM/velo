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


 const containerPedido = page.getByRole ('paragraph')
 .filter ({hasText: /^Pedido$/})// estrategia de expressão regular 
 .locator ('..') // aqui o elemento sobe para o elemento pai no html 
 //espera 30 segundos para o pedido ser aprovado entretanto aprova caso seja aprovado antes de 30 segundos
await expect (containerPedido).toContainText ('VLO-EHWTGA', {timeout: 10000} )
await expect(page.getByText('APROVADO')).toBeVisible();

}); 