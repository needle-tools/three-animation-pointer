import { expect, test } from 'vitest';
import { AnimationClip, AnimationMixer, BoxGeometry, Group, Mesh, MeshBasicMaterial, PropertyBinding, VectorKeyframeTrack } from 'three';

import { GLTFAnimationPointerExtension } from '../src/GLTFLoaderAnimationPointer.js';

test('morph tracks bind to a submesh named like an Object3D property', () => {
	// Loading the extension installs its PropertyBinding resolver.
	const extension = new GLTFAnimationPointerExtension({
		getDependency: () => Promise.resolve(),
		_getArrayFromAccessor: accessor => accessor.array
	});
	const target = {
		path: 'pointer',
		extensions: { KHR_animation_pointer: { pointer: '/nodes/0/weights/0' } }
	};
	extension.loadAnimationTargetFromChannelWithAnimationPointer({ target });

	const root = new Group();
	const node = new Group();
	node.name = 'Node';
	const geometry = new BoxGeometry();
	geometry.morphAttributes.position = [geometry.attributes.position.clone()];
	const submesh = new Mesh(geometry, new MeshBasicMaterial());
	submesh.name = 'position';
	node.add(submesh);
	root.add(node);

	const tracks = extension.createAnimationTracksWithAnimationPointer(
		node,
		{ array: new Float32Array([0, 1]) },
		{ array: new Float32Array([0, 1]), itemSize: 1 },
		{ interpolation: 'LINEAR' },
		target
	);
	const mixer = new AnimationMixer(root);
	mixer.clipAction(new AnimationClip('morph', 1, tracks)).play();
	mixer.update(0.5);

	expect(tracks.map(track => track.name)).toEqual(['.nodes.Node.position.morphTargetInfluences[0]']);
	expect(submesh.morphTargetInfluences[0]).toBe(0.5);

	const plainNode = new Group();
	plainNode.name = 'PlainNode';
	root.add(plainNode);
	expect(PropertyBinding.findNode(root, '.nodes.PlainNode.position')).toBe(plainNode.position);
});

test('node translation still targets the node when a child is named position', () => {
	const root = new Group();
	const node = new Group();
	node.name = 'Node';
	const child = new Group();
	child.name = 'position';
	node.add(child);
	root.add(node);

	const track = new VectorKeyframeTrack('.nodes.Node.position', [0, 1], [0, 0, 0, 2, 4, 6]);
	const mixer = new AnimationMixer(root);
	mixer.clipAction(new AnimationClip('move', 1, [track])).play();
	mixer.update(0.5);

	expect(node.position.toArray()).toEqual([1, 2, 3]);
	expect(child.position.toArray()).toEqual([0, 0, 0]);
});
