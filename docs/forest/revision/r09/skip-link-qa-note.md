# Stage 03 regression: asynchronous skip-link check

While rehearsing the R09 release, one Stage03 audit passed all 16 responsive viewports but failed its last same-page skip-link assertion. The original test pressed Enter and immediately read `page.url()`, which can precede the browser's fragment URL update after the key event. The test now waits up to five seconds for the **real** `#page-content` navigation, then asserts the URL; it does not set a hash itself, force clicks, or suppress error conditions. The page's HTML anchor, focus behavior and layout are unchanged.

The release branch must rerun Stage03 and R08–R09 CI after this correction. No screenshots/video captured.
