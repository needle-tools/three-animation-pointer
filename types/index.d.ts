import { GLTFLoaderPlugin } from "three/examples/jsm/loaders/GLTFLoader";
import { GLTFLoaderPlugin } from "../src/GLTFLoaderAnimationPointer";


export type AnimationPointerResolver = {
    resolvePath(path: string): string | null;
}

export type GLTFAnimationPointerExtension = GLTFLoaderPlugin & {
    setAnimationPointerResolver(resolver: AnimationPointerResolver | null): void;
}