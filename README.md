# TRON · GRIDRUNNER

An independent, unofficial TRON-inspired browser game. Third-person disc combat, light cycles, light tanks, a city infiltration and controllable light jets. Buildless WebGL with local assets and phone/desktop controls.

## The Last Free Address · 0.4

You are a surviving program from the old Grid. The Warden has scheduled Argon’s unregistered identities for erasure. ECHO guides you toward Flynn’s unlisted refuge; his stored recording points toward a root key in the city’s civic relay.

The chapter now continues through the Archive, Perimeter, Outlands, refuge, Argon district and aerial memory lattice. Short in-engine camera scenes explain each transition. Pause → Story so far provides the current reason and objective; scenes can be skipped or replayed. Combat tricks are left for players to discover.

The refuge is a midpoint. Recovering the civic key opens a light-jet cradle at the skyport. The aerial mission has three erasure uplinks, defending interceptors, altitude, banked steering, boost, brakes and energy cannons. After the array is severed, a return flight leads to a resolved ending and a peaceful district you can explore.

Argon has connected avenues and service alleys, matching building collisions, moving residents, Mara, patrol routes, line-of-sight detection, crouching, cover and a recognizer searchlight. Fighting remains possible; breaking contact lets patrols return to their routes. Recognizers are security scenery; the jet is the controllable aircraft.

Tanks now have a visible projected aiming reticle, target lock, cover obstruction, reload and hit feedback. Dragging keeps manual aim active; tapping an enemy can select a lock. Cannon rays and projectiles use the same terrain and actor dimensions.

## Controls

| Action | Desktop | Phone |
|---|---|---|
| Move / drive | WASD / arrows | Left stick |
| Look / tank aim | Drag the world | Drag the world |
| Disc / strike / cannon | Click / Space | Main action |
| Access / talk nearby | E / main action | ACCESS / TALK |
| Dodge / vehicle boost | Shift | DODGE / BOOST |
| Pulse / tank shield | Q | PULSE / SHIELD |
| City crouch | C | CROUCH / STAND |
| Jet climb / dive | W / S | Left stick vertical |
| Jet steering | A / D | Left stick horizontal |
| Jet brake | B | BRAKE |
| Other vehicle brake | S | BRAKE / stick back |
| Pause / recap | Escape | Pause button |

Simulation select offers disc, cycle, tank, Argon and jet missions directly. Practice preserves the campaign checkpoint. This is a finite first chapter, not a full open world or multiplayer game.

## Saves and verification

The existing `gridrunner-profile-v1` key is retained. Previous names, colors, appearance, records and sector checkpoints remain valid. A previous save at the refuge continues into Argon. The relay key is saved within its sector, and the resolved chapter resumes as district exploration. New chapter resets story flags while preserving appearance and simulation records.

Procedural animation includes planted-foot IK, distinct timed combat clips, rider hand IK, banking, animated tank treads and cannon recoil. Pause freezes motion. All game assets and dependencies are local.

```
npm run dev
npm test
npm run check
```

Engine tests cover the campaign handoffs, old saves, city routes and sight, crouching, tank aiming/cover, three-dimensional flight/weapon hits, return flight and epilogue, alongside earlier combat and animation regressions. GitHub Actions also renders real desktop/phone play, story scenes, the refuge-to-city continuation, jet combat and the epilogue. Screenshots are retained as `gridrunner-browser-proof`.

Publish GitHub Pages from **main / (root)**. `.nojekyll` and relative paths support the repository subpath.

## Credits

Original game rules, procedural meshes, animation, graphics, interface, narrative and synthesized audio: this project. Three.js uses its MIT license in `vendor/LICENSE-THREE.txt`.

TRON belongs to Disney. This is an independent fan project with no affiliation or endorsement. Flynn’s recording is original fictional text written for this game. No movie footage, extracted game models, commercial soundtracks, or official logos are bundled.
