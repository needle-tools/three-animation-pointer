import { expect, test, vi } from 'vitest';
import { AnimationMixer, Group, NumberKeyframeTrack } from 'three';

import { GLTFAnimationPointerExtension } from '../src/GLTFLoaderAnimationPointer.js';

test('loads a pointer animation through parser dependencies and plays the clip', async () => {
	const root = new Group();
	const node = new Group();
	node.name = 'Animated';
	root.add(node);
	const target = {
		path: 'pointer',
		extensions: { KHR_animation_pointer: { pointer: '/nodes/0/translation' } }
	};
	const accessors = [
		{ array: new Float32Array([0, 1]), itemSize: 1 },
		{ array: new Float32Array([0, 0, 0, 2, 4, 6]), itemSize: 3 }
	];
	const parser = {
		json: {
			animations: [{
				name: 'Move',
				channels: [{ sampler: 0, target }],
				samplers: [{ input: 0, output: 1, interpolation: 'LINEAR' }]
			}]
		},
		getDependency: vi.fn((type, index) => Promise.resolve(type === 'node' ? node : accessors[index])),
		_getArrayFromAccessor: accessor => accessor.array
	};
	const extension = new GLTFAnimationPointerExtension(parser);
	const clip = await extension.loadAnimation(0);
	const mixer = new AnimationMixer(root);
	mixer.clipAction(clip).play();
	mixer.update(0.5);

	expect(clip.name).toBe('Move');
	expect(clip.tracks.map(track => track.name)).toEqual(['.nodes.Animated.position']);
	expect(parser.getDependency.mock.calls).toEqual([['node', 0], ['accessor', 0], ['accessor', 1]]);
	expect(node.position.toArray()).toEqual([1, 2, 3]);
});

test('delegates ordinary animation channels to the GLTF parser', async () => {
	const node = new Group();
	const fallbackTrack = new NumberKeyframeTrack('Animated.visible', [0, 1], [1, 0]);
	const parser = {
		json: {
			animations: [{
				channels: [{ sampler: 0, target: { node: 0, path: 'translation' } }],
				samplers: [{ input: 0, output: 1 }]
			}]
		},
		getDependency: vi.fn((type, index) => Promise.resolve(type === 'node' ? node : { array: [index] })),
		_createAnimationTracks: vi.fn(() => [fallbackTrack])
	};
	const extension = new GLTFAnimationPointerExtension(parser);
	const clip = await extension.loadAnimation(0);

	expect(parser._createAnimationTracks).toHaveBeenCalledOnce();
	expect(clip.name).toBe('animation_0');
	expect(clip.tracks).toEqual([fallbackTrack]);
});
