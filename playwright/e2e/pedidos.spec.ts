import { test, expect } from '@playwright/test';
import { gerarNumPed } from '../support/helpers';
// AAA - Arrange, Act, Assert


test('Deve consultar um pedido aprovado', async ({ page }) => {
  // Dado que o usuário está na página de consulta de pedidos


  //Test Data 
  const order = 'VLO-EHWTGA'
//Arrange
  await page.goto('http://localhost:5173/');
  await expect(page.getByTestId('hero-section').getByRole('heading')).toContainText('Velô Sprint');
  await page.getByRole('link', { name: 'Consultar Pedido' }).click();
  await expect (page.getByRole('heading')).toContainText ('Consultar Pedido')
  
  //Act
  await page.getByRole('textbox', { name: 'Número do Pedido' }).fill(order);

  await page.getByRole ('button', {name:'Buscar Pedido'}).click();
//Assert


 const containerPedido = page.getByRole ('paragraph')
 .filter ({hasText: /^Pedido$/})// estrategia de expressão regular 
 .locator ('..') // aqui o elemento sobe para o elemento pai no html 
 //espera 30 segundos para o pedido ser aprovado entretanto aprova caso seja aprovado antes de 30 segundos
await expect (containerPedido).toContainText (order, {timeout: 10000} )
await expect(page.getByText('APROVADO')).toBeVisible();

}); 


test ('Deve exibir mensagem quando o pedido não é encontrado', async ({ page}) => {

const order =gerarNumPed ()

//Arrange
await page.goto('http://localhost:5173/');
await expect(page.getByTestId('hero-section').getByRole('heading')).toContainText('Velô Sprint');
await page.getByRole('link', { name: 'Consultar Pedido' }).click();
await expect (page.getByRole('heading')).toContainText ('Consultar Pedido')

//Act
await page.getByRole('textbox', { name: 'Número do Pedido' }).fill(order);

await page.getByRole ('button', {name:'Buscar Pedido'}).click();
//Assert

await expect(page.locator('#root')).toMatchAriaSnapshot(`
  - img
  - heading "Pedido não encontrado" [level=3]
  - paragraph: Verifique o número do pedido e tente novamente
  `);









})