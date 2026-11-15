# Afterlight

Afterlight is a browser-based ambience mixer set in an old library that
stays open past midnight. Blend window rain, aisle wind, and an old clock,
or start with one of three room presets.

## Run locally

Run `python3 -m http.server 8000` from the repository root.
Open http://localhost:8000/ in a recent browser with Web Audio support.

## Demo

1. Choose **Start audio**. The master volume starts low.
2. Try the Reading Room, Closed Stacks, and Clock Tower presets.
3. Use the sliders to adjust each layer and the overall volume.
4. Pause and resume to return to the current mix.

No microphone, accounts, or recorded audio are needed. The room illustrations
are drawn with Canvas, and the sound is synthesized locally with Web Audio.

## Development

Kiro IDE used the project steering file to generate the procedural Web Audio
engine. Codex built the scene and control interface and integrated the engine,
including handling browser audio startup and the clock loop. The app was
tested in a browser for startup, pause and resume, presets, and keyboard input.

The source is MIT-licensed. Instrument Serif and DM Sans are bundled under
their respective SIL Open Font Licenses in the repository root.
