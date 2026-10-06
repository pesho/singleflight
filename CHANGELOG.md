# Changelog

All notable changes to this package are documented here.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this
project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.1.0] - 2026-10-06

### Added

- `@onestone/singleflight/package.json` can be imported.

### Changed

- `doAuto` now rejects anonymous functions (such as inline arrows) and bound functions with a `TypeError`. Their names aren't unique, so unrelated calls with the same arguments could receive each other's results. If you pass one of these, pass a uniquely named function instead, or call `do()` with an explicit key.

### Removed

- Source files, tests and tool configs are no longer included in the published package.

### Fixed

- A `do()` call started from inside `fn` for the same key could clear the outer call's entry, so later callers started a new execution instead of joining the running one.
- `do()` shares falsy results (`0`, `""`, `null`, `false`, `undefined`) when called from JavaScript with a function that returns a plain value. Previously the function ran again for each caller.

## [1.0.0] - 2025-12-14

First stable release.

[Unreleased]: https://github.com/pesho/singleflight/compare/v1.1.0...HEAD
[1.1.0]: https://github.com/pesho/singleflight/compare/v1.0.0...v1.1.0
[1.0.0]: https://github.com/pesho/singleflight/releases/tag/v1.0.0
