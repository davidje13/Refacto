import { act, render, role } from 'flexible-testing-library-react';

import { MoodRetro } from './MoodRetro';

const nop = () => undefined;

describe('MoodRetro', () => {
  it('can switch between wide and narrow view', () => {
    const { getAllBy } = render(
      <MoodRetro
        retroOptions={{}}
        retroItems={[]}
        retroState={{}}
        archive={false}
        onComplete={nop}
        dispatch={nop}
      />,
    );

    expect(
      getAllBy(role('textbox')).map((i) => i.getAttribute('placeholder')),
    ).toEqual([
      'I\u2019m glad that\u2026',
      'I\u2019m wondering about\u2026',
      'It wasn\u2019t so great that\u2026',
      'Add an action item',
    ]);

    const originalWidth = window.innerWidth;
    window.innerWidth = 200;
    try {
      act(() => window.dispatchEvent(new UIEvent('resize')));

      expect(
        getAllBy(role('textbox')).map((i) => i.getAttribute('placeholder')),
      ).toEqual(['I\u2019m glad that\u2026']);
    } finally {
      window.innerWidth = originalWidth;
    }
  });
});
