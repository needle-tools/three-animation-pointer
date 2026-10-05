# Changelog
All notable changes to this package will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

## [1.1.3]
- Fix: morph target (blend shape) weight animation bound to the wrong object when a multi-material mesh is used by multiple nodes. three.js clones a shared mesh per node, so every node's `Group` has identically named submeshes; the submesh segment of `.nodes.<node>.<submesh>.morphTargetInfluences` was looked up from the mixer root instead of inside `<node>`, so all tracks bound to the first node's submeshes. Child names are now resolved within the already resolved node.

## [1.1.2] - 2026-06-17
- Fix: don't mutate the `KHR_animation_pointer.pointer` value in `parser.json`. The resolved three.js property path is now kept in plugin-local state, so other plugins / app code can still read the original spec-defined pointer after load — by @0b5vr in [#2](https://github.com/needle-tools/three-animation-pointer/pull/2)

## [1.1.1] - 2026-06-12
- Fix: morph target (blend shape) weight animation was silently dropped for multi-material meshes without skin/bones. The multi-material morph branch only bound children that were `SkinnedMesh`; such meshes load as a `Group` of plain `Mesh` children, so no track was created (and the empty-but-truthy result skipped the fallback). Now any child with `morphTargetInfluences` is bound.

## [1.1.0] - 2026-06-01
- Add: support for `/nodes/{}/weights/{}` to animate individual morph target weights (works with multi-material meshes / primitives) — by @0b5vr in [#1](https://github.com/needle-tools/three-animation-pointer/pull/1)

## [1.0.7] - 2025-10-20
- Fix: missing "extensions" in KHR_node_visibility  

## [1.0.5] - 2025-10-15
- Fix: Remove leftover log

## [1.0.5] - 2025-10-15
- Add: support for boolean animation tracks (when using ubyte type)

## [1.0.4] - 2025-10-08
- Add: KHR_node_visibility extension

## [1.0.3] - 2025-09-11
- Fix: Handle undefined path if AnimationClip tracks have invalid/unexpected names. Fallback to default three implementation

## [1.0.1] - 2025-08-27
- Initial release
