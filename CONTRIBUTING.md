# Contributing to react-state-vitals

Thank you for your interest in contributing! This guide will help you get started.

## Getting started

1. Fork the repository and clone your fork.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the tests to make sure everything passes:
   ```bash
   npm test
   ```

## Development workflow

| Command | Description |
|---|---|
| `npm run build` | Build the package |
| `npm run dev` | Build in watch mode |
| `npm test` | Run tests once |
| `npm run test:watch` | Run tests in watch mode |
| `npm run typecheck` | Type-check without emitting |
| `npm run lint` | Lint source files |

## Project structure

```
src/
  core/          # Event bus, registry, memory utilities
  integrations/
    context/     # React Context monitoring
    zustand/     # Zustand integration
    react-query/ # TanStack Query integration
  panel/         # Dev panel UI component
```

## Submitting changes

1. Create a branch from `main`:
   ```bash
   git checkout -b feat/your-feature
   ```
2. Make your changes and add tests where applicable.
3. Ensure `npm test`, `npm run typecheck`, and `npm run lint` all pass.
4. Open a pull request against `main` with a clear description of the change and why it is needed.

## Reporting bugs

Open an issue using the **Bug report** template. Include a minimal reproduction if possible.

## Suggesting features

Open an issue using the **Feature request** template.

## Code style

- TypeScript strict mode is enabled — avoid `any` unless unavoidable (and suppress with `// eslint-disable-next-line` on the specific line).
- No default exports — named exports only.
- Keep monitoring code development-only (`process.env.NODE_ENV !== 'development'`).

## License

By contributing you agree that your contributions will be licensed under the [MIT License](./LICENSE).
