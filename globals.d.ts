// globals.d.ts
declare global {
  interface Window {
    Shopify: {
      shop: string
    }
    BOOMR: {
      themeName: string
    }
  }
}

export {}
