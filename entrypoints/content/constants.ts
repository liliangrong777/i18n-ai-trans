export const colors = ['green', 'blue', 'red']
export const CIKey = 'captain-plug-in'
export const PPKey = 'ins-theme-app'
export enum AppTypeEnum {
  PP = 'P',
  Captain = 'C',
}

export enum FitStatusEnum {
  fitting,
  checking,
  published,
}

export enum MsgEvent {
  execScript = 'app:exec-script',
  execInit = 'app:init',
  toggleStatus = 'app:toggle-state',
  changeSection = 'app:change-section',
}

export enum StorageKey {
  status = 'ins-status',
  currentApp = 'ins:currentApp',
}

export enum PluginInBodyStatus {
  pending = 'PENDING',
  on = 'ON',
  off = 'OFF',
}
