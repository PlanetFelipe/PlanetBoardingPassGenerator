# Changelog

All notable changes to this project are documented in this file.

## [1.0.0] - 2026-09-24

### Added
- Initial public release.
- Load flights from Planet's `Test.GetFlightDetails` REST API by Country, Location and Status.
- Generate QR Code, Aztec Code and PDF417 barcodes from the API's `BoardingPass` value using a locally vendored copy of bwip-js.
- Download any generated barcode as a PNG.
- Light mode and dark mode with persisted user preference.
- Responsive, single-page UI with flight selection and reset functionality.
