import { UserAgent } from './UserAgent';

describe('UserAgent', () => {
  it('parses user agent strings into an object structure', () => {
    const ua = new UserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
    );
    expect(ua.getSummary()).equals({
      platform: 'Windows',
      browser: 'Chrome@131',
    });
  });

  it('excludes version when called with false', () => {
    const ua = new UserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
    );
    expect(ua.getSummary(false)).equals({
      platform: 'Windows',
      browser: 'Chrome',
    });
  });

  it('handles empty strings', () => {
    const ua = new UserAgent('');
    expect(ua.getSummary()).equals({ platform: null, browser: null });
  });

  it(
    'parses common browser user agent strings',
    (params) => {
      const { name, expected } = params as any;
      const { platform, browser } = new UserAgent(name).getSummary();
      expect(`${platform} / ${browser}`).equals(expected);
    },
    {
      parameters: [
        {
          name: 'Mozilla/4.0 (compatible; MSIE 8.0; Windows NT 5.1; Trident/4.0)',
          expected: 'Windows / IE@8',
        },
        {
          name: 'Mozilla/5.0 (compatible; MSIE 10.0; Windows NT 6.1; Trident/6.0)',
          expected: 'Windows / IE@10',
        },
        {
          name: 'Mozilla/5.0 (Windows NT 6.1; Trident/7.0; rv:11.0) like Gecko',
          expected: 'Windows / IE@11',
        },
        {
          name: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36 Edg/131.0.2903.86',
          expected: 'Windows / Edge@131',
        },
        {
          name: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36 Edg/131.0.2903.86',
          expected: 'Mac / Edge@131',
        },
        {
          name: 'Mozilla/5.0 (Linux; Android 10; HD1913) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.6778.200 Mobile Safari/537.36 EdgA/131.0.2903.87',
          expected: 'Android / Edge@131',
        },
        {
          name: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_7_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 EdgiOS/131.2903.92 Mobile/15E148 Safari/605.1.15',
          expected: 'iPhone / Edge (webkit)@131',
        },
        {
          name: 'Mozilla/5.0 (Windows Mobile 10; Android 10.0; Microsoft; Lumia 950XL) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Mobile Safari/537.36 Edge/40.15254.603',
          expected: 'Windows Mobile / Edge@40',
        },
        {
          name: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; Xbox; Xbox One) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36 Edge/44.18363.8131',
          expected: 'Xbox / Edge@44',
        },
        {
          name: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
          expected: 'Windows / Chrome@131',
        },
        {
          name: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
          expected: 'Mac / Chrome@131',
        },
        {
          name: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
          expected: 'Linux / Chrome@131',
        },
        {
          name: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/131.0.6778.154 Mobile/15E148 Safari/604.1',
          expected: 'iPhone / Chrome (webkit)@131',
        },
        {
          name: 'Mozilla/5.0 (iPad; CPU OS 17_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/131.0.6778.154 Mobile/15E148 Safari/604.1',
          expected: 'iPad / Chrome (webkit)@131',
        },
        {
          name: 'Mozilla/5.0 (iPod; CPU iPhone OS 17_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/131.0.6778.154 Mobile/15E148 Safari/604.1',
          expected: 'iPod / Chrome (webkit)@131',
        },
        {
          name: 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.6778.200 Mobile Safari/537.36',
          expected: 'Android / Chrome@131',
        },
        {
          name: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:133.0) Gecko/20100101 Firefox/133.0',
          expected: 'Windows / Firefox@133',
        },
        {
          name: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 14.7; rv:133.0) Gecko/20100101 Firefox/133.0',
          expected: 'Mac / Firefox@133',
        },
        {
          name: 'Mozilla/5.0 (X11; Linux i686; rv:133.0) Gecko/20100101 Firefox/133.0',
          expected: 'Linux / Firefox@133',
        },
        {
          name: 'Mozilla/5.0 (X11; Linux x86_64; rv:133.0) Gecko/20100101 Firefox/133.0',
          expected: 'Linux / Firefox@133',
        },
        {
          name: 'Mozilla/5.0 (X11; Ubuntu; Linux i686; rv:133.0) Gecko/20100101 Firefox/133.0',
          expected: 'Linux / Firefox@133',
        },
        {
          name: 'Mozilla/5.0 (X11; Fedora; Linux x86_64; rv:128.0) Gecko/20100101 Firefox/128.0',
          expected: 'Linux / Firefox@128',
        },
        {
          name: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) FxiOS/133.0 Mobile/15E148 Safari/605.1.15',
          expected: 'iPhone / Firefox (webkit)@133',
        },
        {
          name: 'Mozilla/5.0 (iPad; CPU OS 14_7_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) FxiOS/133.0 Mobile/15E148 Safari/605.1.15',
          expected: 'iPad / Firefox (webkit)@133',
        },
        {
          name: 'Mozilla/5.0 (iPod touch; CPU iPhone OS 14_7_2 like Mac OS X) AppleWebKit/604.5.6 (KHTML, like Gecko) FxiOS/133.0 Mobile/15E148 Safari/605.1.15',
          expected: 'iPod / Firefox (webkit)@133',
        },
        {
          name: 'Mozilla/5.0 (Android 15; Mobile; rv:133.0) Gecko/133.0 Firefox/133.0',
          expected: 'Android / Firefox@133',
        },
        {
          name: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_7_2) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4.1 Safari/605.1.15',
          expected: 'Mac / Safari@17',
        },
        {
          name: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_7_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4.1 Mobile/15E148 Safari/604.1',
          expected: 'iPhone / Safari@17',
        },
        {
          name: 'Mozilla/5.0 (iPad; CPU OS 17_7_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4.1 Mobile/15E148 Safari/604.1',
          expected: 'iPad / Safari@17',
        },
        {
          name: 'Mozilla/5.0 (iPod touch; CPU iPhone 17_7_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4.1 Mobile/15E148 Safari/604.1',
          expected: 'iPod / Safari@17',
        },
        {
          name: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36 OPR/117.0.0.0',
          expected: 'Windows / Opera@117',
        },
        {
          name: 'Mozilla/5.0 (Windows NT 10.0; WOW64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36 OPR/117.0.0.0',
          expected: 'Windows / Opera@117',
        },
        {
          name: 'Opera/9.60 (Windows NT 6.0; U; en) Presto/2.1.1',
          expected: 'Windows / Opera@9',
        },
        {
          name: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_7_2) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36 OPR/117.0.0.0',
          expected: 'Mac / Opera@117',
        },
        {
          name: 'Opera/9.80 (Macintosh; Intel Mac OS X; U; en) Presto/2.2.15 Version/10.00',
          expected: 'Mac / Opera@9',
        },
        {
          name: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36 OPR/117.0.0.0',
          expected: 'Linux / Opera@117',
        },
        {
          name: 'Mozilla/5.0 (Linux; Android 10; VOG-L29) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.6778.200 Mobile Safari/537.36 OPR/76.2.4027.73374',
          expected: 'Android / Opera@76',
        },
        {
          name: 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36 Vivaldi/7.0.3495.27',
          expected: 'Windows / Vivaldi@7',
        },
        {
          name: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_7_2) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36 Vivaldi/7.0.3495.27',
          expected: 'Mac / Vivaldi@7',
        },
        {
          name: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36 Vivaldi/7.0.3495.27',
          expected: 'Linux / Vivaldi@7',
        },
        {
          name: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 YaBrowser/24.12.0.1846 Yowser/2.5 Safari/537.36',
          expected: 'Windows / Yandex@24',
        },
        {
          name: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 YaBrowser/24.12.0.1846 Yowser/2.5 Safari/537.36',
          expected: 'Mac / Yandex@24',
        },
        {
          name: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_7_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4.1 YaBrowser/24.12.4.459 Mobile/15E148 Safari/604.1',
          expected: 'iPhone / Yandex@24',
        },
        {
          name: 'Mozilla/5.0 (iPad; CPU OS 17_7_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4.1 YaBrowser/24.12.4.459 Mobile/15E148 Safari/605.1',
          expected: 'iPad / Yandex@24',
        },
        {
          name: 'Mozilla/5.0 (iPod touch; CPU iPhone 17_7_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4.1 YaBrowser/24.12.4.459 Mobile/15E148 Safari/605.1',
          expected: 'iPod / Yandex@24',
        },
        {
          name: 'Mozilla/5.0 (Linux; arm_64; Android 15; SM-G965F) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.6778.200 YaBrowser/24.12.3.100 Mobile Safari/537.36',
          expected: 'Android / Yandex@24',
        },
        {
          name: 'Mozilla/5.0 (compatible; MSIE 9.0; Windows Phone OS 7.5; Trident/5.0; IEMobile/9.0)',
          expected: 'Windows Mobile / IE Mobile@9',
        },
        {
          name: 'HTC_Touch_3G Mozilla/4.0 (compatible; MSIE 6.0; Windows CE; IEMobile 7.11)',
          expected: 'htc_touch_3g / IE Mobile@7',
        },
        {
          name: 'Mozilla/5.0 (iPad; U; CPU OS 3_2_1 like Mac OS X; en-us) AppleWebKit/531.21.10 (KHTML, like Gecko) Mobile/7B405',
          expected: 'iPad / Safari',
        },
        {
          name: 'Mozilla/5.0 (X11; CrOS x86_64 15917.71.0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.6533.132 Safari/537.36',
          expected: 'Chrome OS / Chrome@127',
        },
        {
          name: 'Mozilla/5.0 (X11; CrOS aarch64 15917.71.0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.6533.132 Safari/537.36',
          expected: 'Chrome OS / Chrome@127',
        },
      ],
    },
  );
});
