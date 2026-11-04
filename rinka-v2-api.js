/* Rinka Shop V2 DEV — public catalog client.
 * This module does not modify the legacy RinkaCatalog API or checkout.
 */
(function (global) {
  'use strict';
  const BASE_URL = 'https://rinka-shop-v2-api-dev.merchenta-store.workers.dev';
  const TIMEOUT_MS = 12000;

  async function request(path) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);
    try {
      const response = await fetch(BASE_URL + path, {
        method: 'GET',
        headers: { Accept: 'application/json' },
        signal: controller.signal,
        cache: 'no-store'
      });
      const payload = await response.json();
      if (!response.ok || payload.status !== 'ok') {
        const error = new Error(payload.code || 'CATALOG_REQUEST_FAILED');
        error.status = response.status;
        throw error;
      }
      return payload.data;
    } finally {
      clearTimeout(timeout);
    }
  }

  global.RinkaV2API = Object.freeze({
    baseUrl: BASE_URL,
    products: () => request('/api/catalog/products'),
    collections: () => request('/api/catalog/collections'),
    fandoms: () => request('/api/catalog/fandoms'),
    categories: () => request('/api/catalog/categories'),
    productBySlug: (slug) => {
      if (typeof slug !== 'string' || !/^[a-z0-9][a-z0-9_-]*$/.test(slug)) {
        return Promise.reject(new Error('INVALID_SLUG'));
      }
      return request('/api/catalog/products/' + encodeURIComponent(slug));
    }
  });
})(window);
