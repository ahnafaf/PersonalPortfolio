import React, { useRef, useEffect, useState, Suspense } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { OrbitControls, Stars, Html, useProgress } from '@react-three/drei';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

function LoadingManager() {
  const { progress } = useProgress();
  return <Html center>{progress.toFixed(0)} % loaded</Html>;
}

const EarthModel = ({ setLoading }) => {
  console.log("Starting to load Earth model");
  const earthRef = useRef();
  const mixerRef = useRef();
  const { scene, animations } = useLoader(
    GLTFLoader,
    '/models/scene.gltf',
    (loader) => {
      console.log("Loading progress:", loader);
    },
    (error) => {
      console.error('Error loading the model:', error);
    }
  );

  useEffect(() => {
    console.log("Scene loaded:", scene);
    console.log("Animations:", animations);
    if (scene) {
      scene.scale.set(0.4, 0.4, 0.4);
      earthRef.current = scene;

      const mixer = new THREE.AnimationMixer(scene);
      animations.forEach((clip) => {
        const action = mixer.clipAction(clip);
        action.setEffectiveTimeScale(0.25);
        action.play();
      });
      mixerRef.current = mixer;

      console.log("Earth model setup complete");
      setLoading(false);
    }
  }, [scene, animations, setLoading]);

  useFrame((state, delta) => {
    if (mixerRef.current) {
      mixerRef.current.update(delta);
    }
  });

  return scene ? <primitive object={scene} /> : null;
};

const EarthScene = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timeout = setTimeout(() => {
      console.log("Loading timeout reached");
      setLoading(false);
    }, 10000); // 10 seconds timeout

    return () => clearTimeout(timeout);
  }, []);

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <Canvas camera={{ position: [0, 0, 2], fov: 45 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />
        <Suspense fallback={<LoadingManager />}>
          <EarthModel setLoading={setLoading} />
        </Suspense>
        <Stars />
        <OrbitControls />
      </Canvas>
      {loading && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          color: 'white',
          fontSize: '24px'
        }}>
          Loading Earth...
        </div>
      )}
    </div>
  );
};

export default EarthScene;
