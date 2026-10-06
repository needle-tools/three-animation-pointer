import { expect, test } from 'vitest';

import DefaultExtension, { GLTFAnimationPointerExtension } from '../src/index.js';

test('exports the loader plugin as both default and named export', () => {
	expect(DefaultExtension).toBe(GLTFAnimationPointerExtension);
	expect(new DefaultExtension({}).name).toBe('KHR_animation_pointer');
});
