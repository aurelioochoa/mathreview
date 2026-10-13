# Gates: game polish and startup performance

Scope: Run Math Quest, correct observed errors, fix map-card overlap, reduce startup JavaScript, update housekeeping, and integrate interactive concept displays with sourced mathematics history. Cloudflare token revocation remains an explicit external handoff.

- [x] G1: Gameplay and state regression suite passes
  CHECK: npm test
  EXPECT: Test Files
  EVIDENCE: exit=0; shell=/bin/sh; cwd=/home/aurelio/Repos/mathreview; path=6fc69862187a/32 entries; EXPECT=matched; output-sha256=343fa208adf486bdf3d036ce22921717c0ce4124c9672ae3a4941f1cdd0691b7; output-bytes=19092

- [x] G2: Source passes ESLint
  CHECK: npm run lint
  EXPECT: eslint .
  EVIDENCE: exit=0; shell=/bin/sh; cwd=/home/aurelio/Repos/mathreview; path=6fc69862187a/32 entries; EXPECT=matched; output-sha256=fca179a1bccc94469907bb4f4d0afc4e065b96e04de146ea3f5f970847c693cf; output-bytes=62

- [x] G3: Production build succeeds with study pages and heavy widgets loaded on demand
  CHECK: npm run build
  EXPECT: built in
  EVIDENCE: exit=0; shell=/bin/sh; cwd=/home/aurelio/Repos/mathreview; path=6fc69862187a/32 entries; EXPECT=matched; output-sha256=828a93a2fe55d819266a7d5ade3f6e7cd9bfc473cbd5c2446f1bc3afe8d7125e; output-bytes=8401

- [x] G4: Initial JavaScript is smaller than the previous 405.78 kB gzip and excludes chart libraries
  CHECK: node scripts/check-bundle.mjs
  EXPECT: BUNDLE VERIFIED
  EVIDENCE: exit=0; shell=/bin/sh; cwd=/home/aurelio/Repos/mathreview; path=6fc69862187a/32 entries; EXPECT=matched; output-sha256=7f43c438ee99d16f0edab743d43337fa1a1f05246ae66160cb66b6845153faf2; output-bytes=92

- [x] G5: Running game works in desktop and mobile browsers, map shows a single detail panel, and study widgets render
  CHECK: npm run test:browser
  EXPECT: BROWSER VERIFIED
  EVIDENCE: exit=0; shell=/bin/sh; cwd=/home/aurelio/Repos/mathreview; path=6fc69862187a/32 entries; EXPECT=matched; output-sha256=af87c0ecc4e5a5c9291ae07277a607a1e8798372959a461cf6a808462264fc27; output-bytes=506

- [x] G6: Browser title, test counts, and Makefile checks match the implemented game
  EVIDENCE: Manual review 2026-10-12: Chromium title is Math Quest; full Vitest run reports 61 files/432 tests; README.md and TODO.md reflect those counts and the eight delivered labs; make -n test/check/verify invokes npm tests, lint, production build and the manifest-based bundle check.

- [ ] G7: Previously exposed tunnel credential is confirmed revoked or rotated
  EVIDENCE: pending

- [x] G8: Dependency audit reports no vulnerabilities
  CHECK: npm audit
  EXPECT: found 0 vulnerabilities
  EVIDENCE: exit=0; shell=/bin/sh; cwd=/home/aurelio/Repos/mathreview; path=6fc69862187a/32 entries; EXPECT=matched; output-sha256=6d8c5c8f3d7684adb070417bd608d01ae90aa3dc26a65af03ffda4955f38d9a3; output-bytes=24

- [x] G9: Eight worlds provide visual concept explanations and connected history, with verified learner interactions
  CHECK: npm run test:courses
  EXPECT: COURSES VERIFIED
  EVIDENCE: exit=0; shell=/bin/sh; cwd=/home/aurelio/Repos/mathreview; path=6fc69862187a/32 entries; EXPECT=matched; output-sha256=6ab257423087e9290e556c01592fd857f84375bfd905871b6a63f629fcd818d8; output-bytes=1408

ABANDON: G7 No Cloudflare account/API access or tunnel identifier is available in this workspace; the retirement commit explicitly requires dashboard revocation. The current .env is empty. Revoke or rotate the retired tunnel token in Cloudflare and record confirmation in TODO.md.
