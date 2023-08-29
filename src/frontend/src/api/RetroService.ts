import type { JsonData } from '../shared/api-entities';

interface RetroOptions {
  name: string;
  slug: string;
  password: string;
  userToken: string;
  importJson?: JsonData | undefined;
}

export interface RetroCreationInfo {
  id: string;
  token: string;
}

export default class RetroService {
  public constructor(private readonly apiBase: string) {}

  public async create({
    name,
    slug,
    password,
    userToken,
    importJson,
  }: RetroOptions): Promise<RetroCreationInfo> {
    const requestBody: JsonData = { name, slug, password };
    if (importJson) {
      requestBody['importJson'] = importJson;
    }
    const response = await fetch(`${this.apiBase}/retros`, {
      method: 'POST',
      cache: 'no-cache',
      headers: {
        Authorization: `Bearer ${userToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });
    const body = await response.json();
    if (response.status >= 300 || body.error) {
      throw new Error(body.error || 'Connection failed');
    }
    return body;
  }
}
