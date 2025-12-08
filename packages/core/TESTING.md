# Testing Guide for @ogify/core

This package uses [Vitest](https://vitest.dev/) for unit testing.

## Running Tests

```bash
# Run all tests once
pnpm test

# Run tests in watch mode (re-runs on file changes)
pnpm test:watch

# Run tests with UI (interactive browser-based test runner)
pnpm test:ui

# Run tests with coverage report
pnpm test:coverage
```

## Test Structure

Tests are located in the `test/` directory, mirroring the structure of `src/`:

```text
packages/core/
├── src/
│   ├── types.ts
│   └── utils/
│       └── fetcher.ts
└── test/
    ├── types.test.ts          # Tests for type definitions
    └── utils/
        └── fetcher.test.ts    # Tests for fetcher utility
```

## Writing Tests

### Basic Test Example

```typescript
import { describe, it, expect } from 'vitest';
import { myFunction } from './my-module';

describe('myFunction', () => {
  it('should do something', () => {
    const result = myFunction('input');
    expect(result).toBe('expected output');
  });
});
```

### Mocking Example

```typescript
import { describe, it, expect, vi } from 'vitest';

describe('with mocks', () => {
  it('should mock fetch', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      json: () => Promise.resolve({ data: 'test' }),
    });

    // Your test code here
  });
});
```

## Test Configuration

The test configuration is defined in `vitest.config.ts`:

- **Environment**: `happy-dom` (lightweight DOM implementation)
- **Globals**: Enabled (no need to import `describe`, `it`, `expect` in every file)
- **Coverage**: V8 provider with text, JSON, and HTML reporters

## Coverage

Coverage reports are generated in the `coverage/` directory when running `pnpm test:coverage`.

The following are excluded from coverage:

- `node_modules/`
- `dist/`
- Type definition files (`*.d.ts`)
- Config files (`*.config.*`)
- Index files (`index.ts`)

## Best Practices

1. **Co-locate tests**: Keep test files next to the source files they test
2. **Descriptive names**: Use clear, descriptive test names that explain what is being tested
3. **Arrange-Act-Assert**: Structure tests with clear setup, execution, and assertion phases
4. **Test behavior, not implementation**: Focus on what the code does, not how it does it
5. **Mock external dependencies**: Use mocks for network requests, file system operations, etc.
6. **Clean up**: Reset mocks and clear state between tests using `beforeEach` hooks

## Continuous Integration

Tests run automatically in CI/CD pipelines via the `pnpm test` command defined in the root `package.json`.
