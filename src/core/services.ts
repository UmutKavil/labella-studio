import type { DhcpPool, DesktopOSState, DnsRecord, ServerServicesState } from './types'

export const serviceNames = ['HTTP / HTTPS', 'DHCP', 'DHCPv6', 'TFTP', 'DNS', 'SYSLOG', 'AAA', 'NTP', 'EMAIL', 'FTP', 'IoT Registration', 'VM Management']

export const initialServices: ServerServicesState = {
  enabled: Object.fromEntries(serviceNames.map((name) => [name, name === 'DHCP' || name === 'DNS' || name === 'HTTP / HTTPS'])),
  files: [{ name: 'index.html', content: '<h1>Welcome to Labella</h1>', updatedAt: 'now' }, { name: 'helloworld.html', content: '<h1>Hello, network.</h1>', updatedAt: 'now' }],
  dhcpPools: [{ name: 'serverPool', startIp: '10.10.10.100', mask: '255.255.255.0', gateway: '10.10.10.1', dns: '10.10.10.10', maxUsers: 50, nextOffset: 0 }],
  dnsRecords: [{ name: 'www.labella.local', type: 'A', value: '10.10.10.10', ttl: 300 }],
  users: [{ username: 'cisco', password: 'cisco', permissions: ['Read', 'Write', 'List'] }],
  mailDomain: 'labella.local',
  logs: ['SYSLOG ready on UDP 514'],
  iotRules: ['Temperature > 25°C => Smart-Lamp ON'],
}

function ipv4ToNumber(ip: string) { return ip.split('.').reduce((value, octet) => (value * 256) + Number(octet), 0) }
function numberToIpv4(value: number) { return [24, 16, 8, 0].map((shift) => (value >>> shift) & 255).join('.') }

export function allocateDhcpAddress(pool: DhcpPool, clientId: string): { ip: string; mask: string; gateway: string; dns: string } {
  const offset = Math.min(pool.maxUsers - 1, pool.nextOffset)
  pool.nextOffset = offset + 1
  return { ip: numberToIpv4(ipv4ToNumber(pool.startIp) + offset), mask: pool.mask, gateway: pool.gateway, dns: pool.dns }
}

export function resolveDns(records: DnsRecord[], hostname: string): string | undefined {
  const record = records.find((item) => item.name.toLowerCase() === hostname.toLowerCase() && item.type === 'A')
  if (record) return record.value
  const cname = records.find((item) => item.name.toLowerCase() === hostname.toLowerCase() && item.type === 'CNAME')
  return cname ? resolveDns(records, cname.value) : undefined
}

export function renewDesktopLease(services: ServerServicesState, desktop: DesktopOSState, clientId: string): DesktopOSState {
  if (desktop.ipMode !== 'dhcp' || !services.enabled.DHCP || !services.dhcpPools[0]) return desktop
  return { ...desktop, ...allocateDhcpAddress(services.dhcpPools[0], clientId) }
}