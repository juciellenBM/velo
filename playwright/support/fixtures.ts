import { test as base } from '@playwright/test'

import { createHeroActions } from './actions/heroActions'
import { createCheckoutActions } from './actions/checkoutActions'
import { createConfiguratorActions } from './actions/configuratorActions'
import { createOrderLookupActions } from './actions/orderLookupActions'
import { createMockApi } from './fixtures/mock.api'

type App = {
  hero: ReturnType<typeof createHeroActions>
  checkout: ReturnType<typeof createCheckoutActions>
  configurator: ReturnType<typeof createConfiguratorActions>
  orderLookup: ReturnType<typeof createOrderLookupActions>
  mockApi: ReturnType<typeof createMockApi>
}

export const test = base.extend<{ app: App }>({
  app: async ({ page }, use) => {
    const app: App = {
      hero: createHeroActions(page),
      checkout: createCheckoutActions(page),
      configurator: createConfiguratorActions(page),
      orderLookup: createOrderLookupActions(page),
      mockApi: createMockApi(page),
    }
    await use(app)
  },
})

export { expect } from '@playwright/test'
