export type DeviceKind = 'router' | 'switch' | 'server' | 'pc' | 'access-point' | 'cloud'
export type DeviceStatus = 'up' | 'standby' | 'down'

export type Device = {
  id: string
  name: string
  model: string
  kind: DeviceKind
  x: number
  y: number
  status: DeviceStatus
  ip?: string
  powered?: boolean
  hostname?: string
  modules?: string[]
  ports?: NetworkInterface[]
}

export type NetworkInterface = {
  id: string
  ip?: string
  mask?: string
  enabled: boolean
  mode?: 'access' | 'trunk'
  vlan?: number
}

export type Link = { id: string; from: string; to: string; label: string; state: 'up' | 'learning' | 'down'; cable?: CableType }
export type CableType = 'auto' | 'console' | 'straight' | 'crossover' | 'fiber' | 'serial-dce' | 'serial-dte' | 'iot'
export type EventItem = { id?: string; time: string; device: string; type: string; info: string; color: string; protocol?: string; pdu?: Pdu }

export type Pdu = {
  id: string
  protocol: 'ARP' | 'ICMP' | 'DHCP' | 'DNS' | 'HTTP' | 'OSPF' | 'STP'
  source: string
  destination: string
  device: string
  sourceMac: string
  destinationMac: string
  sourceIp: string
  destinationIp: string
  ttl: number
  transport: 'Ethernet' | 'UDP' | 'TCP' | 'ICMP'
  sourcePort?: number
  destinationPort?: number
  payload: string
}

export type CliMode = 'user' | 'privileged' | 'config' | 'interface' | 'vlan' | 'router'
export type CliResult = { output: string; prompt: string; mode: CliMode; history: string[] }

export type ServerFile = { name: string; content: string; updatedAt: string }
export type DhcpPool = { name: string; startIp: string; mask: string; gateway: string; dns: string; maxUsers: number; nextOffset: number }
export type DnsRecord = { name: string; type: 'A' | 'AAAA' | 'CNAME'; value: string; ttl: number }
export type ServerUser = { username: string; password: string; permissions: string[] }
export type ServerServicesState = {
  enabled: Record<string, boolean>
  files: ServerFile[]
  dhcpPools: DhcpPool[]
  dnsRecords: DnsRecord[]
  users: ServerUser[]
  mailDomain: string
  logs: string[]
  iotRules: string[]
}

export type DesktopOSState = {
  ipMode: 'dhcp' | 'static'
  ip: string
  mask: string
  gateway: string
  dns: string
  arp: Record<string, string>
  firewallEnabled: boolean
}