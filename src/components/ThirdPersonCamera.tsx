import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { useRef } from "react";

interface ThirdPersonCameraProps {
  target: React.MutableRefObject<THREE.Vector3>;
  yaw: React.MutableRefObject<number>;
  pitch: React.MutableRefObject<number>;
}

const CAM_DISTANCE = 18;
const CAM_LERP = 0.08;
const LOOK_LERP = 0.12;

export default function ThirdPersonCamera({ target, yaw, pitch }: ThirdPersonCameraProps) {
  const { camera } = useThree();
  const smoothPos = useRef(new THREE.Vector3());
  const smoothLook = useRef(new THREE.Vector3());

  useFrame(() => {
    const t = target.current;
    const y = yaw.current;
    const p = pitch.current;

    // Spherical offset from target
    const offsetX = Math.sin(y) * Math.cos(p) * CAM_DISTANCE;
    const offsetY = Math.sin(p) * CAM_DISTANCE;
    const offsetZ = Math.cos(y) * Math.cos(p) * CAM_DISTANCE;

    const desiredPos = new THREE.Vector3(t.x + offsetX, t.y + offsetY, t.z + offsetZ);
    smoothPos.current.lerp(desiredPos, CAM_LERP);
    camera.position.copy(smoothPos.current);

    // Smooth look-at
    smoothLook.current.lerp(t, LOOK_LERP);
    camera.lookAt(smoothLook.current);
  });

  return null;
}
