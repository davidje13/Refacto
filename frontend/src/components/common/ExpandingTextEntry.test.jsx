import React from 'react';
import { mount } from 'enzyme';

import { ExpandingTextEntry } from './ExpandingTextEntry';

describe('ExpandingTextEntry', () => {
  it('sends the entered text when submit is pressed', () => {
    const onSubmit = jest.fn().mockName('onSubmit');
    const dom = mount(<ExpandingTextEntry onSubmit={onSubmit} />);

    dom.find('textarea').simulate('change', { target: { value: 'abc' } });
    dom.find('form').simulate('submit');

    expect(onSubmit).toHaveBeenCalledWith('abc');
  });

  it('sends the entered text when the enter key is pressed', () => {
    const onSubmit = jest.fn().mockName('onSubmit');
    const dom = mount(<ExpandingTextEntry onSubmit={onSubmit} />);

    dom.find('textarea').simulate('change', { target: { value: 'abc' } });
    dom.find('textarea').simulate('keydown', { key: 'Enter' });

    expect(onSubmit).toHaveBeenCalledWith('abc');
  });

  it('does not submit blank values', () => {
    const onSubmit = jest.fn().mockName('onSubmit');
    const dom = mount(<ExpandingTextEntry onSubmit={onSubmit} />);

    dom.find('form').simulate('submit');

    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('keeps the text after submitting by default', () => {
    const dom = mount(<ExpandingTextEntry onSubmit={() => {}} />);

    dom.find('textarea').simulate('change', { target: { value: 'abc' } });
    dom.find('form').simulate('submit');

    expect(dom.find('textarea')).toHaveValue('abc');
  });

  it('clears the text after submitting if requested', () => {
    const dom = mount(<ExpandingTextEntry onSubmit={() => {}} clearAfterSubmit />);

    dom.find('textarea').simulate('change', { target: { value: 'abc' } });
    dom.find('form').simulate('submit');

    expect(dom.find('textarea')).toHaveValue('');
  });
});
