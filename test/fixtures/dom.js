import jsdom from 'jsdom';

// Setup the simplest document possible.
const document = jsdom.jsdom('<!doctype html><html><body></body></html>');

// Set the window object out of the document.
const window = document.defaultView;

export default {
  document,
  window,
  ...window,
};
