import React from 'react';
import { shallow } from 'enzyme';
import { makeItem } from '../../../../test-helpers/dataFactories';

import { MoodItem } from './MoodItem';
import MoodItemPlain from './MoodItemPlain';
import MoodItemFocused from './MoodItemFocused';
import ItemEditing from '../ItemEditing';

describe('MoodItem', () => {
  const item = makeItem({ message: 'a message here', id: 'my-id' });

  describe('plain', () => {
    it('displays a plain item box', () => {
      const dom = shallow(<MoodItem item={item} />);

      expect(dom.find(MoodItemPlain)).toHaveProp({ item });
    });

    it('does not assign callbacks if none are given', () => {
      const dom = shallow(<MoodItem item={item} />);

      expect(dom.find(MoodItemPlain)).toHaveProp({
        onVote: null,
        onEdit: null,
        onSelect: null,
      });
    });

    it('propagates the onVote callback if given', () => {
      const onVote = jest.fn().mockName('onVote');
      const dom = shallow(<MoodItem item={item} onVote={onVote} />);

      dom.find(MoodItemPlain).props().onVote();
      expect(onVote).toHaveBeenCalledWith(item.id);
    });

    it('propagates the onSelect callback if given', () => {
      const onSelect = jest.fn().mockName('onSelect');
      const dom = shallow(<MoodItem item={item} onSelect={onSelect} />);

      dom.find(MoodItemPlain).props().onSelect();
      expect(onSelect).toHaveBeenCalledWith(item.id);
    });
  });

  describe('editing', () => {
    let onEdit;
    let dom;

    beforeEach(() => {
      onEdit = jest.fn().mockName('onEdit');
      dom = shallow(<MoodItem item={item} onEdit={onEdit} />);

      dom.find(MoodItemPlain).props().onEdit();
    });

    it('displays an input field', () => {
      expect(dom.find(ItemEditing)).toHaveProp({ message: item.message });
      expect(dom.find(MoodItemPlain)).not.toExist();
    });

    it('propagates submitted text', () => {
      dom.find(ItemEditing).props().onSubmit('foo');
      expect(onEdit).toHaveBeenCalledWith(item.id, 'foo');

      expect(dom.find(ItemEditing)).not.toExist();
      expect(dom.find(MoodItemPlain)).toExist();
    });

    it('stops editing if cancelled', () => {
      dom.find(ItemEditing).props().onCancel();

      expect(onEdit).not.toHaveBeenCalled();

      expect(dom.find(ItemEditing)).not.toExist();
      expect(dom.find(MoodItemPlain)).toExist();
    });
  });

  describe('focused', () => {
    it('displays a focused box', () => {
      const dom = shallow(<MoodItem item={item} focused />);

      expect(dom.find(MoodItemFocused)).toHaveProp({ item });
      expect(dom.find(MoodItemPlain)).not.toExist();
    });
  });
});
