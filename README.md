# KHR_animation_pointer for three.js

This package adds a [three.js](https://github.com/mrdoob/three.js) GLTFLoader plugin for [KHR_animation_pointer](https://github.com/KhronosGroup/glTF/tree/main/extensions/2.0/Khronos/KHR_animation_pointer) support.

### Animate anything
- all material properties 💎 (including texture transforms) 
- cameras 🎥
- lights 💡
- custom code/scripts 📄


### Three.js Example
<a href="https://threejs.org/examples/?q=gltf#webgl_loader_gltf_animation_pointer" target="_blank">
<img width="1240" height="696" alt="image" src="https://github.com/user-attachments/assets/baa109d8-974b-4c97-9ae9-31a4391e651b" />
</a>

[Video](https://github.com/user-attachments/assets/13fe4102-00ee-430f-9a17-9611fa543f77)

[three.js Example](https://threejs.org/examples/?q=gltf#webgl_loader_gltf_animation_pointer)



### How to use

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

### How to create glTF files using KHR_animation_pointer 

You can use one of the listed tools below to export glTF animations in the right format

- [Blender 4.3](https://www.blender.org/) and newer - *experimental KHR_animation_pointer support, currently only in 'scene animation' mode ([#2285](https://github.com/KhronosGroup/glTF-Blender-IO/issues/2285))*
- [Needle Engine for Unity](https://engine.needle.tools/docs/unity/) - defaults to KHR_animation_pointer and battle tested since 2022
- [UnityGLTF](https://github.com/KhronosGroup/UnityGLTF)


**Mini Unity Tutorial**

[Video](https://github.com/user-attachments/assets/e118a33d-9725-4313-b1d4-b4dbfc7a5a48)

*Note: If you use UnityGLTF for exporting the glTF file make sure to enable the `KHR_animation_pointer` option in the UnityGLTF export settings.*



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
