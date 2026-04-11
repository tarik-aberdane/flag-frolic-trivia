import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { useRef } from "react";

interface ThirdPersonCameraProps {
  target: React.MutableRefObject<THREE.Vector3>;
  yaw: React.MutableRefObject<number>;
  pitch: React.MutableRefObject<number>;
  headBob?: React.MutableRefObject<number>;
}

const CAM_DISTANCE = 16;
const CAM_MIN_DISTANCE = 3;
const SHOULDER_OFFSET = 2;
const HEIGHT_OFFSET = 3;
const CAM_LERP = 0.12;
const LOOK_LERP = 0.16;

// Pitch limits: prevent camera from going below ground
const PITCH_MIN = -30 * (Math.PI / 180); // looking up (less extreme)
const PITCH_MAX = 70 * (Math.PI / 180);  // looking down (clamped to avoid ground)

// Minimum camera height above ground
const MIN_CAM_Y = 1.5;

const raycaster = new THREE.Raycaster();
const rayDir = new THREE.Vector3();

export default function ThirdPersonCamera({ target, yaw, pitch, headBob }: ThirdPersonCameraProps) {
  const { camera, scene } = useThree();
  const smoothPos = useRef(new THREE.Vector3());
  const smoothLook = useRef(new THREE.Vector3());
  const initialized = useRef(false);

  // Set near/far clipping planes once
  useFrame(() => {
    // Adjust clipping planes for better rendering
    camera.near = 0.5;
    camera.far = 500;
    (camera as THREE.PerspectiveCamera).updateProjectionMatrix();

    const t = target.current;
    const y = yaw.current;
    const p = pitch.current;

    // Clamp pitch
    const clampedPitch = Math.max(PITCH_MIN, Math.min(PITCH_MAX, p));
    pitch.current = clampedPitch;

    const bob = headBob?.current ?? 0;
    const lookAt = new THREE.Vector3(t.x, t.y + HEIGHT_OFFSET + bob, t.z);

    const cosPitch = Math.cos(clampedPitch);
    const sinPitch = Math.sin(clampedPitch);
    const offsetX = Math.sin(y) * cosPitch * CAM_DISTANCE;
    const offsetY = sinPitch * CAM_DISTANCE;
    const offsetZ = Math.cos(y) * cosPitch * CAM_DISTANCE;

    const shoulderX = Math.cos(y) * SHOULDER_OFFSET;
    const shoulderZ = -Math.sin(y) * SHOULDER_OFFSET;

    const desiredPos = new THREE.Vector3(
      lookAt.x + offsetX + shoulderX,
      lookAt.y + offsetY,
      lookAt.z + offsetZ + shoulderZ
    );

    // Clamp camera Y to never go below ground
    desiredPos.y = Math.max(MIN_CAM_Y, desiredPos.y);

    // Wall collision raycast
    rayDir.copy(desiredPos).sub(lookAt).normalize();
    raycaster.set(lookAt, rayDir);
    raycaster.far = CAM_DISTANCE;

    const obstacles = scene.children.filter(c => c instanceof THREE.Mesh && c.castShadow);
    const hits = raycaster.intersectObjects(obstacles, true);

    let finalDistance = CAM_DISTANCE;
    if (hits.length > 0) {
      finalDistance = Math.max(CAM_MIN_DISTANCE, hits[0].distance - 0.5);
    }

    const actualPos = new THREE.Vector3(
      lookAt.x + rayDir.x * finalDistance + shoulderX,
      Math.max(MIN_CAM_Y, lookAt.y + rayDir.y * finalDistance),
      lookAt.z + rayDir.z * finalDistance + shoulderZ
    );

    if (!initialized.current) {
      smoothPos.current.copy(actualPos);
      smoothLook.current.copy(lookAt);
      initialized.current = true;
    }

    smoothPos.current.lerp(actualPos, CAM_LERP);
    // Final ground clamp on smooth position
    smoothPos.current.y = Math.max(MIN_CAM_Y, smoothPos.current.y);
    
    camera.position.copy(smoothPos.current);
    smoothLook.current.lerp(lookAt, LOOK_LERP);
    camera.lookAt(smoothLook.current);
  });

  return null;
}
