# TRON · GRIDRUNNER

An independent, unofficial TRON-inspired browser game. Third-person disc combat, light cycles, light tanks, a city infiltration and controllable light jets. Buildless WebGL with local assets and phone/desktop controls.

## The Last Free Address · 0.7

The campaign opens with an authored escape level: Detention 07 → Processing Hall → Coolant Spine → Reactor Concourse → Archive Stacks → Freight Apron → Vehicle Bay. Rooms have connected floors, solid boundaries, ceilings, props and doorways. Restore service power, recover Flynn’s unlisted address from the transit manifest, and open the freight garage. Encounters activate along the route; clearing a wave does not advance the campaign. Two optional identity caches reward exploring side rooms.

Board the courier cycle in the garage. Freight Line 07 is a 574 m winding elevated highway, with viaducts, junction signs, checkpoints and pursuing riders. At Depot 07, park the courier and win a full Light Cycle Grid match to unlock a siege tank. The Warden erased the bridge beyond the depot, so the tank must use the dry aqueduct below it.

The aqueduct follows a 660 m canyon route around bends, through cover and security outposts. Destroy two dam power cores with the cannon to open their physical gates. Reach the white signal, leave the tank, and walk through the refuge doorway. Short vehicle scenes and in-game radio dialogue explain the route while play continues.

Flynn’s recording leads into Argon’s streets and service alleys. Spoof a transit identity and jam the Recognizer before accessing the civic relay. Board a light jet and use cannons and colliding light trails to break the erasure uplinks above the Sea of Simulation. Return to Argon, take the reserve captain’s cipher, raise the light bridge, and isolate the ground reserve before restoring the registry. Pause → Story so far gives the current reason and objective.

The disc, cycle and tank arenas remain available as separate practice modes. Campaign progression uses authored routes, terminals, discoveries, blockades and boarding points.

## Controls

| Action | Desktop | Phone |
|---|---|---|
| Move / drive | WASD / arrows | Left stick |
| Look / tank aim | Drag the world | Drag the world |
| Disc / strike / cannon | Click / Space | Main action |
| Access / talk / board nearby | E / main action | ACCESS / TALK / BOARD |
| Tank aim mode | AIM button | AIM button |
| Dodge / vehicle boost | Shift | DODGE / BOOST |
| Pulse / tank shield | Q | PULSE / SHIELD |
| City crouch | C | CROUCH / STAND |
| Jet climb / dive | W / S | Left stick vertical |
| Jet steering | A / D | Left stick horizontal |
| Jet brake | B | BRAKE |
| Cycle brake | S / B | BRAKE / stick back |
| Tank reverse / brake | S / B | Stick back / BRAKE |
| Pause / recap | Escape | Pause button |

Simulation select offers disc, cycle, tank, Argon and jet missions directly. Practice preserves the campaign checkpoint. This is a finite first chapter, not a full open world or multiplayer game.

## Saves and verification

The existing `gridrunner-profile-v1` key is retained. Version 0.6 adds mid-level saves for terminal objectives, opened doors, highway checkpoints, destroyed dam cores, optional caches and on-foot dismounts. Continue resumes the current area; New Chapter replays the rebuilt opening while preserving appearance and arena records. Previous names, colors, appearance, records and sector checkpoints remain valid. A previous save at the refuge continues into Argon. The relay key is saved within its sector, and the resolved chapter resumes as district exploration. New chapter resets story flags while preserving appearance and simulation records.

Procedural animation includes planted-foot IK, distinct timed combat clips, rider hand IK, banking, animated tank treads and cannon recoil. Pause freezes motion. All game assets and dependencies are local.

```
npm run dev
npm test
npm run check
```

Engine tests drive and walk the authored opening, full highway and full aqueduct using real simulation inputs; verify matching floor/wall collision, closed-door pathfinding, side caches, mid-level reloads and vehicle dismounts; and cover the campaign handoffs, old saves, city routes and sight, crouching, tank aiming/cover, three-dimensional flight/weapon hits, return flight and epilogue, alongside earlier combat and animation regressions. GitHub Actions also renders real desktop/phone play, story scenes, the refuge-to-city continuation, actual movement through Argon to recover the key and board the jet, flight direction cues, jet combat and the epilogue. A separate browser job walks the new opening and steers the entire highway with actual keyboard controls, boards both vehicles, destroys the first dam and resumes the refuge approach. Screenshots are retained as `gridrunner-browser-proof` and `gridrunner-level-proof`.

Publish GitHub Pages from **main / (root)**. `.nojekyll` and relative paths support the repository subpath.

## Credits

Original game rules, procedural meshes, animation, graphics, interface, narrative and synthesized audio: this project. Three.js uses its MIT license in `vendor/LICENSE-THREE.txt`.

TRON belongs to Disney. This is an independent fan project with no affiliation or endorsement. Flynn’s recording is original fictional text written for this game. No movie footage, extracted game models, commercial soundtracks, or official logos are bundled.
