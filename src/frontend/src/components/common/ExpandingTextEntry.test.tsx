import React from 'react';
import {
  render,
  fireEvent,
  RenderResult,
} from 'flexible-testing-library-react';
import { css } from '../../test-helpers/queries';

import ExpandingTextEntry from './ExpandingTextEntry';

function setValue(input: HTMLElement, value: string): void {
  fireEvent.change(input, { target: { value } });
}

const nop = (): void => undefined;

describe('ExpandingTextEntry', () => {
  describe('with no extra options', () => {
    let onSubmit: jest.Mock<(value: string) => void>;
    let dom: RenderResult;
    let textarea: HTMLTextAreaElement;

    beforeEach(() => {
      onSubmit = jest.fn().mockName('onSubmit');
      dom = render(<ExpandingTextEntry onSubmit={onSubmit} />);
      textarea = dom.getBy(css('textarea')) as HTMLTextAreaElement;
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
    let onCancel: jest.Mock<() => void>;
    let dom: RenderResult;
    let textarea: HTMLTextAreaElement;

    beforeEach(() => {
      onCancel = jest.fn().mockName('onCancel');

      dom = render(<ExpandingTextEntry onSubmit={nop} onCancel={onCancel} />);
      textarea = dom.getBy(css('textarea')) as HTMLTextAreaElement;
    });

    it('invokes the given callback when escape is pressed', () => {
      setValue(textarea, 'abc');
      fireEvent.keyDown(textarea, { key: 'Escape' });

      expect(onCancel).toHaveBeenCalled();
    });
  });

  describe('clearAfterSubmit', () => {
    let dom: RenderResult;
    let textarea: HTMLTextAreaElement;

    beforeEach(() => {
      dom = render(<ExpandingTextEntry onSubmit={nop} clearAfterSubmit />);
      textarea = dom.getBy(css('textarea')) as HTMLTextAreaElement;
    });

    it('clears the text after submitting', () => {
      setValue(textarea, 'abc');
      fireEvent.submit(textarea);

      expect(textarea.value).toEqual('');
    });
  });

  describe('extraInputs', () => {
    it('displays extra inputs beside the textarea', () => {
      const dom = render(
        <ExpandingTextEntry onSubmit={nop} extraInputs={<em />} />,
      );

      expect(dom).toContainElementWith(css('em'));
    });

    it('always applies the multiline class if extra inputs are given', () => {
      const dom = render(
        <ExpandingTextEntry onSubmit={nop} extraInputs={<em />} />,
      );

      expect(dom).toContainElementWith(css('form.multiline'));
    });

    it('does not apply multiline if no items are provided', () => {
      const dom = render(
        <ExpandingTextEntry onSubmit={nop} extraInputs={[]} />,
      );

      expect(dom).not.toContainElementWith(css('form.multiline'));
    });
  });

  describe('pre-/postSubmitOptions', () => {
    it('displays extra options beside the submit button', () => {
      const dom = render(
        <ExpandingTextEntry
          onSubmit={nop}
          preSubmitOptions={<em />}
          postSubmitOptions={<strong />}
        />,
      );

      expect(dom).toContainElementWith(css('em'));
      expect(dom).toContainElementWith(css('strong'));
    });

    it('accepts lists', () => {
      const dom = render(
        <ExpandingTextEntry
          onSubmit={nop}
          preSubmitOptions={[<em key="a" />, <strong key="b" />]}
          postSubmitOptions={[<b key="a" />, <i key="b" />]}
        />,
      );

      expect(dom).toContainElementWith(css('em'));
      expect(dom).toContainElementWith(css('strong'));
      expect(dom).toContainElementWith(css('b'));
      expect(dom).toContainElementWith(css('i'));
    });
  });
});
