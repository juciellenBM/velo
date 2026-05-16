//Act
  // Então o usuário deve ver o pedido aprovado
  //esse exemplo é para buscar por testid
  //await page.getByTestId('search-order-id').click();
  // await page.getByTestId('search-order-id').fill('VLO-EHWTGA');
  //caso não tenha identificação visual é possivel usar localização por identificação visual exemplo:
  //await page.getByRole('textbox', { name: 'Número do Pedido' }).fill('VLO-EHWTGA'); esse exemplo busca por name
  //caso não tenha identificação visual é possivel usar localização por identificação visual exemplo:/ esse exemplo busca porlabel e div retornando o input da div
  await page.locator('//label[text()="Número do Pedido"]/..//input').fill('VLO-EHWTGA');
  //await page.getByRole('textbox', { name: 'Número do Pedido' }).fill('VLO-EHWTGA');

  await page.getByTestId('search-order-button').click();
//Assert
  // Então o usuário deve ver o pedido aprovado
  //await page.waitForTimeout(10000); //espera 10 segundos para o pedido ser aprovado estrategia de espera ruim pois sempre vai esperar 10 segundos mesmo que o pedido já tenha sido aprovado
await expect(page.getByTestId('order-result-status')).toBeVisible({timeout: 30000}); //espera 30 segundos para o pedido ser aprovado entretanto aprova caso seja aprovado antes de 30 segundos
  await expect(page.getByTestId('order-result-id')).toContainText('VLO-EHWTGA');