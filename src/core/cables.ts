import type { CableType, DeviceKind } from './types'

export const cableLabels: Record<CableType, string> = { auto: 'Auto', console: 'Console', straight: 'Copper Straight-Through', crossover: 'Copper Cross-Over', fiber: 'Fiber', 'serial-dce': 'Serial DCE', 'serial-dte': 'Serial DTE', iot: 'IoT Custom Cable' }

export function validateCable(type: CableType, from: DeviceKind, to: DeviceKind): { valid: boolean; reason: string } {
  if (type === 'auto') return { valid: true, reason: 'Auto-MDIX selected a compatible port' }
  if (type === 'console') return { valid: from === 'pc' && (to === 'router' || to === 'switch'), reason: 'Console requires PC RS-232 to router/switch Console' }
  if (type === 'fiber') return { valid: from === 'switch' && to === 'switch', reason: 'Fiber requires SFP/FX ports on both endpoints' }
  if (type === 'iot') return { valid: from === 'pc' || to === 'pc', reason: 'IoT Custom Cable requires a controller endpoint' }
  if (type === 'serial-dce' || type === 'serial-dte') return { valid: from === 'router' && to === 'router', reason: 'Serial WAN cable requires two routers' }
  if (type === 'crossover') return { valid: from === to || (from === 'router' && to === 'pc') || (from === 'pc' && to === 'router'), reason: 'Cross-over connects like interfaces' }
  return { valid: from !== to || from === 'pc' || to === 'pc', reason: 'Straight-through connects unlike interfaces' }
}