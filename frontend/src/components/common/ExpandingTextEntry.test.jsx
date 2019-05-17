import React from 'react';
import { render, fireEvent } from 'react-testing-library';

import ExpandingTextEntry from './ExpandingTextEntry';

function setValue(input, value) {
  fireEvent.change(input, { target: { value } });
}

describe('ExpandingTextEntry', () => {
  describe('with no extra options', () => {
    let onSubmit;
    let rendered;
    let textarea;

    beforeEach(() => {
      onSubmit = jest.fn().mockName('onSubmit');
      rendered = render(<ExpandingTextEntry onSubmit={onSubmit} />);
      textarea = rendered.container.querySelector('textarea');
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
    let rendered;
    let textarea;

    beforeEach(() => {
      onCancel = jest.fn().mockName('onCancel');

      rendered = render((
        <ExpandingTextEntry
          onSubmit={() => {}}
          onCancel={onCancel}
        />
      ));
      textarea = rendered.container.querySelector('textarea');
    });

    it('invokes the given callback when escape is pressed', () => {
      setValue(textarea, 'abc');
      fireEvent.keyDown(textarea, { key: 'Escape' });

      expect(onCancel).toHaveBeenCalled();
    });
  });

  describe('clearAfterSubmit', () => {
    let rendered;
    let textarea;

    beforeEach(() => {
      rendered = render((
        <ExpandingTextEntry
          onSubmit={() => {}}
          clearAfterSubmit
        />
      ));
      textarea = rendered.container.querySelector('textarea');
    });

    it('clears the text after submitting', () => {
      setValue(textarea, 'abc');
      fireEvent.submit(textarea);

      expect(textarea.value).toEqual('');
    });
  });

  describe('extraOptions', () => {
    let rendered;

    beforeEach(() => {
      rendered = render((
        <ExpandingTextEntry
          onSubmit={() => {}}
          extraOptions={<em />}
        />
      ));
    });

    it('displays extra options beside the submit button', () => {
      expect(rendered.container).toContainQuerySelector('em');
    });

    it('always applies the multiline class if extra options are given', () => {
      expect(rendered.container).toContainQuerySelector('form.multiline');
    });
  });
});
