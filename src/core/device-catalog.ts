import type { DeviceKind } from './types'

export type CatalogItem = { model: string; kind: DeviceKind; category: string; description: string }

export const deviceCatalog: CatalogItem[] = [
  { model: 'ISR 4331', kind: 'router', category: 'Routers', description: 'Enterprise ISR router' },
  { model: 'ISR 4321', kind: 'router', category: 'Routers', description: 'Branch ISR router' },
  { model: '2911', kind: 'router', category: 'Routers', description: 'Integrated services router' },
  { model: '1941', kind: 'router', category: 'Routers', description: 'Branch router' },
  { model: '2811', kind: 'router', category: 'Routers', description: 'Modular router' },
  { model: 'Router-PT', kind: 'router', category: 'Routers', description: 'Generic router' },
  { model: '2960-24TT', kind: 'switch', category: 'Switches', description: 'Layer 2 access switch' },
  { model: '2950-24', kind: 'switch', category: 'Switches', description: 'Legacy access switch' },
  { model: '3560-24PS', kind: 'switch', category: 'Switches', description: 'Layer 3 PoE switch' },
  { model: '3650-24PS', kind: 'switch', category: 'Switches', description: 'Modular Layer 3 switch' },
  { model: 'Switch-PT', kind: 'switch', category: 'Switches', description: 'Generic switch' },
  { model: 'Hub-PT', kind: 'switch', category: 'Hubs', description: 'Layer 1 repeater hub' },
  { model: 'Server-PT', kind: 'server', category: 'Servers', description: 'Multi-service server' },
  { model: 'Meraki-Server', kind: 'server', category: 'Servers', description: 'Cloud management server' },
  { model: 'Network Controller', kind: 'server', category: 'Servers', description: 'SDN controller' },
  { model: 'PC-PT', kind: 'pc', category: 'End Devices', description: 'Desktop host' },
  { model: 'Laptop-PT', kind: 'pc', category: 'End Devices', description: 'Wireless laptop host' },
  { model: 'Printer-PT', kind: 'pc', category: 'End Devices', description: 'Network printer' },
  { model: 'Sniffer', kind: 'pc', category: 'End Devices', description: 'Packet capture host' },
  { model: 'AccessPoint-PT', kind: 'access-point', category: 'Wireless', description: 'Wireless access point' },
  { model: 'WLC-PT', kind: 'access-point', category: 'Wireless', description: 'Wireless LAN controller' },
  { model: 'Home Router', kind: 'access-point', category: 'Wireless', description: 'Home wireless gateway' },
]

export const catalogCategories = [...new Set(deviceCatalog.map((item) => item.category))]
