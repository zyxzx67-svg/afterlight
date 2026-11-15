# Afterlight

Afterlight is a static Web Audio mixer with a sound desk in a library that stays open after midnight.
The app must run via an ordinary static server and on GitHub Pages. Do not add
dependencies, network calls, recorded assets, or a build step.

Audio starts only after an explicit user gesture. Three procedural layers
(window rain, aisle wind, and an old clock) have independent loudness controls. Starting,
pausing, and changing the mix should be quiet and click-free. Respect reduced
motion, and label each keyboard-operable control.
