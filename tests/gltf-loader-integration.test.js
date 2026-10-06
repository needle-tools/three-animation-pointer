import { expect, test, vi } from 'vitest';
import { AnimationMixer } from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

import { GLTFAnimationPointerExtension } from '../src/index.js';

async function parseWithPointerPlugin(gltf) {
	const loader = new GLTFLoader();
	loader.register(parser => new GLTFAnimationPointerExtension(parser));
	// FileLoader expects this browser event when it fetches the embedded buffer.
	vi.stubGlobal('ProgressEvent', class ProgressEvent {
		constructor(type, options) {
			this.type = type;
			Object.assign(this, options);
		}
	});
	try {
		return await loader.parseAsync(JSON.stringify(gltf), '');
	} finally {
		vi.unstubAllGlobals();
	}
}

test('GLTFLoader loads and plays a glTF node animation pointer', async () => {
	const samples = new Float32Array([0, 1, 0, 0, 0, 2, 4, 6]);
	const bytes = Buffer.from(samples.buffer);
	const gltf = {
		asset: { version: '2.0' },
		extensionsUsed: ['KHR_animation_pointer'],
		scene: 0,
		scenes: [{ nodes: [0] }],
		nodes: [{ name: 'Animated' }],
		buffers: [{ uri: `data:application/octet-stream;base64,${bytes.toString('base64')}`, byteLength: bytes.length }],
		bufferViews: [
			{ buffer: 0, byteOffset: 0, byteLength: 8 },
			{ buffer: 0, byteOffset: 8, byteLength: 24 }
		],
		accessors: [
			{ bufferView: 0, componentType: 5126, count: 2, type: 'SCALAR', min: [0], max: [1] },
			{ bufferView: 1, componentType: 5126, count: 2, type: 'VEC3' }
		],
		animations: [{
			name: 'Move',
			samplers: [{ input: 0, output: 1, interpolation: 'LINEAR' }],
			channels: [{
				sampler: 0,
				target: {
					path: 'pointer',
					extensions: { KHR_animation_pointer: { pointer: '/nodes/0/translation' } }
				}
			}]
		}]
	};
	const result = await parseWithPointerPlugin(gltf);
	const node = result.scene.getObjectByName('Animated');
	const mixer = new AnimationMixer(result.scene);
	mixer.clipAction(result.animations[0]).play();
	mixer.update(0.5);

	expect(result.animations).toHaveLength(1);
	expect(result.animations[0].tracks.map(track => track.name)).toEqual(['.nodes.Animated.position']);
	expect(node.position.toArray()).toEqual([1, 2, 3]);
});

test('GLTFLoader loads and plays a glTF material animation pointer', async () => {
	const samples = new Float32Array([
		0, 0, 0, 1, 0, 0, 0, 1, 0, // triangle positions
		0, 1, // keyframe times
		0, 1 // roughness values
	]);
	const bytes = Buffer.from(samples.buffer);
	const gltf = {
		asset: { version: '2.0' },
		extensionsUsed: ['KHR_animation_pointer'],
		scene: 0,
		scenes: [{ nodes: [0] }],
		nodes: [{ name: 'MaterialNode', mesh: 0 }],
		meshes: [{ primitives: [{ attributes: { POSITION: 0 }, material: 0 }] }],
		materials: [{ name: 'Surface', pbrMetallicRoughness: { roughnessFactor: 0 } }],
		buffers: [{ uri: `data:application/octet-stream;base64,${bytes.toString('base64')}`, byteLength: bytes.length }],
		bufferViews: [
			{ buffer: 0, byteOffset: 0, byteLength: 36 },
			{ buffer: 0, byteOffset: 36, byteLength: 8 },
			{ buffer: 0, byteOffset: 44, byteLength: 8 }
		],
		accessors: [
			{ bufferView: 0, componentType: 5126, count: 3, type: 'VEC3', min: [0, 0, 0], max: [1, 1, 0] },
			{ bufferView: 1, componentType: 5126, count: 2, type: 'SCALAR', min: [0], max: [1] },
			{ bufferView: 2, componentType: 5126, count: 2, type: 'SCALAR' }
		],
		animations: [{
			name: 'Roughness',
			samplers: [{ input: 1, output: 2, interpolation: 'LINEAR' }],
			channels: [{
				sampler: 0,
				target: {
					path: 'pointer',
					extensions: { KHR_animation_pointer: { pointer: '/materials/0/pbrMetallicRoughness/roughnessFactor' } }
				}
			}]
		}]
	};
	const result = await parseWithPointerPlugin(gltf);
	const material = result.scene.getObjectByName('MaterialNode').material;
	const mixer = new AnimationMixer(result.scene);
	mixer.clipAction(result.animations[0]).play();
	mixer.update(0.5);

	expect(result.animations[0].tracks.map(track => track.name)).toEqual(['.materials.Surface.roughness']);
	expect(material.roughness).toBe(0.5);
});
