import { expect, test } from 'vitest';
import { AnimationClip, AnimationMixer, BoxGeometry, Group, Mesh, MeshBasicMaterial } from 'three';

import { GLTFAnimationPointerExtension } from '../src/GLTFLoaderAnimationPointer.js';

function createTarget(pointer) {
	return {
		path: 'pointer',
		extensions: { KHR_animation_pointer: { pointer } }
	};
}

function createExtension() {
	const dependencies = [];
	const parser = {
		getDependency(type, index) {
			dependencies.push([type, index]);
			return Promise.resolve();
		},
		_getArrayFromAccessor(accessor) {
			return accessor.array;
		}
	};
	return { extension: new GLTFAnimationPointerExtension(parser), dependencies };
}

function createMorphMesh(name) {
	const geometry = new BoxGeometry();
	geometry.morphAttributes.position = [geometry.attributes.position.clone()];
	const mesh = new Mesh(geometry, new MeshBasicMaterial());
	mesh.name = name;
	return mesh;
}

function createTracks(extension, node, target, values, itemSize) {
	return extension.createAnimationTracksWithAnimationPointer(
		node,
		{ array: new Float32Array([0, 1]) },
		{ array: new Float32Array(values), itemSize },
		{ interpolation: 'LINEAR' },
		target
	);
}

test('resolves a glTF node translation pointer to a three.js position track', async () => {
	const { extension, dependencies } = createExtension();
	const target = createTarget('/nodes/0/translation');
	await extension.loadAnimationTargetFromChannelWithAnimationPointer({ target });

	expect(dependencies).toEqual([['node', 0]]);
	expect(extension.pointerPathMap.get('/nodes/0/translation')).toBe('/nodes/0/position');

	const root = new Group();
	const node = new Group();
	node.name = 'Animated';
	root.add(node);
	const tracks = createTracks(extension, node, target, [0, 0, 0, 2, 4, 6], 3);
	const mixer = new AnimationMixer(root);
	mixer.clipAction(new AnimationClip('move', 1, tracks)).play();
	mixer.update(0.5);

	expect(tracks).toHaveLength(1);
	expect(tracks[0].name).toBe('.nodes.Animated.position');
	expect(node.position.toArray()).toEqual([1, 2, 3]);
});

test('maps a material roughness pointer and requests the material dependency', async () => {
	const { extension, dependencies } = createExtension();
	const target = createTarget('/materials/2/pbrMetallicRoughness/roughnessFactor');
	await extension.loadAnimationTargetFromChannelWithAnimationPointer({ target });

	expect(dependencies).toEqual([['material', 2]]);
	expect(extension.pointerPathMap.get('/materials/2/pbrMetallicRoughness/roughnessFactor'))
		.toBe('/materials/2/roughness');
});

test('animates same-named morph submeshes within their respective nodes', async () => {
	const { extension } = createExtension();
	const target = createTarget('/nodes/0/weights/0');
	await extension.loadAnimationTargetFromChannelWithAnimationPointer({ target });

	const root = new Group();
	const first = new Group();
	first.name = 'First';
	const firstMesh = createMorphMesh('Body');
	first.add(firstMesh);
	const second = new Group();
	second.name = 'Second';
	const secondMesh = createMorphMesh('Body');
	second.add(secondMesh);
	root.add(first, second);

	const tracks = [
		...createTracks(extension, first, target, [0, 1], 1),
		...createTracks(extension, second, target, [0, 0.4], 1)
	];
	const mixer = new AnimationMixer(root);
	mixer.clipAction(new AnimationClip('morph', 1, tracks)).play();
	mixer.update(0.5);

	expect(tracks.map(track => track.name)).toEqual([
		'.nodes.First.Body.morphTargetInfluences[0]',
		'.nodes.Second.Body.morphTargetInfluences[0]'
	]);
	expect(firstMesh.morphTargetInfluences[0]).toBe(0.5);
	expect(secondMesh.morphTargetInfluences[0]).toBeCloseTo(0.2);
});
