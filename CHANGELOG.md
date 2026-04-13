# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.1] - 2024-12-01

### Added
- React Query (TanStack Query v4/v5) integration via `monitorQueryClient`
- Per-query status display: fetching, stale, error, observer count

### Changed
- Improved React Query config defaults

## [0.1.0] - 2024-11-01

### Added
- Initial release
- Zero-config floating dev panel
- Zustand integration: `create`, `monitorStore`, `devtools`, `persist` drop-ins
- React Context integration: `useContextMonitor`, `patchContext`, `createMonitoredContext`, `monitorContext`
- JS heap monitoring via `performance.memory`
- Size warnings at 80% of configured `limitKB`
- Conflict detection when a context is double-monitored
