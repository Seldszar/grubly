/*!
 * ==UserScript==
 * @name Grubly content script
 * @namespace grubly
 * @include *://feedly.com*
 * ==/UserScript==
 */

import debug from 'debug';
import Cookies from 'js-cookie';


// Internal logger
const log = debug('grubly:content');

let timer = setInterval(() => {
  log('Checking if the public token exists...');

  const session = Cookies.getJSON('feedly.session');
  const { feedlyToken } = session;

  if (feedlyToken) {
    log('Authentication token found, refreshing extension token...');

    kango.dispatchMessage('RefreshToken', feedlyToken);

    clearInterval(timer);
    timer = null;
  }
}, 500);

// Aborts the check interval after 60 seconds
setTimeout(() => {
  if (timer) {
    clearInterval(timer);
  }
}, 60000);
