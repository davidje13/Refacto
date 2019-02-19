import React from 'react';
import { StaticRouter } from 'react-router-dom';
import { mount } from 'enzyme';
import App from './App';

describe('Application', () => {
  it('renders welcome page at root', () => {
    const context = {};
    const dom = mount((
      <StaticRouter location="/" context={context}>
        <App />
      </StaticRouter>
    ));
    expect(dom).toContainMatchingElement('.page-welcome');
    expect(dom).not.toContainMatchingElement('.page-retro');
  });

  it('renders retro list page at /retros/', () => {
    const context = {};
    const dom = mount((
      <StaticRouter location="/retros/" context={context}>
        <App />
      </StaticRouter>
    ));
    expect(dom).toContainMatchingElement('.page-retro-list');
  });

  it('renders retro page at /retros/id', () => {
    const context = {};
    const dom = mount((
      <StaticRouter location="/retros/foobar" context={context}>
        <App />
      </StaticRouter>
    ));
    expect(dom).toContainMatchingElement('.page-retro');
  });

  it('renders not found page at unknown urls', () => {
    const context = {};
    const dom = mount((
      <StaticRouter location="/nope" context={context}>
        <App />
      </StaticRouter>
    ));
    expect(dom).toContainMatchingElement('.page-not-found');
  });
});
