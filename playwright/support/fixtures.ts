import { test as base } from '@playwright/test'

import { createOrderLockupActions } from './actions/orderLockupActions'
import { createConfiguradorActions } from './actions/configuradorActions'
import { createCheckoutActions } from './actions/checkoutActions'

type App = {
  orderLockup: ReturnType<typeof createOrderLockupActions>
  configurador: ReturnType<typeof createConfiguradorActions>
  checkout: ReturnType<typeof createCheckoutActions>
}

export const test = base.extend<{ app: App }>({
  app: async ({ page }, use) => {
    const app: App = {
      orderLockup: createOrderLockupActions(page),
      configurador: createConfiguradorActions(page),
      checkout: createCheckoutActions(page),
    }

    await use(app)
  },
})

export { expect } from '@playwright/test'
