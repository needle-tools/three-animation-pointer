import { expect, test, vi } from 'vitest';

import { GLTFAnimationPointerExtension } from '../src/GLTFLoaderAnimationPointer.js';

function resolvePointer(pointer) {
	const getDependency = vi.fn(() => Promise.resolve());
	const extension = new GLTFAnimationPointerExtension({ getDependency });
	const target = { path: 'pointer', extensions: { KHR_animation_pointer: { pointer } } };
	const dependency = extension.loadAnimationTargetFromChannelWithAnimationPointer({ target });
	return { extension, dependency, getDependency, target };
}

test.each([
	['/nodes/0/translation', '/nodes/0/position'],
	['/nodes/0/rotation', '/nodes/0/quaternion'],
	['/nodes/0/scale', '/nodes/0/scale'],
	['/nodes/0/weights', '/nodes/0/morphTargetInfluences'],
	['/nodes/0/weights/2', '/nodes/0/morphTargetInfluences[2]'],
	['/nodes/0/extensions/KHR_node_visibility/visible', '/nodes/0/visible'],
	['/materials/1/pbrMetallicRoughness/baseColorFactor', '/materials/1/color'],
	['/materials/1/pbrMetallicRoughness/roughnessFactor', '/materials/1/roughness'],
	['/materials/1/pbrMetallicRoughness/metallicFactor', '/materials/1/metalness'],
	['/materials/1/emissiveFactor', '/materials/1/emissive'],
	['/materials/1/alphaCutoff', '/materials/1/alphaTest'],
	['/materials/1/occlusionTexture/strength', '/materials/1/aoMapIntensity'],
	['/materials/1/normalTexture/scale', '/materials/1/normalScale'],
	['/materials/1/pbrMetallicRoughness/baseColorTexture/extensions/KHR_texture_transform/scale', '/materials/1/map/repeat'],
	['/materials/1/pbrMetallicRoughness/baseColorTexture/extensions/KHR_texture_transform/offset', '/materials/1/map/offset'],
	['/materials/1/emissiveTexture/extensions/KHR_texture_transform/scale', '/materials/1/emissiveMap/repeat'],
	['/materials/1/emissiveTexture/extensions/KHR_texture_transform/offset', '/materials/1/emissiveMap/offset'],
	['/materials/1/extensions/KHR_materials_emissive_strength/emissiveStrength', '/materials/1/emissiveIntensity'],
	['/materials/1/extensions/KHR_materials_transmission/transmissionFactor', '/materials/1/transmission'],
	['/materials/1/extensions/KHR_materials_ior/ior', '/materials/1/ior'],
	['/materials/1/extensions/KHR_materials_volume/thicknessFactor', '/materials/1/thickness'],
	['/materials/1/extensions/KHR_materials_volume/attenuationColor', '/materials/1/attenuationColor'],
	['/materials/1/extensions/KHR_materials_volume/attenuationDistance', '/materials/1/attenuationDistance'],
	['/materials/1/extensions/KHR_materials_iridescence/iridescenceFactor', '/materials/1/iridescence'],
	['/materials/1/extensions/KHR_materials_iridescence/iridescenceIor', '/materials/1/iridescenceIOR'],
	['/materials/1/extensions/KHR_materials_iridescence/iridescenceThicknessMinimum', '/materials/1/iridescenceThicknessRange[0]'],
	['/materials/1/extensions/KHR_materials_iridescence/iridescenceThicknessMaximum', '/materials/1/iridescenceThicknessRange[1]'],
	['/materials/1/extensions/KHR_materials_clearcoat/clearcoatFactor', '/materials/1/clearcoat'],
	['/materials/1/extensions/KHR_materials_clearcoat/clearcoatRoughnessFactor', '/materials/1/clearcoatRoughness'],
	['/materials/1/extensions/KHR_materials_sheen/sheenColorFactor', '/materials/1/sheenColor'],
	['/materials/1/extensions/KHR_materials_sheen/sheenRoughnessFactor', '/materials/1/sheenRoughness'],
	['/materials/1/extensions/KHR_materials_specular/specularFactor', '/materials/1/specularIntensity'],
	['/materials/1/extensions/KHR_materials_specular/specularColorFactor', '/materials/1/specularColor'],
	['/extensions/KHR_lights_punctual/lights/3/color', '/lights/3/color'],
	['/extensions/KHR_lights_punctual/lights/3/intensity', '/lights/3/intensity'],
	['/extensions/KHR_lights_punctual/lights/3/spot/innerConeAngle', '/lights/3/penumbra'],
	['/extensions/KHR_lights_punctual/lights/3/spot/outerConeAngle', '/lights/3/angle'],
	['/extensions/KHR_lights_punctual/lights/3/range', '/lights/3/distance'],
	['/cameras/4/perspective/yfov', '/cameras/4/fov'],
	['/cameras/4/perspective/znear', '/cameras/4/near'],
	['/cameras/4/orthographic/znear', '/cameras/4/near'],
	['/cameras/4/perspective/zfar', '/cameras/4/far'],
	['/cameras/4/orthographic/zfar', '/cameras/4/far'],
	['/cameras/4/perspective/aspect', '/cameras/4/aspect'],
	['/cameras/4/orthographic/xmag', '/cameras/4/zoom'],
	['/cameras/4/orthographic/ymag', '/cameras/4/zoom']
])('%s maps to %s', (pointer, expected) => {
	const { extension, dependency, getDependency } = resolvePointer(pointer);
	const [, family, index] = expected.split('/');
	expect(extension.pointerPathMap.get(pointer)).toBe(expected);
	expect(getDependency).toHaveBeenCalledExactlyOnceWith(family === 'lights' ? 'light' : family.slice(0, -1), Number(index));
	expect(dependency).toBeInstanceOf(Promise);
});

test('a custom resolver can redirect a pointer to an application property', () => {
	const { extension, getDependency } = resolvePointer('/nodes/0/translation');
	const resolver = { resolvePath: vi.fn(() => '/nodes/0/userData/customPosition') };
	expect(extension.setAnimationPointerResolver(resolver)).toBe(extension);
	extension.loadAnimationTargetFromChannelWithAnimationPointer({
		target: { path: 'pointer', extensions: { KHR_animation_pointer: { pointer: '/nodes/0/translation' } } }
	});

	expect(resolver.resolvePath).toHaveBeenCalledWith('/nodes/0/position');
	expect(extension.pointerPathMap.get('/nodes/0/translation')).toBe('/nodes/0/userData/customPosition');
	expect(getDependency).toHaveBeenCalledTimes(2);
});

test('ignores channels that do not use KHR_animation_pointer', () => {
	const { extension } = resolvePointer('/nodes/0/translation');
	const getDependency = vi.spyOn(extension.parser, 'getDependency');
	getDependency.mockClear();
	expect(extension.loadAnimationTargetFromChannelWithAnimationPointer({ target: { node: 0, path: 'translation' } })).toBeNull();
	expect(getDependency).not.toHaveBeenCalled();
});

test('legacy node targets request the node dependency', () => {
	const getDependency = vi.fn(() => Promise.resolve());
	const extension = new GLTFAnimationPointerExtension({ getDependency });
	extension.loadAnimationTargetFromChannel({ target: { id: 3, path: 'translation' } });
	expect(getDependency).toHaveBeenCalledExactlyOnceWith('node', 3);
});

test.each(['/nodes/not-an-index/translation', '/materials/not-an-index/roughness'])
('%s does not request a dependency', pointer => {
	const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
	try {
		const { extension, dependency, getDependency } = resolvePointer(pointer);
		expect(dependency).toBeUndefined();
		expect(getDependency).not.toHaveBeenCalled();
		expect(extension.pointerPathMap.has(pointer)).toBe(false);
		expect(warn).toHaveBeenCalled();
	} finally {
		warn.mockRestore();
	}
});
