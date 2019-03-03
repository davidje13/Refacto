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

  it('invokes the given cancel callback when escape is pressed', () => {
    const onCancel = jest.fn().mockName('onCancel');
    const dom = mount(<ExpandingTextEntry onSubmit={() => {}} onCancel={onCancel} />);

    dom.find('textarea').simulate('change', { target: { value: 'abc' } });
    dom.find('textarea').simulate('keydown', { key: 'Escape' });

    expect(onCancel).toHaveBeenCalled();
  });

  it('ignores cancel requests if there is no cancel callback', () => {
    const dom = mount(<ExpandingTextEntry onSubmit={() => {}} />);

    dom.find('textarea').simulate('change', { target: { value: 'abc' } });
    dom.find('textarea').simulate('keydown', { key: 'Escape' });

    expect(dom.find('textarea')).toHaveValue('abc');
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

  it('displays extra options beside the submit button if specified', () => {
    const dom = mount(<ExpandingTextEntry onSubmit={() => {}} extraOptions={<em />} />);

    expect(dom.find('em')).toExist();
  });

  it('always applies the multiline class if extra options are given', () => {
    const dom = mount(<ExpandingTextEntry onSubmit={() => {}} extraOptions={<em />} />);

    expect(dom.find('form')).toHaveClassName('multiline');
  });
});
