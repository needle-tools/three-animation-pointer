import { expect, test } from 'vitest';
import {
	AnimationClip, AnimationMixer, BoxGeometry, DirectionalLight, Group,
	Mesh, MeshStandardMaterial, PerspectiveCamera, Texture
} from 'three';

import { GLTFAnimationPointerExtension } from '../src/GLTFLoaderAnimationPointer.js';

function animate(root, targetObject, pointer, values, itemSize, resolvePath) {
	const parser = {
		getDependency: () => Promise.resolve(),
		_getArrayFromAccessor: accessor => accessor.array
	};
	const extension = new GLTFAnimationPointerExtension(parser);
	if (resolvePath) extension.setAnimationPointerResolver({ resolvePath });
	const target = {
		path: 'pointer',
		extensions: { KHR_animation_pointer: { pointer } }
	};
	extension.loadAnimationTargetFromChannelWithAnimationPointer({ target });
	const tracks = extension.createAnimationTracksWithAnimationPointer(
		targetObject,
		{ array: new Float32Array([0, 1]) },
		{ array: new Float32Array(values), itemSize },
		{ interpolation: 'LINEAR' },
		target
	);
	const mixer = new AnimationMixer(root);
	mixer.clipAction(new AnimationClip('pointer', 1, tracks)).play();
	mixer.update(0.5);
	return tracks;
}

test('material roughness animation binds to the mesh material', () => {
	const root = new Group();
	const material = new MeshStandardMaterial({ roughness: 0 });
	material.name = 'Surface';
	root.add(new Mesh(new BoxGeometry(), material));

	const tracks = animate(root, material, '/materials/0/pbrMetallicRoughness/roughnessFactor', [0, 1], 1);
	expect(tracks[0].name).toBe('.materials.Surface.roughness');
	expect(material.roughness).toBe(0.5);
});

test('base color factor animates material color and opacity', () => {
	const root = new Group();
	const material = new MeshStandardMaterial();
	material.name = 'Surface';
	root.add(new Mesh(new BoxGeometry(), material));

	const tracks = animate(root, material, '/materials/0/pbrMetallicRoughness/baseColorFactor',
		[1, 0, 0, 1, 0, 1, 0, 0.5], 4);
	expect(tracks).toHaveLength(2);
	expect(material.color.r).toBeCloseTo(0.5);
	expect(material.color.g).toBeCloseTo(0.5);
	expect(material.color.b).toBeCloseTo(0);
	expect(material.opacity).toBeCloseTo(0.75);
});

test('texture transform animation binds to the material map', () => {
	const root = new Group();
	const material = new MeshStandardMaterial({ map: new Texture() });
	material.name = 'Surface';
	root.add(new Mesh(new BoxGeometry(), material));

	animate(root, material, '/materials/0/pbrMetallicRoughness/baseColorTexture/extensions/KHR_texture_transform/offset',
		[0, 0, 0.4, 0.8], 2);
	expect(material.map.offset.x).toBeCloseTo(0.2);
	expect(material.map.offset.y).toBeCloseTo(0.4);
});

test('light intensity animation binds to the light', () => {
	const root = new Group();
	const light = new DirectionalLight();
	light.name = 'Lamp';
	root.add(light);

	animate(root, light, '/extensions/KHR_lights_punctual/lights/0/intensity', [0, 4], 1);
	expect(light.intensity).toBe(2);
});

test('camera field of view animation converts units and binds to the camera', () => {
	const root = new Group();
	const camera = new PerspectiveCamera();
	camera.name = 'Camera';
	root.add(camera);

	animate(root, camera, '/cameras/0/perspective/yfov', [Math.PI / 6, Math.PI / 3], 1);
	expect(camera.fov).toBeCloseTo(45);
});

test('a custom resolver animates an application property', () => {
	const root = new Group();
	const node = new Group();
	node.name = 'Custom';
	node.userData.progress = 0;
	root.add(node);

	const tracks = animate(root, node, '/nodes/0/translation', [0, 1], 1,
		() => '/nodes/0/userData/progress');
	expect(tracks[0].name).toBe('.nodes.Custom.userData.progress');
	expect(node.userData.progress).toBe(0.5);
});

test('full morph weight animation updates every target on a group submesh', () => {
	const root = new Group();
	const node = new Group();
	node.name = 'MorphNode';
	const geometry = new BoxGeometry();
	geometry.morphAttributes.position = [
		geometry.attributes.position.clone(),
		geometry.attributes.position.clone()
	];
	const mesh = new Mesh(geometry, new MeshStandardMaterial());
	mesh.name = 'Body';
	node.add(mesh);
	root.add(node);

	const tracks = animate(root, node, '/nodes/0/weights', [0, 0, 1, 0.5], 2);
	expect(tracks.map(track => track.name)).toEqual(['.nodes.MorphNode.Body.morphTargetInfluences']);
	expect(mesh.morphTargetInfluences).toEqual([0.5, 0.25]);
});
