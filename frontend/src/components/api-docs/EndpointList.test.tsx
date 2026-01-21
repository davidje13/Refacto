import { Router } from 'wouter';
import { memoryLocation } from 'wouter/memory-location';
import { render } from 'flexible-testing-library-react';
import { css } from '../../test-helpers/queries';
import type { OpenApiSpec } from './schema';

import { EndpointList } from './EndpointList';

describe('EndpointList', () => {
  it('displays endpoints with anchors', () => {
    const location = memoryLocation({ path: '/', record: true });
    const dom = render(
      <Router hook={location.hook}>
        <EndpointList spec={TEST_SPEC} demoBasePath="/demo" defaults={null} />
      </Router>,
    );

    expect(dom).toContainElementWith(css('#get-retros-retro-id'));
  });
});

const TEST_SPEC: OpenApiSpec = {
  servers: [{ url: '/here' }],
  paths: {
    '/health': {
      get: {
        summary: 'Info about health',
        responses: {
          '200': {
            description: 'All good.',
            content: {
              'text/plain': { schema: { enum: ['OK'] }, example: 'OK' },
            },
          },
        },
      },
    },
    '/retros/{retro_id}': {
      get: {
        summary: 'Get a retro',
        description: 'Lots of detail.',
        security: [{ retroToken: ['read'] }],
        parameters: [
          {
            name: 'retro_id',
            in: 'path',
            description: 'The ID of the retro.',
            required: true,
            schema: { type: 'string' },
          },
        ],
        responses: {
          '200': {
            description: 'The current retro state.',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Retro' },
              },
            },
          },
          '401': { $ref: '#/components/responses/UnauthorizedError' },
        },
      },
    },
  },
  components: {
    securitySchemes: {
      retroToken: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'retro token',
        description: 'What it is.',
      },
    },
    responses: {
      UnauthorizedError: {
        description: 'Oops.',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/Error' },
          },
        },
      },
    },
    schemas: {
      Error: {
        type: 'object',
        required: ['error'],
        properties: { error: { type: 'string', description: 'Reason.' } },
      },
      RetroID: { type: 'string', format: 'uuid', description: 'An ID.' },
      Retro: {
        type: 'object',
        required: ['id', 'items'],
        properties: {
          id: { $ref: '#/components/schemas/RetroID' },
          ownerId: {
            type: 'string',
            description:
              'An opaque string which uniquely identifies the owner of this retro.',
          },
          items: { $ref: '#/components/schemas/RetroItems' },
        },
      },
      RetroItems: {
        type: 'array',
        items: {
          type: 'object',
          title: 'Retro Item',
          required: ['id', 'message'],
          properties: {
            id: { type: 'string', format: 'uuid', description: 'An ID.' },
            message: {
              type: 'string',
              description: 'A message.',
              example: 'All is well',
            },
            group: { type: 'string', description: 'A sub-group.' },
          },
        },
        description: 'List of items',
      },
    },
  },
};
