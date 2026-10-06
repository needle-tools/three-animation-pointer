import { expect, test, vi } from 'vitest';
import {
	AnimationClip, AnimationMixer, BooleanKeyframeTrack, ColorKeyframeTrack,
	DirectionalLight, Group, MeshBasicMaterial, NumberKeyframeTrack, PerspectiveCamera,
	QuaternionKeyframeTrack, VectorKeyframeTrack
} from 'three';

import { GLTFAnimationPointerExtension } from '../src/GLTFLoaderAnimationPointer.js';

function setup(pointer) {
	const parser = {
		getDependency: vi.fn(() => Promise.resolve()),
		_getArrayFromAccessor: accessor => accessor.array,
		_createCubicSplineTrackInterpolant: vi.fn()
	};
	const extension = new GLTFAnimationPointerExtension(parser);
	const target = {
		path: 'pointer',
		extensions: { KHR_animation_pointer: { pointer } }
	};
	extension.loadAnimationTargetFromChannelWithAnimationPointer({ target });
	return { extension, target, parser };
}

function createTracks(extension, target, node, values, itemSize, interpolation = 'LINEAR') {
	const array = ArrayBuffer.isView(values) ? values : new Float32Array(values);
	return extension.createAnimationTracksWithAnimationPointer(
		node,
		{ array: new Float32Array([0, 1]) },
		{ array, itemSize },
		{ interpolation },
		target
	);
}

function play(root, tracks) {
	const mixer = new AnimationMixer(root);
	mixer.clipAction(new AnimationClip('pointer', 1, tracks)).play();
	mixer.update(0.5);
}

test('creates quaternion tracks for node rotation', () => {
	const { extension, target } = setup('/nodes/0/rotation');
	const node = new Group();
	node.name = 'Rotating';
	const tracks = createTracks(extension, target, node, [0, 0, 0, 1, 0, 0, 1, 0], 4);

	expect(tracks).toHaveLength(1);
	expect(tracks[0]).toBeInstanceOf(QuaternionKeyframeTrack);
	expect(tracks[0].name).toBe('.nodes.Rotating.quaternion');
});

test('creates a discrete boolean track for node visibility', () => {
	const { extension, target } = setup('/nodes/0/extensions/KHR_node_visibility/visible');
	const node = new Group();
	node.name = 'VisibleNode';
	const tracks = createTracks(extension, target, node, new Uint8Array([0, 1]), 1, 'STEP');

	expect(tracks[0]).toBeInstanceOf(BooleanKeyframeTrack);
	expect(Array.from(tracks[0].values)).toEqual([0, 1]);
});

test.fails('visibility animation preserves the Boolean property type', () => {
	const { extension, target } = setup('/nodes/0/extensions/KHR_node_visibility/visible');
	const root = new Group();
	const node = new Group();
	node.name = 'VisibleNode';
	root.add(node);
	play(root, createTracks(extension, target, node, new Uint8Array([0, 1]), 1, 'STEP'));
	expect(node.visible).toBe(false);
});

test('uses step interpolation for numeric tracks', () => {
	const { extension, target } = setup('/extensions/KHR_lights_punctual/lights/0/intensity');
	const root = new Group();
	const light = new DirectionalLight();
	light.name = 'Lamp';
	root.add(light);
	const tracks = createTracks(extension, target, light, [0, 1], 1, 'STEP');

	expect(tracks[0]).toBeInstanceOf(NumberKeyframeTrack);
	play(root, tracks);
	expect(light.intensity).toBe(0);
});

test('splits material base color alpha into an opacity track', () => {
	const { extension, target } = setup('/materials/0/pbrMetallicRoughness/baseColorFactor');
	const material = new MeshBasicMaterial();
	material.name = 'Surface';
	const tracks = createTracks(extension, target, material, [1, 0, 0, 1, 0, 1, 0, 0.25], 4);

	expect(tracks).toHaveLength(2);
	expect(tracks[0]).toBeInstanceOf(ColorKeyframeTrack);
	expect(tracks.map(track => track.name)).toEqual([
		'.materials.Surface.color',
		'.materials.Surface.opacity'
	]);
	expect(Array.from(tracks[1].values)).toEqual([1, 0.25]);
});

test('converts camera field of view from radians to degrees', () => {
	const { extension, target } = setup('/cameras/0/perspective/yfov');
	const camera = new PerspectiveCamera();
	camera.name = 'Camera';
	const tracks = createTracks(extension, target, camera, [Math.PI / 6, Math.PI / 3], 1);

	expect(tracks[0]).toBeInstanceOf(NumberKeyframeTrack);
	expect(tracks[0].name).toBe('.cameras.Camera.fov');
	expect(tracks[0].values[0]).toBeCloseTo(30);
	expect(tracks[0].values[1]).toBeCloseTo(60);
});

test('creates vector tracks for texture transforms', () => {
	const { extension, target } = setup('/materials/0/pbrMetallicRoughness/baseColorTexture/extensions/KHR_texture_transform/offset');
	const material = new MeshBasicMaterial();
	material.name = 'Surface';
	const tracks = createTracks(extension, target, material, [0, 0, 0.25, 0.75], 2);

	expect(tracks[0]).toBeInstanceOf(VectorKeyframeTrack);
	expect(tracks[0].name).toBe('.materials.Surface.map.offset');
});

test.fails('uses a UUID when the target has no name', () => {
	const { extension, target } = setup('/nodes/0/translation');
	const node = new Group();
	const tracks = createTracks(extension, target, node, [0, 0, 0, 1, 2, 3], 3);
	// Object3D.name defaults to '', which is currently treated as a usable name.
	expect(tracks[0].name).toBe(`.nodes.${node.uuid}.position`);
});

test('returns no tracks for a channel without a resolved pointer', () => {
	const { extension } = setup('/nodes/0/translation');
	const other = { path: 'pointer', extensions: { KHR_animation_pointer: { pointer: '/nodes/1/translation' } } };
	expect(createTracks(extension, other, new Group(), [0, 0, 0, 1, 2, 3], 3)).toBeNull();
});

test('skips unsupported accessor item sizes with a warning', () => {
	const { extension, target } = setup('/nodes/0/translation');
	const node = new Group();
	node.name = 'Animated';
	const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
	try {
		expect(createTracks(extension, target, node, [0, 0, 0, 0, 0], 5)).toEqual([]);
		expect(warn).toHaveBeenCalled();
	} finally {
		warn.mockRestore();
	}
});

test.fails('CUBICSPLINE tracks install the parser cubic spline interpolant', () => {
	const { extension, target, parser } = setup('/nodes/0/weights/0');
	const node = new Group();
	node.name = 'MorphNode';
	const tracks = createTracks(extension, target, node, [0, 0, 0, 0, 1, 0], 1, 'CUBICSPLINE');
	expect(parser._createCubicSplineTrackInterpolant).toHaveBeenCalledExactlyOnceWith(tracks[0]);
});
