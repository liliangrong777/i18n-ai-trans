// globals.d.ts
declare global {
  interface Window {
    __CurrentApp: 'C' | 'P'
    Shopify: {
      shop: string
    }
    BOOMR: {
      themeName: string
    }
  }
}

export {}
