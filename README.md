# KHR_animation_pointer for three.js

This package adds a [three.js](https://github.com/mrdoob/three.js) GLTFLoader plugin for [KHR_animation_pointer](https://github.com/KhronosGroup/glTF/tree/main/extensions/2.0/Khronos/KHR_animation_pointer) support.

### Usage

Install the package:   
`npm i @needle-tools/three-animation-pointer`


Register the plugin on your GLTFLoader:  

```js
import { GLTFAnimationPointerExtension } from "@needle-tools/three-animation-pointer"

const loader = new GLTFLoader();
loader.register(p => {
    return new GLTFAnimationPointerExtension(p);
});
```

## Links

- [Khronos KHR_animation_pointer spec](https://github.com/KhronosGroup/glTF/tree/main/extensions/2.0/Khronos/KHR_animation_pointer)
- [three.js repository PR #24108](https://github.com/mrdoob/three.js/pull/24108)



# Contact ✒️
<b>[🌵 Needle](https://needle.tools)</b> • 
[Github](https://github.com/needle-tools) • 
[Twitter](https://twitter.com/NeedleTools) • 
[Discord](https://discord.needle.tools) • 
[Forum](https://forum.needle.tools) • 
[Youtube](https://www.youtube.com/@needle-tools)
