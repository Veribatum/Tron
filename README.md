# TRON · GRIDRUNNER

An unofficial TRON-inspired browser game: third-person disc combat, light-cycle pursuit, light tanks, and a story beginning with a survivor of the old Grid. Buildless WebGL; local assets; phone and desktop controls.

## Chapter One · 0.3

Escape the Archive, cross the Perimeter by light cycle, take an armored route through the Outlands, and investigate an unlisted refuge. A discoverable personal archive points toward Flynn. The recording is original text written for this fan game.

The motion update adds separate throw/catch, three strike combos, dodge, pulse, hit and derez poses. Shared animation timing controls projectile release and melee contact. Feet use two-link IK, rider hands stay on the grips under lean and braking, tank treads travel with each side, and paused animations freeze. Footstep sounds follow the contact phase.

Three arenas let you replay disc, cycle or tank combat directly. Arena practice preserves the campaign checkpoint. The story now introduces the situation without explaining combat tricks; controls are available from Pause or the title screen.

The rebuilt programs have smooth shaped suits, layered armor, articulated fingers, helmets and uncovered faces. Program settings offer male/female frames and three circuit colors. Light tanks have independent hull/turret movement, cannon projectiles, matching rock cover, telegraphed enemy fire and a temporary energy shield. Recognizers are scenery.

This is a short first chapter with three repeatable arenas, not a full open-world game. There is no multiplayer or flight mode.

## Controls

| Action | Desktop | Phone |
|---|---|---|
| Move / drive | WASD / arrows | Left stick |
| Look / aim | Drag the world | Drag the world |
| Disc / strike / cannon | Click / Space | Main action |
| Dodge / cycle boost | Shift | DODGE / BOOST |
| Pulse / tank shield | Q | PULSE / SHIELD |
| Brake | S | BRAKE / stick back |
| Access archive | E | ACCESS near terminal |
| Pause | Escape | Pause button |

Tanks stop when the drive stick is released. Their turret tracks a visible target automatically; dragging the view gives manual aim briefly. Unlike a light cycle, a tank can stop behind cover.

Saves use the existing `gridrunner-profile-v1` key. Previous names, colors, scores and sector checkpoints remain valid. A previous cycle checkpoint continues into the new Outlands sector. New escape replaces only campaign progress; appearance and arena records remain. Continue resumes the saved sector rather than the precise position in a fight.

## Run and verify

No runtime installation or build is required. All game dependencies are local.

```
npm run dev
npm test
npm run check
```

GitHub Actions runs engine tests, source checks, and real Chromium desktop/phone checks. The tests also verify foot clearance, rider grips, frame-rate independent wheel/tread travel, canceled strikes, and pause. Browser artifacts include a rendered pose sheet and short animation video from the actual game rigs.

Browser coverage includes actual disc damage, portrait/landscape touch controls, appearance selection, cycle steering/boost/braking, tank drive/cannon/shield, legacy checkpoint resume, and discovering the archive through normal movement and interaction. Screenshots are retained as `gridrunner-browser-proof`.

## GitHub Pages

Publish branch **main**, directory **/(root)**. `.nojekyll` and relative asset paths support the repository subpath.

## Credits

Original game rules, procedural models, graphics, interface, narrative and synthesized audio: this project. Three.js uses its MIT license in `vendor/LICENSE-THREE.txt`.

TRON belongs to Disney. This is an independent, unofficial fan project with no affiliation or endorsement. No movie footage, extracted game models, commercial soundtracks, or official logos are bundled.
