export class UserAgent {
  private readonly brands = new Map<string, string>();

  constructor(ua: string) {
    for (const part of ua.matchAll(UA_PART)) {
      const [, brand = '', version = '', meta = ''] = part;
      this.brands.set(brand.toLowerCase(), version);
      for (const fragment of meta.split(';')) {
        const norm = fragment.replace(/[, ]+like.*/i, '').trim();
        if (norm) {
          const split = norm.match(META_PART);
          if (split) {
            let subBrand = (split[1] ?? '').toLowerCase();
            if (subBrand.startsWith('cros ')) {
              subBrand = 'cros';
            }
            this.brands.set(subBrand, split[2] ?? '');
          } else {
            this.brands.set(norm.toLowerCase(), '');
          }
        }
      }
    }
  }

  private readBrand(lookup: BrandLookup[], includeVersion: boolean) {
    for (const { brands, name, vbrand } of lookup) {
      if (brands.every((b) => this.brands.has(b))) {
        const rawVersion = includeVersion ? this.brands.get(vbrand) : null;
        return {
          name: name,
          version: rawVersion?.split('.')[0] || null,
        };
      }
    }
    const first = this.brands.entries().next().value;
    if (first && first[0] !== 'gecko' && first[0] !== 'mozilla') {
      const rawVersion = includeVersion ? first[1] : null;
      return { name: first[0], version: rawVersion?.split('.')[0] || null };
    }
    return { name: 'unknown', version: null };
  }

  getSummary(includeVersion = true) {
    const { name, version } = this.readBrand(BROWSER_BRANDS, includeVersion);
    return {
      platform: this.readBrand(PLATFORM_BRANDS, false).name,
      browser: includeVersion && version ? `${name}@${version}` : name,
    };
  }
}

const PLATFORM_BRANDS = [
  'cros=Chrome OS',
  'windows mobile=Windows Mobile',
  'windows phone os=Windows Mobile',
  'android=Android',
  'iphone=iPhone',
  'ipad=iPad',
  'ipod=iPod',
  'linux+mobile=Android',
  'mobile=Mobile',
  'linux=Linux',
  'xbox=Xbox',
  'windows nt=Windows',
  'win64=Windows',
  'macintosh=Mac',
  'microsoft=Windows',
].map(readBrandLookup);

const BROWSER_BRANDS = [
  'samsungbrowser=Samsung Internet',
  'ucbrowser=UC',
  'mqqbrowser=QQ',
  'netscape=Netscape',
  'navigator=Netscape',
  'vivaldi=Vivaldi',
  'opera=Opera',
  'opr=Opera',
  'fxios=Firefox (webkit)',
  'edgios=Edge (webkit)',
  'crios=Chrome (webkit)',
  'firefox=Firefox',
  'edge=Edge',
  'edg=Edge',
  'edga=Edge',
  'yabrowser=Yandex',
  'chrome=Chrome',
  'safari=Safari@version',
  'applewebkit=Safari@version',
  'iemobile=IE Mobile',
  'msie=IE',
  'trident=IE@rv',
  'mozilla=Netscape',
].map(readBrandLookup);

function readBrandLookup(data: string): BrandLookup {
  const [find, assign = ''] = data.split('=');
  const brands = find!.split('+');
  const [name, vbrand = brands[0]] = assign.split('@');
  return { brands, name: name!, vbrand: vbrand! };
}

const UA_PART = /([^/ ]+)(?:\/([^/ ]+))?(?: \(([^)]+)\))?/g;
const META_PART = /^([^:/]+)[:/ ]([^:/ ]+)$/;

interface BrandLookup {
  brands: string[];
  name: string;
  vbrand: string;
}
