interface RetroOptions {
  name: string;
  slug: string;
  password: string;
  userToken: string;
}

export default class RetroService {
  public constructor(
    private readonly apiBase: string,
  ) {}

  public async create({
    name,
    slug,
    password,
    userToken,
  }: RetroOptions): Promise<string> {
    const response = await fetch(
      `${this.apiBase}/retros`,
      {
        method: 'POST',
        cache: 'no-cache',
        headers: {
          Authorization: `Bearer ${userToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, slug, password }),
      },
    );
    const body = await response.json();
    if (response.status >= 300 || body.error) {
      throw new Error(body.error || 'Connection failed');
    }
    return body.id;
  }
}
