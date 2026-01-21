// $schema: "https://spec.openapis.org/oas/3.0/schema/2024-10-18"

export const openapi = Buffer.from(
  JSON.stringify({
    openapi: '3.0.4',
    info: {
      title: 'Refacto API',
      description: 'API for reading and interacting with Refacto retros.',
      version: '1.0.0',
    },
    servers: [{ url: '/api' }],
    paths: {
      '/health': {
        get: {
          summary: 'Check the health of the service and API',
          description:
            'This endpoint returns successfully if the API is up and ready for requests. Specifically, it will not be available until the service has successfully connected to the database and applied any necessary schema changes. Note that the endpoint does not poll the database, so if the database later becomes inaccessible, this will continue to return success.',
          responses: {
            '200': {
              description: 'Service is running and healthy.',
              content: {
                'text/plain': { schema: { enum: ['OK'] }, example: 'OK' },
              },
            },
          },
        },
      },
      '/slugs/{slug}': {
        get: {
          summary:
            'Look up a retro by its slug (partial URL, as seen by users)',
          description:
            "Internally retros are referenced by their ID, but users navigate to them at a user-friendly URL. The retro identifying part of this URL is referred to as the 'slug'. This may only contain lowercase ASCII alphanumeric characters, as well as underscore and dash (but these cannot be the first character).",
          parameters: [
            {
              name: 'slug',
              in: 'path',
              description: 'The retro slug to look up.',
              required: true,
              schema: {
                type: 'string',
                pattern: '^[a-z0-9][a-z0-9_\\-]*$',
              },
              example: 'my-retro',
            },
          ],
          responses: {
            '200': {
              description: 'Slug found.',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    required: ['id'],
                    properties: {
                      id: { $ref: '#/components/schemas/RetroID' },
                    },
                  },
                },
              },
            },
            '404': { description: 'Slug not found.' },
          },
        },
      },
      '/auth/tokens/{retro_id}/user': {
        post: {
          summary: "Authenticate with a retro using the owner's user token",
          security: [{ userToken: [] }],
          parameters: [
            {
              name: 'retro_id',
              in: 'path',
              description: 'The ID of the retro to create a token for.',
              required: true,
              schema: { type: 'string' },
            },
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { type: 'object', additionalProperties: false },
              },
            },
          },
          responses: {
            '200': {
              description:
                'Authentication was successful and the retro is owned by the current user.',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/RetroTokenResponse' },
                },
              },
            },
            '401': { $ref: '#/components/responses/UnauthorizedError' },
            '403': {
              description:
                'The requested retro does not exist, is not owned by this user, or the server was configured with `PERMIT_MY_RETROS=false`.',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Error' },
                },
              },
            },
          },
        },
      },
      '/auth/tokens/{retro_id}': {
        post: {
          summary: 'Authenticate with a retro using the shared retro password',
          parameters: [
            {
              name: 'retro_id',
              in: 'path',
              description: 'The ID of the retro to create a token for.',
              required: true,
              schema: { type: 'string' },
            },
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['password'],
                  properties: {
                    password: {
                      type: 'string',
                      description: 'The collaborator password for the retro.',
                      example: 'Secret',
                    },
                  },
                  additionalProperties: false,
                },
              },
            },
          },
          responses: {
            '200': {
              description: 'Authentication was successful.',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/RetroTokenResponse' },
                },
              },
            },
            '400': {
              description:
                'The password was incorrect, or the retro ID does not exist.',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Error' },
                },
              },
            },
            '422': { $ref: '#/components/responses/ValidationError' },
          },
        },
      },
      '/retros': {
        get: {
          summary: 'List retros owned by the current user',
          description:
            'Returns a list of all retros owned by the current user. Note that if the server was configured with `PERMIT_MY_RETROS=false`, this will always return an empty list.',
          security: [{ userToken: [] }],
          responses: {
            '200': {
              description: 'A list of retros owned by the current user.',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    required: ['retros'],
                    properties: {
                      retros: {
                        type: 'array',
                        items: {
                          type: 'object',
                          required: ['id', 'slug', 'name'],
                          properties: {
                            id: { $ref: '#/components/schemas/RetroID' },
                            slug: { $ref: '#/components/schemas/RetroSlug' },
                            name: { $ref: '#/components/schemas/RetroName' },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
            '401': { $ref: '#/components/responses/UnauthorizedError' },
            '403': { $ref: '#/components/responses/ForbiddenError' },
          },
        },
        post: {
          summary: 'Create a new retro',
          description:
            'Creates a new retro, optionally importing existing data. The importJson structure is returned by the `GET /retros/{retro_id}/export/json` endpoint.',
          security: [{ userToken: [] }],
          requestBody: {
            description: 'The retro to create',
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['slug', 'name', 'password'],
                  properties: {
                    slug: { $ref: '#/components/schemas/RetroSlug' },
                    name: { $ref: '#/components/schemas/RetroName' },
                    password: {
                      type: 'string',
                      description:
                        'The collaborator password to use for accessing this retro. This is expected to be shared with other users.',
                      example: 'Secret',
                    },
                    importJson: { $ref: '#/components/schemas/RetroExport' },
                  },
                  additionalProperties: false,
                },
              },
            },
          },
          responses: {
            '200': {
              description: 'Retro created',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    required: ['id', 'token', 'expires'],
                    properties: {
                      id: {
                        type: 'string',
                        format: 'uuid',
                        description:
                          'The internally-assigned unique ID of the newly created retro (used in API calls). This will never change.',
                      },
                      token: {
                        type: 'string',
                        format: 'jwt',
                        description:
                          'A retro token generated for the current user for the newly created retro.',
                      },
                      expires: {
                        type: 'integer',
                        format: 'unix-millis',
                        description:
                          'The time when the retro token will expire.',
                      },
                    },
                  },
                },
              },
            },
            '400': {
              description: 'The provided data was incomplete or invalid.',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Error' },
                },
              },
            },
            '401': { $ref: '#/components/responses/UnauthorizedError' },
            '403': { $ref: '#/components/responses/ForbiddenError' },
            '409': {
              description: 'The requested slug is already in use.',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Error' },
                },
              },
            },
            '422': { $ref: '#/components/responses/ValidationError' },
          },
        },
      },
      '/retros/{retro_id}': {
        get: {
          summary: 'Read a snapshot of the current retro state',
          description:
            'Returns the current active retro state, excluding any archives. Note that all retro data is user-generated and user modifiable (with the exception of the id and ownerId). The structure of the data is enforced, but the content can be set to anything. Therefore you should consider all retro data as untrusted input.',
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
            '403': { $ref: '#/components/responses/ForbiddenError' },
          },
        },
        patch: {
          summary: 'Modify the retro content and/or configuration',
          security: [{ retroToken: ['write', 'manage'] }],
          parameters: [
            {
              name: 'retro_id',
              in: 'path',
              description: 'The ID of the retro.',
              required: true,
              schema: { type: 'string' },
            },
          ],
          requestBody: {
            description: 'The change to apply.',
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  minProperties: 1,
                  properties: {
                    change: { $ref: '#/components/schemas/ChangeSpec' },
                    setPassword: {
                      type: 'object',
                      required: ['password', 'evictUsers'],
                      properties: {
                        password: {
                          type: 'string',
                          description: 'The new password to set.',
                          example: 'Secret',
                        },
                        evictUsers: {
                          type: 'boolean',
                          description:
                            'true (recommended) to invalidate all existing tokens for this retro immediately after changing the password (active connections will be given a few seconds to gracefully close). If false, existing tokens will continue to be valid until they expire (which may be many months in the future).',
                        },
                      },
                      description:
                        "If set, this changes the retro password and optionally invalidates current tokens. Requires a retro token with 'manage' access.",
                    },
                  },
                  additionalProperties: false,
                },
              },
            },
          },
          responses: {
            '200': {
              description: 'Change applied successfully.',
              content: {
                'application/json': { schema: { type: 'object' } },
              },
            },
            '401': { $ref: '#/components/responses/UnauthorizedError' },
            '403': { $ref: '#/components/responses/ForbiddenError' },
            '422': { $ref: '#/components/responses/ValidationError' },
          },
        },
      },
      '/retros/{retro_id}/export/json': {
        get: {
          summary:
            'Export the current retro and all of its archives in a machine-readable JSON format',
          description:
            'This provides a complete export of a retro in a format which can easily be re-imported. It does not include the retro ID, the owner ID, or the password. Note that this is a relatively expensive operation, so do not use this endpoint unless you need all of the current and archived data. If you do not need the archive data, prefer using GET on the retro itself.',
          security: [{ retroToken: ['read', 'readArchives'] }],
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
              description: 'Export of current retro and archived content.',
              headers: {
                'Content-Disposition': {
                  schema: { type: 'string' },
                  example: 'attachment; filename="my-retro-export.json"',
                },
              },
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/RetroExport' },
                },
              },
            },
            '401': { $ref: '#/components/responses/UnauthorizedError' },
            '403': { $ref: '#/components/responses/ForbiddenError' },
          },
        },
      },
      '/retros/{retro_id}/export/csv': {
        get: {
          summary:
            'Export the items from the current retro and all of its archives in a spreadsheet-readable CSV format',
          security: [{ retroToken: ['read', 'readArchives'] }],
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
              description:
                'Export of current retro items and archived content.',
              headers: {
                'Content-Disposition': {
                  schema: { type: 'string' },
                  example: 'attachment; filename="my-retro-export.csv"',
                },
              },
              content: {
                'text/csv; charset=utf-8; header=present': {
                  schema: {
                    type: 'string',
                    description:
                      'A comma separated values export containing one item per row, using double-quote wrapped cell values to escape special characters. Double quote characters are escaped by doubling: `"my ""quoted"" value"`. Uses UNIX line endings (`\\n`)',
                  },
                  example:
                    'Archive,Category,Message,Votes,State\ncurrent,Happy,"Something good",0,\ncurrent,Question,"A question",2,Discussed\n"#1 (2000-01-01)",Action,"A task",0,Complete',
                },
              },
            },
            '401': { $ref: '#/components/responses/UnauthorizedError' },
            '403': { $ref: '#/components/responses/ForbiddenError' },
          },
        },
      },
      '/retros/{retro_id}/archives': {
        get: {
          summary: 'List all archives for the retro',
          security: [{ retroToken: ['readArchives'] }],
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
              description: 'A list of archives for this retro.',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    required: ['archives'],
                    properties: {
                      archives: {
                        type: 'array',
                        items: {
                          type: 'object',
                          required: ['id', 'created'],
                          properties: {
                            id: {
                              type: 'string',
                              format: 'uuid',
                              description: 'A unique ID for this archive.',
                            },
                            created: {
                              type: 'string',
                              format: 'date-time',
                              description:
                                'The time when this archive was created.',
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
            '401': { $ref: '#/components/responses/UnauthorizedError' },
            '403': { $ref: '#/components/responses/ForbiddenError' },
          },
        },
        post: {
          summary: 'Create a new archive for the retro',
          description:
            'Adds a read-only archive to the retro. The current time will be used as the archive time. Note that this does not automatically clear the current retro state: you must clear that separately if desired.',
          security: [{ retroToken: ['write'] }],
          parameters: [
            {
              name: 'retro_id',
              in: 'path',
              description: 'The ID of the retro.',
              required: true,
              schema: { type: 'string' },
            },
          ],
          requestBody: {
            description:
              'The retro content to archive. Note that this does not have to match the current retro content (e.g. you may wish to archive a subset of the current retro).',
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/RetroData' },
              },
            },
          },
          responses: {
            '200': {
              description: 'Archive created successfully.',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    required: ['id'],
                    properties: {
                      id: {
                        type: 'string',
                        format: 'uuid',
                        description:
                          'The internally-assigned unique ID of the newly created archive (used in API calls). This will never change.',
                      },
                    },
                  },
                },
              },
            },
            '401': { $ref: '#/components/responses/UnauthorizedError' },
            '403': { $ref: '#/components/responses/ForbiddenError' },
            '422': { $ref: '#/components/responses/ValidationError' },
          },
        },
      },
      '/retros/{retro_id}/archives/{archive_id}': {
        get: {
          summary: 'Read a specific archive for the retro',
          security: [{ retroToken: ['readArchives'] }],
          parameters: [
            {
              name: 'retro_id',
              in: 'path',
              description: 'The ID of the retro.',
              required: true,
              schema: { type: 'string' },
            },
            {
              name: 'archive_id',
              in: 'path',
              description: 'The ID of the retro archive.',
              required: true,
              schema: { type: 'string' },
            },
          ],
          responses: {
            '200': {
              description: 'The requested archive.',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    required: [
                      'id',
                      'retroId',
                      'format',
                      'options',
                      'items',
                      'created',
                      'imported',
                    ],
                    properties: {
                      id: {
                        type: 'string',
                        format: 'uuid',
                        description: 'A unique ID for this archive.',
                      },
                      retroId: {
                        type: 'string',
                        format: 'uuid',
                        description:
                          "The unique ID for this archive's parent retro.",
                      },
                      format: { $ref: '#/components/schemas/RetroFormat' },
                      options: { $ref: '#/components/schemas/RetroOptions' },
                      items: { $ref: '#/components/schemas/RetroItems' },
                      created: {
                        type: 'string',
                        format: 'date-time',
                        description: 'The time when this archive was created.',
                      },
                      imported: {
                        type: 'string',
                        format: 'date-time',
                        description:
                          'The time when this archive was imported (usually the same as created, but different when importing archives during retro creation).',
                      },
                    },
                  },
                },
              },
            },
            '401': { $ref: '#/components/responses/UnauthorizedError' },
            '403': { $ref: '#/components/responses/ForbiddenError' },
            '404': {
              description:
                'The requested archive ID does not exist in this retro.',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Error' },
                },
              },
            },
          },
        },
      },
    },
    components: {
      securitySchemes: {
        userToken: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'user token',
          description:
            'There is currently no API for generating user tokens for API access; the only way to get one is to manually log in to Refacto.',
        },
        retroToken: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'retro token',
          description:
            'These are issued by the `POST /auth/tokens/{retro_id}/user` and `POST /auth/tokens/{retro_id}` endpoints.',
        },
      },
      responses: {
        UnauthorizedError: {
          description:
            'The required access token was not provided, or is invalid.',
          headers: {
            'WWW-Authenticate': {
              schema: { type: 'string' },
              example: 'Bearer realm="user"',
            },
          },
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' },
            },
          },
        },
        ForbiddenError: {
          description:
            'The access token provided does not have permission to perform this operation.',
          headers: {
            'WWW-Authenticate': {
              schema: { type: 'string' },
              example: 'Bearer realm="user", scope="write"',
            },
          },
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' },
            },
          },
        },
        ValidationError: {
          description: 'The structure of the request body is incorrect.',
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
          properties: {
            error: {
              type: 'string',
              description: 'A short human-readable explanation of the error.',
            },
          },
        },
        RetroID: {
          type: 'string',
          format: 'uuid',
          description:
            'The unique ID of the retro (used in API calls). This will never change.',
        },
        RetroSlug: {
          type: 'string',
          pattern: '^[a-z0-9][a-z0-9_\\-]*$',
          description:
            'The user facing unique ID of the retro (used in the URL). This can be changed by the user.',
          example: 'my-retro',
        },
        RetroName: {
          type: 'string',
          description:
            'The free-text name of the retro, used as the title. This can be changed by the user.',
          example: 'My Retro',
        },
        RetroFormat: {
          enum: ['mood'],
          description: 'The type of the retro.',
        },
        RetroOptions: {
          type: 'object',
          title: 'Retro Options',
          properties: {
            'always-show-add-action': {
              type: 'boolean',
              default: true,
              description: "Prevent 'add action' input leaving the page",
            },
            'enable-mobile-facilitation': {
              type: 'boolean',
              default: false,
              description:
                'Allow selecting items to discuss and creating archives from mobile devices',
            },
            theme: {
              enum: [
                'faces',
                'intense',
                'symbols',
                'cats',
                'christmas',
                'halloween',
                'weather',
                'hands',
                'silly',
                'body',
                'gestures-a',
                'gestures-b',
                'poses',
                'boring-faces',
              ],
              default: 'faces',
              description: 'Icon theme for mood retros',
            },
          },
          additionalProperties: {},
          description:
            'Retro-specific settings. The contents of this structure may change in arbitrary ways in future versions.',
        },
        RetroTokenResponse: {
          type: 'object',
          required: ['retroToken', 'expires'],
          properties: {
            retroToken: {
              type: 'string',
              format: 'jwt',
              description:
                'A token which can be used to perform operations on the retro.',
            },
            expires: {
              type: 'integer',
              format: 'unix-millis',
              description: 'The time when the retro token will expire.',
            },
          },
        },
        ChangeSpec: {
          title: 'Change Spec',
          oneOf: [
            { type: 'object', additionalProperties: {} },
            { type: 'array' },
          ],
          description:
            "The change spec to apply. Requires a retro token with 'write' access. The format is described in [json-immutability-helper](https://www.npmjs.com/package/json-immutability-helper)",
          example: {
            items: [
              'if',
              ['none', { id: ['=', '00000000-0000-0000-0000-000000000000'] }],
              [
                'push',
                {
                  id: '00000000-0000-0000-0000-000000000000',
                  category: 'happy',
                  created: 946684800000,
                  message: 'A good thing',
                  attachment: null,
                  votes: 0,
                  doneTime: 0,
                },
              ],
            ],
          },
        },
        GiphyAttachment: {
          type: 'object',
          title: 'Giphy Attachment',
          required: ['type', 'url'],
          properties: {
            type: {
              enum: ['giphy'],
              description: 'The type of the attachment.',
            },
            url: {
              type: 'string',
              description: 'The URL of the image to display.',
              example:
                'https://media3.giphy.com/media/v1.Y2lkPTk5NjlhMzdkeHAyZzBya2hmbTY3OTlpb3Uwc3lwMTFjd2Fqamlwc3h4aHZucHRzbCZlcD12MV9naWZzX3NlYXJjaCZjdD1n/dzaUX7CAG0Ihi/200.webp',
            },
            alt: {
              type: 'string',
              description: 'Optional alt text for the image.',
              example: 'A waving bear',
            },
          },
        },
        Retro: {
          type: 'object',
          required: [
            'id',
            'slug',
            'name',
            'ownerId',
            'state',
            'groupStates',
            'format',
            'options',
            'items',
          ],
          properties: {
            id: { $ref: '#/components/schemas/RetroID' },
            slug: { $ref: '#/components/schemas/RetroSlug' },
            name: { $ref: '#/components/schemas/RetroName' },
            ownerId: {
              type: 'string',
              description:
                'An opaque string which uniquely identifies the owner of this retro.',
            },
            state: { $ref: '#/components/schemas/RetroState' },
            groupStates: {
              type: 'object',
              additionalProperties: {
                $ref: '#/components/schemas/RetroState',
              },
              description:
                'Group-specific state information. This is the same as state, but scoped to a specific sub-group.',
            },
            format: { $ref: '#/components/schemas/RetroFormat' },
            options: { $ref: '#/components/schemas/RetroOptions' },
            items: { $ref: '#/components/schemas/RetroItems' },
          },
        },
        RetroState: {
          type: 'object',
          title: 'Retro State',
          properties: {
            focusedItemId: {
              type: 'string',
              format: 'uuid',
              nullable: true,
              default: null,
              description: 'ID of the currently focused item for mood retros',
            },
            focusedItemTimeout: {
              type: 'integer',
              format: 'unix-millis',
              description:
                "The time when the currently focused item's timer will reach 0.",
            },
          },
          additionalProperties: {},
          description:
            'Arbitrary retro state (such as the ID of the currently selected item). The contents of this structure may change in arbitrary ways in future versions.',
        },
        RetroData: {
          type: 'object',
          required: ['format', 'options', 'items'],
          properties: {
            format: { $ref: '#/components/schemas/RetroFormat' },
            options: { $ref: '#/components/schemas/RetroOptions' },
            items: { $ref: '#/components/schemas/RetroItems' },
          },
        },
        RetroItems: {
          type: 'array',
          items: {
            type: 'object',
            title: 'Retro Item',
            required: [
              'id',
              'created',
              'category',
              'message',
              'votes',
              'doneTime',
              'attachment',
            ],
            properties: {
              id: {
                type: 'string',
                format: 'uuid',
                description:
                  'A unique identifier for this item. Note that the uniqueness of this value is not enforced by the server, so erroneous clients can cause duplicates.',
              },
              category: {
                type: 'string',
                description:
                  "The type of the item. The meaning of this will vary depending on the type of retro, but 'action' is a common category denoting Action Items.",
                example: 'happy',
              },
              created: {
                type: 'integer',
                format: 'unix-millis',
                description: 'The time when this item was first created.',
              },
              message: {
                type: 'string',
                description: 'The user-provided content of the item.',
                example: 'All is well',
              },
              votes: {
                type: 'integer',
                description: 'The number of votes the item has received.',
              },
              doneTime: {
                type: 'integer',
                format: 'unix-millis',
                description:
                  'The time when this item was marked as done (`0` if the item has not been marked as done).',
                example: 0,
              },
              attachment: {
                oneOf: [{ $ref: '#/components/schemas/GiphyAttachment' }],
                nullable: true,
              },
              group: {
                type: 'string',
                description: 'The sub-group which this item belongs to.',
              },
            },
          },
          description:
            'A list of items representing the content of the retro and any action items. This data is encrypted in the database.',
        },
        RetroExport: {
          type: 'object',
          required: ['url', 'name', 'current'],
          title: 'Exported Retro',
          properties: {
            url: {
              type: 'string',
              description:
                'The retro slug (the property name is different to match the user interface, but the meaning is the same).',
            },
            name: { $ref: '#/components/schemas/RetroName' },
            current: { $ref: '#/components/schemas/RetroExportData' },
            archives: {
              type: 'array',
              items: {
                type: 'object',
                required: ['created', 'snapshot'],
                properties: {
                  created: {
                    type: 'string',
                    format: 'date-time',
                    description: 'The time when this archive was created.',
                  },
                  snapshot: {
                    $ref: '#/components/schemas/RetroExportData',
                  },
                },
              },
            },
          },
        },
        RetroExportData: {
          type: 'object',
          required: ['format', 'options', 'items'],
          properties: {
            format: { $ref: '#/components/schemas/RetroFormat' },
            options: { $ref: '#/components/schemas/RetroOptions' },
            items: { $ref: '#/components/schemas/RetroExportItems' },
          },
        },
        RetroExportItems: {
          type: 'array',
          items: {
            type: 'object',
            title: 'Exported Retro Item',
            required: ['created', 'category', 'message', 'votes'],
            properties: {
              created: {
                type: 'string',
                format: 'date-time',
                description: 'The time when this item was first created.',
              },
              category: {
                type: 'string',
                description:
                  "The type of the item. The meaning of this will vary depending on the type of retro, but 'action' is a common category denoting Action Items.",
                example: 'happy',
              },
              message: {
                type: 'string',
                description: 'The user-provided content of the item.',
                example: 'All is well',
              },
              votes: {
                type: 'integer',
                description: 'The number of votes the item has received.',
              },
              completed: {
                type: 'string',
                format: 'date-time',
                description:
                  'The time when this item was marked as done (omitted if the item has not been marked as done).',
              },
              attachment: {
                oneOf: [{ $ref: '#/components/schemas/GiphyAttachment' }],
              },
            },
          },
          description:
            'A list of items representing the content of the retro and any action items.',
        },
      },
    },
  }),
  'utf-8',
);
