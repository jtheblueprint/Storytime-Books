import { defaultCache } from "@serwist/next/worker";
import { Serwist } from "serwist";

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: false,
  runtimeCaching: [
    ...defaultCache,
    {
      urlPattern: /^https:\/\/openlibrary\.org\/.*/i,
      handler: "NetworkFirst",
      options: {
        cacheName: "openlibrary-api",
        expiration: { maxEntries: 50, maxAgeSeconds: 86400 },
        networkTimeoutSeconds: 5,
      },
    },
    {
      urlPattern: /^https:\/\/covers\.openlibrary\.org\/.*/i,
      handler: "CacheFirst",
      options: {
        cacheName: "book-covers",
        expiration: { maxEntries: 200, maxAgeSeconds: 604800 },
      },
    },
    {
      urlPattern: /^https:\/\/fonts\.(googleapis|gstatic)\.com\/.*/i,
      handler: "CacheFirst",
      options: {
        cacheName: "google-fonts",
        expiration: { maxEntries: 10, maxAgeSeconds: 31536000 },
      },
    },
  ],
});

serwist.addEventListeners();
