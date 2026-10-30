# TRON · GRIDRUNNER

A personal, unofficial TRON-inspired fan game. The first playable combines third-person disc combat with a light-cycle escape. Built for modern phone and desktop browsers with WebGL.

## First playable

- **Escape the Archive:** survive three security waves, pass the transit gate, take a light cycle, break the pursuit, and reach the uplink.
- **Disc Arena:** returning identity discs, wall ricochets, three-hit close combos, telegraphed enemy attacks, dodge invulnerability, an energy pulse, cover, and restorative drops.
- **Light Cycle Arena:** analog steering, boost, brakes, identity-disc shots, enemy riders, and lethal light walls—including your own older trail. Trails persist for 16 seconds. Rival steering looks ahead for walls and trails.
- Original articulated program and cycle models, recognizer flyovers, a circuit city backdrop, bloom, synthesized electronic music, engine sound and combat effects.
- Sector checkpoint saving, program handle and circuit color, arena records, pause/retry, geographic radar, and phone controls in portrait and landscape.

This is one playable escape mission and two repeatable combat arenas. It is not an open-world campaign or a complete commercial-scale TRON game. Recognizers are scenery in this build; light cycles are the controllable vehicle.

## Controls

| | Desktop | Phone |
|---|---|---|
| Walk | WASD / arrow keys | Left stick |
| Look | Drag the world | Drag the world |
| Throw disc / strike nearby | Click / Space | DISC / STRIKE |
| Dodge on foot | Shift | DODGE |
| Energy pulse | Q | PULSE |
| Cycle steering | A / D | Left stick horizontal |
| Boost | Shift | Hold BOOST / stick fully forward |
| Brake | S | Hold BRAKE / stick back |
| Pause | Escape | Pause button |

Your story resumes at the start of the saved sector. Arena practice does not skip the campaign. Starting a new escape replaces the sector checkpoint; your program handle, color and best arena scores remain.

## Run and verify

No runtime installation or build is required. All game dependencies are local.

```
npm run dev
npm test
npm run check
```

GitHub Actions runs the engine suite, source checks, and real Chromium desktop/phone UI checks. It saves screenshots as `gridrunner-browser-proof`.

## GitHub Pages

Publish branch **main**, directory **/(root)** in the repository's Pages settings. `.nojekyll` is included. All asset paths are relative so the game works under a repository subpath.

## Credits

- Original game rules, procedural models, graphics, interface and synthesized audio: this project.
- Three.js: MIT license, preserved in `vendor/LICENSE-THREE.txt`.
- TRON belongs to Disney. This is an independent, unofficial fan project with no affiliation or endorsement. No movie footage, extracted game models, commercial soundtracks, or official logos are bundled.
