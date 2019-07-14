import extractGoogleId, { GoogleConfig } from './sso/GoogleSso';
import extractGitHubId, { GitHubConfig } from './sso/GitHubSso';

type ConfiguredExtractor = (externalToken: string) => Promise<string>;

interface Extractors {
  [service: string]: ConfiguredExtractor | undefined;
}

interface BaseConfig {
  clientId?: string;
}

function bindExtractor<T extends BaseConfig>(
  extractor: (config: T, externalToken: string) => Promise<string>,
  config: T,
): ConfiguredExtractor | undefined {
  if (!config || !config.clientId) {
    return undefined;
  }
  return extractor.bind(null, config);
}

export default class SsoService {
  private readonly extractors: Extractors;

  public constructor(
    configs: Record<string, BaseConfig>,
  ) {
    this.extractors = {
      google: bindExtractor(extractGoogleId, configs.google as GoogleConfig),
      github: bindExtractor(extractGitHubId, configs.github as GitHubConfig),
    };
  }

  public supportsService(service: string): boolean {
    return Boolean(this.extractors[service]);
  }

  public extractId(
    service: string,
    externalToken: string,
  ): Promise<string> {
    const extractor = this.extractors[service];

    if (!extractor) {
      throw new Error(`SSO integration with ${service} is not supported`);
    }

    return extractor(externalToken);
  }
}
