# Headshots page review

Adds a dedicated `/headshots/` page centered on the ten supplied portraits, plus one Headshots link in the existing homepage navigation.

## Design and behavior

- Dark editorial design with a sage accent, large typography, and a perspective-based portrait carousel.
- Drag or swipe, arrow controls, keyboard navigation, and ten image selectors.
- All-ten grid and full-size modal viewer with keyboard controls and focus restoration.
- Reduced-motion users start in a still grid. Without JavaScript, every portrait remains an ordinary image link.
- Existing local fonts and favicon; no third-party scripts, tracking, framework, CDN dependency, or build requirement.
- Booking links use the existing homepage booking section; questions go to the existing contact email.
- All ten supplied JPEGs are byte-identical copies. Existing HDR photographs and site assets are unchanged.

## Preservation and deployment

- Base commit: `a250ee89bfcf99a2e927ff5c53e7983a8bfb8bef`.
- Recovery branch: `archive/pre-headshots-2026-09-19`.
- Candidate branch: `feature/headshots-3d`.
- No hosting changes or main-branch promotion are authorized until Ted approves.
- After approval, deploy the exact reviewed commit using `naimth/website-ops` and its pinned SFTP, fresh backup, checksum verification, and rollback procedure. Follow with a zero-change Preview and check `/headshots/` publicly.
- Review metadata, screenshots and validation code live under `.github/`, which the existing deployer excludes from hosting.

## Validation

`validation.json` records local Chromium results. The `Validate headshots page` GitHub Actions workflow repeats browser checks and publishes screenshots as an artifact.

Covered: ten portraits; wraparound; keyboard and thumbnail navigation; dialog open, navigation, Escape and focus restoration; all-ten layout; mouse drag; touch swipe; 320/390/768/1024/1440 widths; reduced motion; no-JavaScript fallback; local links; resource and console errors.

Not yet checked on physical iPhone/Safari hardware. The uploaded photos are standard JPEGs; this change does not synthesize HDR gain maps.
