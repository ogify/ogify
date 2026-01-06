# Caching

OGify includes a smart caching layer to improve performance by reducing the need to re-download fonts or re-process static assets.

## Configuration

You can configure caching when creating the renderer using `createRenderer`.

### Memory Cache (Default)

The default cache strategy uses an LRU (Least Recently Used) cache in memory.

```typescript
const renderer = createRenderer({
  templates: { basic: template },
  cache: {
    type: 'memory',
    ttl: 3600000, // Time to live in ms (e.g., 1 hour)
    max: 100 // Maximum number of items
  }
});
```

### Filesystem Cache

For persistence across server restarts (useful in serverless functions if utilizing `/tmp` or persistent storage), you can use the filesystem cache.

```typescript
const renderer = createRenderer({
  templates: { basic: template },
  cache: {
    type: 'filesystem',
    dir: './.ogify-cache', // Directory to store cache files
    ttl: 3600000, // 1 hour
    max: 100
  }
});
```

## What is Cached?

1. **Remote Fonts**: Fonts downloaded from Google Fonts or other URLs are cached to avoid repeated network requests.
2. **Generated Images**: (Optional implementation detail) Depending on how you use `renderToImage`, repeats of the *exact same parameters* may be served from cache if the renderer implements result caching (currently focuses on asset caching).

## Disabling Cache

To disable caching completely (not recommended for production):

```typescript
const renderer = createRenderer({
  // ...
  cache: false
});
```
