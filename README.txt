Fabian birthday book — original-proportion double-page edition

This revision keeps the requested rules:
- Desktop and mobile both stay as two-page spreads.
- Open-book aspect ratio is restored to approximately 1.96:1, matching the original layout shown in the reference screenshot.
- Photos use object-fit: contain, so the complete photo is always visible; no edge is cropped.
- Videos are not trimmed and use object-fit: contain, so the complete video frame is visible.
- Each video still occupies its own page.
- Text stays off photo/video surfaces.
- Photo groups and text/media color separation from the previous double-page revision are preserved.

Open index.html or deploy the whole folder to a static host.


This revision removes internal photo/video frame borders and beige letterbox cards. Images and videos remain uncropped and use the original book spread ratio.

2026-09-17 full refinement
- 19 two-page spreads / 38 interior pages; desktop and iPhone remain double-page.
- Photo assignments follow P1_1 ... P18_1 mapping supplied by the author.
- All four videos keep their full duration and each occupies its own page.
- Photos/videos use contain sizing: no crop and no visible inner frame/letterbox card.
- Text and media are kept on separate pages; no body copy overlays photographs.
- Updated copy: "You and other people have asked me:" and the revised 100-days passage.
- Video 02 / 03 split the ONE THING passage across two consecutive spreads.


2026-09-17 update: every page now uses a distinct sticker/doodle recipe. A soft instrumental Happy Birthday track is bundled locally and starts after the Open Book interaction for iPhone/Safari compatibility. The bottom-right music control toggles it.


Latest refinement:
- Videos are forced to display their complete native frame with no cropping.
- Video duration is unchanged.
- Background audio now tries assets/audio/felicity.mp3 first.
- If felicity.mp3 is absent, it falls back to the current Happy Birthday instrumental.
To use your Felicity track, place your licensed/provided file at:
assets/audio/felicity.mp3

Final audio:
- Background music: Isaac Shepard - Felicity (user-provided audio file)
- Starts after tapping Open Book, loops continuously, and can be toggled with music on/off.
- Videos remain muted/autoplaying so they do not compete with the background music.
- Video display keeps the full native frame; no cover-crop is used.
