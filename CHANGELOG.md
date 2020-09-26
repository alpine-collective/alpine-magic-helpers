# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Changed
- Switched from using Laravel Mix using rollup.js
- Switched from Using LiveReload to Browsersync

### Added
- Added this changelog
- Added Jest and added some tests for each helper

## [0.3.4] - 2020-09-27
### Fixed
- [`$parent/$component`]: Added support for deep prop updating (`$parent.square.color === 'orange'`)
