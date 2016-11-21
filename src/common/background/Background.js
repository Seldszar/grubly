/* eslint-disable class-methods-use-this */

import _ from 'lodash';
import axios from 'axios';
import debug from 'debug';


/**
 * Represents a background script.
 */
export default class Background {

  /**
   * Feedly home URL.
   *
   * @type {String}
   */
  static FEEDLY_URL = 'https://feedly.com';

  /**
   * Feedly API base URL.
   *
   * @type {String}
   */
  static FEEDLY_API_BASE_URL = 'https://feedly.com/v3';

  /**
   * Feedly home URL pattern.
   *
   * @type {RegExp}
   */
  static FEEDLY_PATTERN = /https?:\/\/feedly.com/i;

  /**
   * Constructor.
   */
  constructor() {
    this.log = debug('grubly:background');
    this.api = axios.create({
      baseURL: Background.FEEDLY_API_BASE_URL,
      responseType: 'json',
    });

    this.api.interceptors.request.use(config =>
      _.merge(config, {
        headers: {
          Authorization: this.getToken(),
        },
      })
    );

    this.onBrowserButtonClicked(() => this.openFeedlyTab());
    this.onRefreshToken(event => this.setToken(event.data));
  }

  /**
   * Starts the background script.
   */
  start() {
    this.scheduleRefresh();
    this.refresh();
  }

  /**
   * Stops the background script.
   */
  stop() {
    this.clearRefresh();
  }

  /**
   * Refreshes the badge.
   */
  refresh() {
    this.fetchUnreadCount()
      .then((unreadCount) => {
        kango.ui.browserButton.setBadgeValue(unreadCount);
        kango.ui.browserButton.setBadgeBackgroundColor([43, 178, 76, 255]);
      })
      .catch((err) => {
        this.log(err);

        kango.ui.browserButton.setBadgeValue('?');
        kango.ui.browserButton.setBadgeBackgroundColor([190, 190, 190, 230]);
      });
  }

  /**
   * Gets the Feedly authorization token.
   *
   * @return {?String}
   */
  getToken() {
    return kango.storage.getItem('token');
  }

  /**
   * Sets the Feedly authorization token.
   *
   * @param {String} token
   */
  setToken(token) {
    kango.storage.setItem('token', token);
  }

  /**
   * Finds the global marker.
   *
   * @param {Object[]} markers
   * @return {?Object}
   */
  findGlobalMarker(markers) {
    return _.find(markers, marker => _.endsWith(marker.id, '/global.all'));
  }

  /**
   * Fetches the unread count.
   *
   * @return {Promise<Number>}
   */
  fetchUnreadCount() {
    return this.api.get('/markers/counts')
      .then(response => response.data.unreadcounts)
      .then(markers => this.findGlobalMarker(markers))
      .then(marker => _.get(marker, 'count', 0));
  }

  /**
   * Schedules the refresh.
   */
  scheduleRefresh() {
    if (!this.timer) {
      this.timer = setInterval(() => this.refresh(), 60000);
    }
  }

  /**
   * Clears the refresh.
   */
  clearRefresh() {
    if (this.timer) {
      clearInterval(this.timer);
      delete this.timer;
    }
  }

  /**
   * Finds an existing Feedly tab.
   *
   * param {KangoBrowserTab[]} tabs
   * @return {?KangoBrowserTab}
   */
  findFeedlyTab(tabs) {
    return _.find(
      tabs,
      tab => Background.FEEDLY_PATTERN.test(tab.getUrl())
    );
  }

  /**
   * Focuses an existing Feedly tab, or create a new one.
   */
  openFeedlyTab() {
    kango.browser.tabs.getAll((tabs) => {
      const feedlyTab = this.findFeedlyTab(tabs);

      if (feedlyTab) {
        feedlyTab.activate();
      } else {
        kango.browser.tabs.create({
          url: Background.FEEDLY_URL,
        });
      }
    });
  }

  /**
   * Called when the user click on the browser button.
   *
   * @param {Function<Object>} listener
   */
  onBrowserButtonClicked(listener) {
    kango.ui.browserButton.addEventListener(
      kango.ui.browserButton.event.COMMAND,
      listener.bind(this)
    );
  }

  /**
   * Called when the user click on the browser button.
   *
   * @param {Function<Object>} listener
   */
  onRefreshToken(listener) {
    kango.addMessageListener(
      'RefreshToken',
      listener.bind(this)
    );
  }
}
