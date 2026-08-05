Pet Land 3D Asset Slots

Drop lightweight `.glb` files into these folders to upgrade the hangar from the procedural alien body to real 3D models.

Expected files

- `static/models/pet_land/characters/pink-alien-body.glb`
- `static/models/pet_land/pets/sidekick-base.glb`
- `static/models/pet_land/accessories/sun-spex.glb`
- `static/models/pet_land/accessories/rookie-cap.glb`

Current behavior

- If `pink-alien-body.glb` exists and loads, Pet Land mounts that shared body in the Three.js hangar.
- The selected explorer still appears on that body as the active character badge.
- If a model is missing or fails to load, Pet Land keeps using the built-in alien fallback body.

Recommended model constraints

- Use low-poly `.glb` files.
- Keep each file small enough for classroom devices, ideally under 2 MB.
- Export facing forward on the positive Z axis when possible.
- Keep the model centered near the origin and standing on the ground plane.

Recommended sources

- Poly Pizza
- Sketchfab downloads that explicitly allow reuse
- Blender exports from your own scene

Notes

- The current code normalizes the loaded alien body to a consistent preview height.
- Accessory `.glb` support is scaffolded by filename, but the hangar still falls back to built-in mesh accessories unless you extend the attachment logic further.