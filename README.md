# KHR_animation_pointer for three.js

This package adds a [three.js](https://github.com/mrdoob/three.js) GLTFLoader plugin for [KHR_animation_pointer](https://github.com/KhronosGroup/glTF/tree/main/extensions/2.0/Khronos/KHR_animation_pointer) support.

### Animate anything
- all material properties 💎
- cameras 🎥
- lights 💡
- custom code/scripts 📄

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

https://github.com/user-attachments/assets/13fe4102-00ee-430f-9a17-9611fa543f77

[Live Example](https://three.needle.tools/examples/?q=pointer#webgl_loader_gltf_animation_pointer)

### How to create glTF files using KHR_animation_pointer 

You can use one of the listed tools below to export glTF animations in the right format

- [Blender 4.3](https://www.blender.org/) and newer - *experimental KHR_animation_pointer support, currently only in 'scene animation' mode ([#2285](https://github.com/KhronosGroup/glTF-Blender-IO/issues/2285))*
- [Needle Engine for Unity](https://engine.needle.tools/docs/unity/) - defaults to KHR_animation_pointer and battle tested since 2022
- [UnityGLTF](https://github.com/KhronosGroup/UnityGLTF)

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
