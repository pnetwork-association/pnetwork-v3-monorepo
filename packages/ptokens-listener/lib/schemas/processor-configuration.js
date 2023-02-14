const dbSchema = {
  type: 'object',
  default: {},
  title: 'The db Schema',
  required: ['url'],
  properties: {
    url: {
      type: 'string',
      default: '',
      title: 'The url Schema',
      examples: ['127.0.0.1'],
    },
  },
  examples: [
    {
      url: '127.0.0.1',
    },
  ],
}

const processorSchema = {
  type: 'object',
  default: {},
  title: 'The processor Schema',
  required: [
    'identity',
    'identity-address',
    'chain-name',
    'chain-type',
    'chain-id',
    'issuance-manager',
    'redeem-manager',
    'db',
  ],
  properties: {
    identity: {
      type: 'string',
      default: '',
      title: 'The identity Schema',
      examples: ['./bsc-identity.gpg'],
    },
    'identity-address': {
      type: 'string',
      default: '',
      title: 'The identity-address Schema',
      examples: ['0xC0FEEE'],
    },
    'chain-name': {
      type: 'string',
      default: '',
      title: 'The chain-name Schema',
      examples: ['bsc'],
    },
    'chain-type': {
      type: 'string',
      default: '',
      title: 'The chain-type Schema',
      examples: ['evm'],
    },
    'chain-id': {
      type: 'string',
      default: '',
      title: 'The chain-id Schema',
      examples: ['0x0'],
    },
    'issuance-manager': {
      type: 'string',
      default: '',
      title: 'The issuance-manager Schema',
      examples: ['0x102938'],
    },
    'redeem-manager': {
      type: 'string',
      default: '',
      title: 'The redeem-manager Schema',
      examples: ['0x039485'],
    },
    db: dbSchema,
  },
  examples: [
    {
      identity: './bsc-identity.gpg',
      'identity-address': '0xC0FEEE',
      'chain-name': 'bsc',
      'chain-type': 'evm',
      'chain-id': '0x0',
      'issuance-manager': '0x102938',
      'redeem-manager': '0x039485',
      db: {
        url: '127.0.0.1',
      },
    },
  ],
}

module.exports = {
  $async: true,
  type: 'object',
  default: {},
  title: 'Root Schema',
  required: ['listener', 'processor'],
  properties: {
    processor: processorSchema,
  },
  examples: [
    {
      processor: {
        identity: './bsc-identity.gpg',
        'identity-address': '0xC0FEEE',
        'chain-name': 'bsc',
        'chain-type': 'evm',
        'chain-id': '0x0',
        'issuance-manager': '0x102938',
        'redeem-manager': '0x039485',
        db: {
          url: '127.0.0.1',
        },
      },
    },
  ],
}
