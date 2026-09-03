import { test as base } from '@playwright/test'

import { createOrderLockupActions } from './actions/orderLockupActions'
import { createConfiguradorActions } from './actions/configuradorActions'

type App = {
  orderLockup: ReturnType<typeof createOrderLockupActions>
  configurador: ReturnType<typeof createConfiguradorActions>
}

export const test = base.extend<{ app: App }>({
  app: async ({ page }, use) => {
    const app: App = {
      orderLockup: createOrderLockupActions(page),
      configurador: createConfiguradorActions(page),
    }

    await use(app)
  },
})

export { expect } from '@playwright/test'
