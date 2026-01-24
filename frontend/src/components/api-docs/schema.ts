export type JsonSchema = {
  title?: string;
  default?: unknown;
  nullable?: boolean;
  description?: string;
  example?: unknown;
} & (
  | { type?: never; oneOf: JsonSchemaRef[] }
  | { type?: never; enum: string[] }
  | { type: 'boolean' }
  | { type: 'integer'; format?: 'unix-millis' }
  | { type: 'number' }
  | { type: 'string'; format?: 'jwt' | 'date-time' | 'uuid'; pattern?: string }
  | {
      type: 'object';
      required?: string[];
      properties?: { [key: string]: JsonSchemaRef };
      additionalProperties?: boolean | JsonSchemaRef;
      minProperties?: number;
    }
  | { type: 'array'; items?: JsonSchemaRef }
  | { type?: never }
);

export type JsonSchemaRef = { $ref: string } | JsonSchema;

export interface ParameterSpec {
  name: string;
  in: 'path' | 'query';
  description: string;
  required: boolean;
  schema?: JsonSchemaRef;
  content?: {
    [mime: string]: { schema: JsonSchemaRef };
  };
  example?: string;
  default?: string;
}

export interface RequestSpec {
  schema?: JsonSchemaRef;
}

export interface ResponseSpec {
  description: string;
  headers?: {
    [header: string]: { schema: JsonSchemaRef; example?: string };
  };
  content?: {
    [mime: string]: { schema?: JsonSchemaRef; example?: unknown };
  };
}

export interface MethodSpec {
  summary: string;
  description?: string;
  security?: { [id: string]: string[] }[];
  parameters?: ParameterSpec[];
  requestBody?: {
    content: { [mime: string]: RequestSpec };
    required: boolean;
    description?: string;
  };
  responses: { [status: string]: ResponseSpec | { $ref: string } };
}

export interface SecuritySchemeSpec {
  type: 'http' | 'apiKey';
  in?: string;
  name?: string;
  scheme?: 'bearer';
  bearerFormat?: string;
  description: string;
}

export interface OpenApiSpec {
  paths: { [path: string]: { [method: string]: MethodSpec } };
  servers?: { url: string }[];
  components: {
    securitySchemes: { [id: string]: SecuritySchemeSpec };
    responses: { [id: string]: ResponseSpec };
    schemas: { [id: string]: JsonSchemaRef };
  };
}

export function resolveRef<T>(spec: OpenApiSpec, o: T | { $ref: string }): T {
  if (!o || typeof o !== 'object') {
    throw new Error('invalid entity');
  }
  if (!('$ref' in o)) {
    return o;
  }
  const ref = o.$ref;
  let cur: unknown = spec;
  for (const part of ref.substring(2).split('/')) {
    if (cur && typeof cur === 'object' && part in cur) {
      cur = (cur as any)[part];
    } else {
      throw new Error(`invalid ref: ${ref}`);
    }
  }
  return cur as T;
}

export function resolveSecurity(spec: OpenApiSpec, id: string) {
  const security = spec.components.securitySchemes[id];
  if (!security) {
    throw new Error(`Missing security definition: ${id}`);
  }
  return security;
}
