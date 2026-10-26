import type { Pdu } from './types'

export const samplePdu: Pdu = { id: 'pdu-1', protocol: 'DHCP', source: 'Workstation-01', destination: 'Services', device: 'Access-Switch', sourceMac: '0050.56aa.0021', destinationMac: 'ffff.ffff.ffff', sourceIp: '0.0.0.0', destinationIp: '255.255.255.255', ttl: 64, transport: 'UDP', sourcePort: 68, destinationPort: 67, payload: 'DHCP Discover / Option 53: 1' }

export const pduLayers = (pdu: Pdu) => [
  { layer: '7', name: 'Application', in: `${pdu.protocol} payload accepted`, out: `${pdu.protocol} response prepared` },
  { layer: '6', name: 'Presentation', in: 'Payload decoded', out: 'Payload encoded' },
  { layer: '5', name: 'Session', in: 'Session state inspected', out: 'Session state maintained' },
  { layer: '4', name: 'Transport', in: `${pdu.transport} ${pdu.sourcePort ?? '-'} -> ${pdu.destinationPort ?? '-'}`, out: `${pdu.transport} checksum verified` },
  { layer: '3', name: 'Network', in: `${pdu.sourceIp} -> ${pdu.destinationIp} / TTL ${pdu.ttl}`, out: `${pdu.sourceIp} -> ${pdu.destinationIp} / TTL ${pdu.ttl - 1}` },
  { layer: '2', name: 'Data Link', in: `${pdu.sourceMac} -> ${pdu.destinationMac}`, out: `${pdu.sourceMac} -> ${pdu.destinationMac}` },
  { layer: '1', name: 'Physical', in: 'Bits received on Gi0/0/0', out: 'Bits transmitted on Fa0/12' },
]