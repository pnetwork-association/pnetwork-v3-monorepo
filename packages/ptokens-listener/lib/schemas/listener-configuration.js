const dbSchema = {
  type: 'object',
  default: {},
  title: 'The db Schema',
  required: [
    'url'
  ],
  properties: {
    url: {
      type: 'string',
      default: '',
      title: 'The url Schema',
      examples: [
        '127.0.0.1'
      ]
    }
  },
  examples: [{
    url: '127.0.0.1'
  }]
}

module.exports = {
  $async: true,
  type: 'object',
  default: {},
  title: 'The listener Schema',
  required: [
    'chain-name',
    'provider-url',
    'chain-type',
    'chain-id',
    'events',
    'db',
  ],
  properties: {
    'chain-name': {
      type: 'string',
      default: '',
      title: 'The chain-name Schema',
      examples: [
        'telos'
      ]
    },
    'provider-url': {
      type: 'string',
      default: '',
      title: 'The provider-url Schema',
      examples: [
        'http://127.0.0.1:8888'
      ]
    },
    'chain-type': {
      type: 'string',
      default: '',
      title: 'The chain-type Schema',
      examples: [
        'eos'
      ]
    },
    'chain-id': {
      type: 'string',
      default: '',
      title: 'The chain-id Schema',
      examples: [
        '0x0'
      ]
    },
    events: {
      type: 'array',
      default: [],
      title: 'The events Schema',
      items: {
        type: 'object',
        title: 'A Schema',
        required: [
          'name',
          'account-names',
        ],
        properties: {
          name: {
            type: 'string',
            title: 'The name Schema',
            examples: [
              'redeem',
              'pegin'
            ]
          },
          'account-names': {
            type: 'array',
            default: [],
            title: 'The account-names Schema',
            items: {
              type: 'string',
              title: 'A Schema',
              examples: [
                'btc.ptokens',
                'ltc.ptokens'
              ]
            },
            examples: [
              ['btc.ptokens',
                'ltc.ptokens'
              ]
            ]
          }
        },
        examples: [{
          name: 'redeem',
          'account-names': [
            'btc.ptokens',
            'ltc.ptokens'
          ]
        },
        {
          name: 'pegin',
          'account-names': ['xbsc.ptokens']
        }]
      },
      examples: [
        [{
          name: 'redeem',
          'account-names': [
            'btc.ptokens',
            'ltc.ptokens'
          ]
        },
        {
          name: 'pegin',
          'account-names': ['xbsc.ptokens']
        }]
      ]
    },
    db: dbSchema
  },
  examples: [{
    'chain-name': 'telos',
    'provider-url': 'http://127.0.0.1:8888',
    'chain-type': 'eos',
    'chain-id': '0x0',
    events: [{
      name: 'redeem',
      'account-names': [
        'btc.ptokens',
        'ltc.ptokens'
      ]
    },
    {
      name: 'pegin',
      'account-names': ['xbsc.ptokens']
    }],
    db: {
      url: '127.0.0.1'
    }
  }]
}
