# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [v1.2.2] - 2021-05-04
### Fixed
- [`$component`]: x-for was not working correctly when looping on a property from the parent scope (i.e. `x-for="item in $parent.items"`).

## [v1.2.1] - 2021-04-20
### Fixed
- [`$interval`]: timeOut was not cleared correctly when paused. When paused and resumed straightaway, it was leading to duplicate callbacks being invoked.

## [1.2.0] - 2021-04-18
### Added
- [`$get`/`$post`]: Added two helpers to simplify working with `$fetch`

## [1.1.0] - 2021-03-15
### Added
- [`x-unsafe-html`]: Added 'x-unsafe-html' custom directive

## [1.0.0] - 2021-02-13
### Added
- [`$component`]: Added support for accessing magic properties/helper via $component/$parent ($parent.$parent.foo is now a thing!!!)

### Changed
- [`$component`]: $component and $parent are now deferred for a few ms if the observed component is not ready
- [`$component`]: **BREAKING** `$component...` and `$parent...` in `x-init` are now always resolving to empty strings.

## [0.6.0] - 2021-02-05
### Fixed
- [`$component`]: When accessing functions which use $refs or other magic properties, `this` was not bound correctly.

### Added
- [`$undo`/`$track`/`$history`]: Adds a set of helpers to track component state and revert changes on demand
- [`$refresh`]: Adds a helper to refresh components
## [0.5.1] - 2020-11-30
### Fixed
- [`$scroll`]: When using css selectors or Alpine reference, element position to scroll to was some times a decimal number (e.g. rem values could resolve to a decimal number) and $scroll was triggering an error.

## [0.5.0] - 2020-11-23
### Fixed
- Helpers were registered twice by mistake resulting in unnecessary function calls.

### Added
- Added a config object to allow users to customise some helpers
- [`$screen`]: Added the $screen helper to detect the current screen size ([@muzafferdede](https://github.com/muzafferdede))

## [0.4.1] - 2020-11-16
### Fixed
- [`$truncate`]: Fixes an issue where the ellipsis would show even if the source length was shorter. ([@pomartel](https://github.com/pomartel))

## [0.4.0] - 2020-11-15
### Added
- [`$range`]: Added the $range helper to iterate over custom ranges
- [`$scroll`]: Added the $scroll helper to scroll vertically to a specific position

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
- [`$parent`/`$component`]: Updated an incorrect null check on the proxy get trap

## [0.3.4] - 2020-09-27
### Fixed
- [`$parent/$component`]: Added support for deep prop updating (`$parent.square.color === 'orange'`)
