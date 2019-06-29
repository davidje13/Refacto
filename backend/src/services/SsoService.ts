import extractGoogleId from './sso/GoogleSso';
import extractGitHubId from './sso/GitHubSso';

type ConfiguredExtractor = (externalToken: string) => Promise<string>;

interface Extractors {
  [service: string]: ConfiguredExtractor | undefined;
}

function bindExtractor<T>(
  extractor: (config: T, externalToken: string) => Promise<string>,
  config: T,
): ConfiguredExtractor | undefined {
  if (!config) {
    return undefined;
  }
  return extractor.bind(null, config);
}

export default class SsoService {
  private readonly extractors: Extractors;

  public constructor(
    configs: { [service: string]: any },
  ) {
    this.extractors = {
      google: bindExtractor(extractGoogleId, configs.google),
      github: bindExtractor(extractGitHubId, configs.github),
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
