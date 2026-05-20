import { test, expect } from '@playwright/test';
import { gerarNumPed } from '../support/helpers';
// AAA - Arrange, Act, Assert

test.describe ('Consulta de pedido',() =>{
  
  
  test.beforeEach(async ({page}) => {
     //Arrange
     await page.goto('http://localhost:5173/');
     await expect(page.getByTestId('hero-section').getByRole('heading')).toContainText('Velô Sprint');
     await page.getByRole('link', { name: 'Consultar Pedido' }).click();
     await expect (page.getByRole('heading')).toContainText ('Consultar Pedido')
   
  
  })

    test('Deve consultar um pedido aprovado', async ({ page }) => {
    // Dado que o usuário está na página de consulta de pedidos
    //Test Data 
   //const order = 'VLO-EHWTGA'

   const order = {
    number: 'VLO-EHWTGA',
    status: 'APROVADO',
    color:'Midnight Black',
    wheels:'sport Wheels',
    customer : {
      name: 'JUCIELLEN MORAES',
      email:'juciellen@hotmail.com'

    },
    payment :'À Vista'
   }
   
    //Act
     await page.getByRole('textbox', { name: 'Número do Pedido' }).fill(order.number);

    await page.getByRole ('button', {name:'Buscar Pedido'}).click();
    //Assert


    //  const containerPedido = page.getByRole ('paragraph')
    //   .filter ({hasText: /^Pedido$/})// estrategia de expressão regular 
    //   .locator ('..') // aqui o elemento sobe para o elemento pai no html 
    //    //espera 30 segundos para o pedido ser aprovado entretanto aprova caso seja aprovado antes de 30 segundos
    //   await expect (containerPedido).toContainText (order, {timeout: 10000} )
    //   await expect(page.getByText('APROVADO')).toBeVisible();
    await expect(page.getByTestId(`order-result-${order.number}`)).toMatchAriaSnapshot(`
      - img
      - paragraph: Pedido
      - paragraph: ${order.number}
      - img
      - text: APROVADO
      - img "Velô Sprint"
      - paragraph: Modelo
      - paragraph: Velô Sprint
      - paragraph: Cor
      - paragraph: ${order.color}
      - paragraph: Interior
      - paragraph: cream
      - paragraph: Rodas
      - paragraph:  ${order.wheels}
      - heading "Dados do Cliente" [level=4]
      - paragraph: Nome
      - paragraph:  ${order.customer.name}
      - paragraph: Email
      - paragraph: ${order.customer.email}
      - paragraph: Loja de Retirada
      - paragraph
      - paragraph: Data do Pedido
      - paragraph: /\\d+\\/\\d+\\/\\d+/
      - heading "Pagamento" [level=4]
      - paragraph: ${order.payment}
      - paragraph: /R\\$ \\d+\\.\\d+,\\d+/
      `);
      

  }); 

  test('Deve consultar um pedido reprovado', async ({ page }) => {
    // Dado que o usuário está na página de consulta de pedidos
    //Test Data 
   //const order = 'VLO-EHWTGA'

   const order = {
    number: 'VLO-GOUQJH',
    status: 'REPROVADO',
    color:'Lunar White',
    wheels:'sport Wheels',
    customer : {
      name: 'Karoliny Simões',
      email:'karolinysimoes@gmail.com'

    },
    payment :'À Vista'
   }
   
    //Act
     await page.getByRole('textbox', { name: 'Número do Pedido' }).fill(order.number);

    await page.getByRole ('button', {name:'Buscar Pedido'}).click();
    //Assert


    //  const containerPedido = page.getByRole ('paragraph')
    //   .filter ({hasText: /^Pedido$/})// estrategia de expressão regular 
    //   .locator ('..') // aqui o elemento sobe para o elemento pai no html 
    //    //espera 30 segundos para o pedido ser aprovado entretanto aprova caso seja aprovado antes de 30 segundos
    //   await expect (containerPedido).toContainText (order, {timeout: 10000} )
    //   await expect(page.getByText('APROVADO')).toBeVisible();
    await expect(page.getByTestId(`order-result-${order.number}`)).toMatchAriaSnapshot(`
      - img
      - paragraph: Pedido
      - paragraph: ${order.number}
      - img
      - text: ${order.status}
      - img "Velô Sprint"
      - paragraph: Modelo
      - paragraph: Velô Sprint
      - paragraph: Cor
      - paragraph: ${order.color}
      - paragraph: Interior
      - paragraph: cream
      - paragraph: Rodas
      - paragraph:  ${order.wheels}
      - heading "Dados do Cliente" [level=4]
      - paragraph: Nome
      - paragraph:  ${order.customer.name}
      - paragraph: Email
      - paragraph: ${order.customer.email}
      - paragraph: Loja de Retirada
      - paragraph
      - paragraph: Data do Pedido
      - paragraph: /\\d+\\/\\d+\\/\\d+/
      - heading "Pagamento" [level=4]
      - paragraph: ${order.payment}
      - paragraph: /R\\$ \\d+\\.\\d+,\\d+/
      `);
    

  });

    test ('Deve exibir mensagem quando o pedido não é encontrado', async ({ page}) => {

    const order =gerarNumPed ()

    

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

})