# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- [`$undo/$track/$history`]: Adds a set of helpers to track component state and revert changes on demand

## [0.3.6] - 2020-11-04
### Fixed
- Removed CharacterData option from mutation observer to match Alpine core
- Fixed error where null values were throwing an error on proxy

### Changed
- Switched from using Laravel Mix using rollup.js
- Switched from Using LiveReload to Browsersync

### Added
- Added this changelog
- Added Jest and added some tests for each helper
- Added esLint (+ husky and lint-staged to run the linter before each commits) and fixed code standard errors
- Added workflow to automate README update and publish new versions to npm

## [0.3.5] - 2020-09-28
### Fixed:
- [$parent/$component]: Updated an incorrect null check on the proxy get trap

## [0.3.4] - 2020-09-27
### Fixed
- [`$parent/$component`]: Added support for deep prop updating (`$parent.square.color === 'orange'`)
