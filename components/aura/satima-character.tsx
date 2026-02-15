"use client";

import { Canvas } from "@react-three/fiber";
import { Html, useGLTF } from "@react-three/drei";
import { Suspense, useMemo } from "react";
import * as THREE from "three";
import { clone as cloneSkeleton } from "three/examples/jsm/utils/SkeletonUtils.js";

interface SatimaCharacterProps {
    impacting: boolean;
}

interface PreparedModel {
    scene: THREE.Group;
    scale: number;
    offset: THREE.Vector3;
}

function prepareModel(scene: THREE.Group): PreparedModel {
    const clonedScene = cloneSkeleton(scene) as THREE.Group;
    clonedScene.updateMatrixWorld(true);

    clonedScene.traverse((object) => {
        const mesh = object as THREE.Mesh;
        if (!mesh.isMesh) return;
        mesh.frustumCulled = false;

        const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
        materials.forEach((material) => {
            if (!material) return;
            material.side = THREE.DoubleSide;
            material.needsUpdate = true;
        });
    });

    const bounds = new THREE.Box3().setFromObject(clonedScene);
    const size = new THREE.Vector3();
    const center = new THREE.Vector3();
    bounds.getSize(size);
    bounds.getCenter(center);

    // Model is authored with tiny root transforms (~0.01). Normalize to visible height.
    const safeHeight = Math.max(size.y, 0.000001);
    const targetHeight = 1.85;
    const scale = THREE.MathUtils.clamp(targetHeight / safeHeight, 0.1, 1000);
    const verticalDrop = 0.82;
    const offset = new THREE.Vector3(
        -center.x * scale,
        -bounds.min.y * scale - verticalDrop,
        -center.z * scale
    );

    return { scene: clonedScene, scale, offset };
}

function SatimaModel() {
    const { scene } = useGLTF("/satima.glb");
    const prepared = useMemo(() => prepareModel(scene), [scene]);

    return (
        <group position={prepared.offset} scale={prepared.scale}>
            <primitive object={prepared.scene} />
        </group>
    );
}

function SatimaFallback() {
    return (
        <Html center>
            <div className="rounded-full border border-slate-200 bg-white/90 px-3 py-1 text-xs font-medium text-slate-600 shadow-sm">
                Loading Satima...
            </div>
        </Html>
    );
}

export function SatimaCharacter({ impacting }: SatimaCharacterProps) {
    void impacting;

    return (
        <div className="h-[420px] w-[300px]">
            <Canvas
                camera={{ position: [0, 1.2, 3.8], fov: 35, near: 0.01, far: 5000 }}
                dpr={[1, 1]}
                gl={{ antialias: true, alpha: true, powerPreference: "low-power" }}
            >
                <ambientLight intensity={1.05} />
                <directionalLight position={[2.5, 3.5, 2.5]} intensity={1.1} />
                <directionalLight position={[-2, 2.5, -2]} intensity={0.5} />
                <Suspense fallback={<SatimaFallback />}>
                    <SatimaModel />
                </Suspense>
            </Canvas>
        </div>
    );
}

useGLTF.preload("/satima.glb");
