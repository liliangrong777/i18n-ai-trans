import { defineConfig } from 'wxt'

// See https://wxt.dev/api/config.html
export default defineConfig({
  modules: ['@wxt-dev/module-react'],
  manifest: {
    name: '新版插件2.1',
    permissions: [
      'storage',
      'activeTab',
      'webRequest',
      'webRequestBlocking',
      'declarativeNetRequest',
      'scripting',
    ],
    host_permissions: ['*://*/*'],
    action: {
      default_icon: {},
    },
    commands: {
      _execute_action: {
        suggested_key: {
          default: 'Ctrl+B',
          mac: 'Command+B',
        },
        description: '_execute_action',
      },
    },
  },
  vite: () => {
    return {
      build: {
        minify: false,
      },
    }
  },
})
