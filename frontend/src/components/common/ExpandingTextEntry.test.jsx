import React from 'react';
import { render, fireEvent } from 'react-testing-library';
import { queries, css } from '../../test-helpers/queries';

import ExpandingTextEntry from './ExpandingTextEntry';

function setValue(input, value) {
  fireEvent.change(input, { target: { value } });
}

describe('ExpandingTextEntry', () => {
  describe('with no extra options', () => {
    let onSubmit;
    let dom;
    let textarea;

    beforeEach(() => {
      onSubmit = jest.fn().mockName('onSubmit');
      dom = render(<ExpandingTextEntry onSubmit={onSubmit} />, { queries });
      textarea = dom.getBy(css('textarea'));
    });

    it('sends the entered text when submit is pressed', () => {
      setValue(textarea, 'abc');
      fireEvent.submit(textarea);

      expect(onSubmit).toHaveBeenCalledWith('abc');
    });

    it('sends the entered text when the enter key is pressed', () => {
      setValue(textarea, 'abc');
      fireEvent.keyDown(textarea, { key: 'Enter' });

      expect(onSubmit).toHaveBeenCalledWith('abc');
    });

    it('ignores cancel requests', () => {
      setValue(textarea, 'abc');
      fireEvent.keyDown(textarea, { key: 'Escape' });

      expect(textarea.value).toEqual('abc');
    });

    it('does not submit blank values', () => {
      fireEvent.submit(textarea);

      expect(onSubmit).not.toHaveBeenCalled();
    });

    it('keeps the text after submitting', () => {
      setValue(textarea, 'abc');
      fireEvent.submit(textarea);

      expect(textarea.value).toEqual('abc');
    });
  });

  describe('onCancel', () => {
    let onCancel;
    let dom;
    let textarea;

    beforeEach(() => {
      onCancel = jest.fn().mockName('onCancel');

      dom = render((
        <ExpandingTextEntry
          onSubmit={() => {}}
          onCancel={onCancel}
        />
      ), { queries });
      textarea = dom.getBy(css('textarea'));
    });

    it('invokes the given callback when escape is pressed', () => {
      setValue(textarea, 'abc');
      fireEvent.keyDown(textarea, { key: 'Escape' });

      expect(onCancel).toHaveBeenCalled();
    });
  });

  describe('clearAfterSubmit', () => {
    let dom;
    let textarea;

    beforeEach(() => {
      dom = render((
        <ExpandingTextEntry
          onSubmit={() => {}}
          clearAfterSubmit
        />
      ), { queries });
      textarea = dom.getBy(css('textarea'));
    });

    it('clears the text after submitting', () => {
      setValue(textarea, 'abc');
      fireEvent.submit(textarea);

      expect(textarea.value).toEqual('');
    });
  });

  describe('extraOptions', () => {
    let dom;

    beforeEach(() => {
      dom = render((
        <ExpandingTextEntry
          onSubmit={() => {}}
          extraOptions={<em />}
        />
      ), { queries });
    });

    it('displays extra options beside the submit button', () => {
      expect(dom).toContainElementWith(css('em'));
    });

    it('always applies the multiline class if extra options are given', () => {
      expect(dom).toContainElementWith(css('form.multiline'));
    });
  });
});
