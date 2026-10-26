import type { CliMode, CliResult, Device, NetworkInterface } from '../types'

const commands = ['enable', 'configure terminal', 'interface', 'hostname', 'enable secret', 'ip address', 'no shutdown', 'shutdown', 'vlan', 'name', 'switchport mode', 'switchport access vlan', 'ip route', 'router ospf', 'network', 'ip dhcp pool', 'default-router', 'dns-server', 'ip helper-address', 'ip nat inside', 'ip nat outside', 'access-list', 'show running-config', 'show startup-config', 'show ip interface brief', 'show ip route', 'show vlan brief', 'show mac-address-table', 'show arp', 'show cdp neighbors', 'show spanning-tree', 'copy running-config startup-config', 'write memory', 'reload', 'ping', 'traceroute']

const aliases: Record<string, string> = { en: 'enable', conf: 'configure', t: 'terminal', int: 'interface', sh: 'show', no: 'no', s: 'show', wr: 'write' }

function normalize(input: string) {
  return input.trim().toLowerCase().split(/\s+/).map((token) => aliases[token] ?? token).join(' ')
}

function prompt(mode: CliMode, hostname: string) {
  if (mode === 'user') return `${hostname}>`
  if (mode === 'privileged') return `${hostname}#`
  if (mode === 'config') return `${hostname}(config)#`
  if (mode === 'interface') return `${hostname}(config-if)#`
  if (mode === 'vlan') return `${hostname}(config-vlan)#`
  return `${hostname}(config-router)#`
}

export class IosCliEngine {
  private mode: CliMode = 'user'
  private hostname = 'Router'
  private history: string[] = []
  private runningConfig: string[] = []
  private startupConfig: string[] = []
  private currentInterface = ''
  private interfaces: NetworkInterface[]

  constructor(device: Device) {
    this.hostname = device.hostname ?? device.name.replace(/\s+/g, '-')
    this.interfaces = device.ports ?? (device.kind === 'switch' ? Array.from({ length: 4 }, (_, index) => ({ id: `FastEthernet0/${index + 1}`, enabled: true })) : [{ id: 'GigabitEthernet0/0/0', enabled: true }, { id: 'GigabitEthernet0/0/1', enabled: true }])
  }

  getPrompt() { return prompt(this.mode, this.hostname) }
  complete(value: string) { const term = value.trim().toLowerCase(); return commands.filter((command) => command.startsWith(term) || command.split(' ').some((part) => part.startsWith(term))).slice(0, 8) }

  execute(raw: string): CliResult {
    const input = raw.trim()
    if (!input) return { output: '', prompt: this.getPrompt(), mode: this.mode, history: this.history }
    if (input === '?') return { output: this.complete('').join('  '), prompt: this.getPrompt(), mode: this.mode, history: this.history }
    if (input === 'history' || input === 'show history') return { output: this.history.map((line, index) => `${index + 1}  ${line}`).join('\n'), prompt: this.getPrompt(), mode: this.mode, history: this.history }
    this.history = [input, ...this.history.filter((line) => line !== input)].slice(0, 30)
    const command = normalize(input)
    let output = ''
    if (command === 'enable') this.mode = 'privileged'
    else if (command === 'disable') this.mode = 'user'
    else if (command === 'configure terminal' || command === 'configure') this.mode = 'config'
    else if (command === 'end') this.mode = 'privileged'
    else if (command === 'exit') this.mode = this.mode === 'interface' || this.mode === 'vlan' || this.mode === 'router' ? 'config' : this.mode === 'config' ? 'privileged' : 'user'
    else if (command.startsWith('interface ')) { this.currentInterface = input.split(/\s+/).slice(1).join(' '); this.mode = 'interface' }
    else if (command.startsWith('hostname ')) { this.hostname = input.slice(input.indexOf(' ') + 1); this.runningConfig.push(`hostname ${this.hostname}`) }
    else if (command.startsWith('enable secret ')) this.runningConfig.push(`enable secret ${input.slice(14)}`)
    else if (command === 'no shutdown' || command === 'shutdown') { const enabled = command === 'no shutdown'; this.interfaces = this.interfaces.map((item) => item.id.toLowerCase() === this.currentInterface.toLowerCase() ? { ...item, enabled } : item); this.runningConfig.push(`${enabled ? 'no shutdown' : 'shutdown'}`); output = `Interface ${this.currentInterface} administratively ${enabled ? 'up' : 'down'}` }
    else if (command.startsWith('ip address ')) { const [, ip, mask] = input.split(/\s+/); this.interfaces = this.interfaces.map((item) => item.id.toLowerCase() === this.currentInterface.toLowerCase() ? { ...item, ip, mask } : item); this.runningConfig.push(`ip address ${ip} ${mask}`) }
    else if (command.startsWith('vlan ')) { this.mode = 'vlan'; this.runningConfig.push(command); output = `VLAN ${input.split(/\s+/)[1]} created` }
    else if (command.startsWith('name ')) this.runningConfig.push(`name ${input.slice(5)}`)
    else if (command.startsWith('switchport ') || command.startsWith('ip route ') || command.startsWith('network ') || command.startsWith('default-router ') || command.startsWith('dns-server ') || command.startsWith('ip helper-address ') || command.startsWith('ip nat ') || command.startsWith('access-list ') || command.startsWith('router ')) this.runningConfig.push(input)
    else if (command === 'show running-config') output = ['Building configuration...', '!', ...this.runningConfig, '!', 'end'].join('\n')
    else if (command === 'show startup-config') output = this.startupConfig.length ? this.startupConfig.join('\n') : 'startup-config is not present'
    else if (command === 'show ip interface brief') output = ['Interface              IP-Address      OK? Method Status  Protocol', ...this.interfaces.map((item) => `${item.id.padEnd(22)} ${(item.ip ?? 'unassigned').padEnd(15)} YES manual ${item.enabled ? 'up' : 'administratively down'}  ${item.enabled ? 'up' : 'down'}`)].join('\n')
    else if (command === 'show ip route') output = 'C    10.10.0.0/24 is directly connected, GigabitEthernet0/0/0\nO    10.10.10.0/24 [110/2] via 10.10.0.2'
    else if (command === 'show vlan brief') output = 'VLAN Name                             Status    Ports\n1    default                          active    Fa0/1, Fa0/2\n10   CORE                             active    Fa0/3-Fa0/12\n20   CLIENTS                          active    Fa0/13-Fa0/24'
    else if (command === 'show mac-address-table') output = 'Vlan    Mac Address       Type        Ports\n10      0050.56aa.0010    DYNAMIC     Fa0/3\n20      0050.56aa.0021    DYNAMIC     Fa0/12'
    else if (command === 'show arp' || command === 'show ip arp') output = 'Protocol  Address          Age  Hardware Addr   Type   Interface\nInternet  10.10.10.10      2    0050.56aa.0010  ARPA   Gi0/0/0'
    else if (command === 'show cdp neighbors') output = 'Device ID        Local Intrfce     Holdtme    Capability  Platform  Port ID\nAccess-Switch     Gi0/0/0            142        S I         WS-C2960  Fa0/1'
    else if (command === 'show spanning-tree') output = 'Spanning tree enabled protocol rstp\nRoot ID    Priority 32778  Address 0050.56aa.0001\nFa0/12     Desg FWD  4       128.12'
    else if (command === 'copy running-config startup-config' || command === 'write memory') { this.startupConfig = [...this.runningConfig]; output = '[OK] Configuration saved to NVRAM.' }
    else if (command === 'reload') output = 'Proceed with reload? [confirm]'
    else if (command.startsWith('ping ')) output = `Type escape sequence to abort.\nSending 5, 100-byte ICMP Echos to ${input.slice(5)}, timeout is 2 seconds:\n!!!!!\nSuccess rate is 100 percent (5/5), round-trip min/avg/max = 1/2/4 ms`
    else if (command.startsWith('traceroute ')) output = `Tracing the route to ${input.slice(11)}\n  1  10.10.0.1  1 msec  1 msec  2 msec\n  2  10.10.10.10  2 msec  2 msec  3 msec`
    else output = `% Invalid input detected at '^' marker.`
    return { output, prompt: this.getPrompt(), mode: this.mode, history: this.history }
  }
}