import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { useRef } from "react";

interface ThirdPersonCameraProps {
  target: React.MutableRefObject<THREE.Vector3>;
  yaw: React.MutableRefObject<number>;
  pitch: React.MutableRefObject<number>;
  headBob?: React.MutableRefObject<number>;
}

// Camera tuning
const CAM_DISTANCE = 16;
const CAM_MIN_DISTANCE = 3;
const SHOULDER_OFFSET = 2; // slight right offset for shoulder cam
const HEIGHT_OFFSET = 3; // look-at point above player feet
const CAM_LERP = 0.1;
const LOOK_LERP = 0.14;

// Pitch limits in radians: -40° to 80°
const PITCH_MIN = -40 * (Math.PI / 180); // looking up
const PITCH_MAX = 80 * (Math.PI / 180);  // looking down

// Raycaster for wall collision
const raycaster = new THREE.Raycaster();
const rayDir = new THREE.Vector3();

export default function ThirdPersonCamera({ target, yaw, pitch, headBob }: ThirdPersonCameraProps) {
  const { camera, scene } = useThree();
  const smoothPos = useRef(new THREE.Vector3());
  const smoothLook = useRef(new THREE.Vector3());
  const initialized = useRef(false);

  useFrame(() => {
    const t = target.current;
    const y = yaw.current;
    const p = pitch.current;

    // Clamp pitch
    const clampedPitch = Math.max(PITCH_MIN, Math.min(PITCH_MAX, p));
    pitch.current = clampedPitch;

    // Look-at point (slightly above player + head bob)
    const bob = headBob?.current ?? 0;
    const lookAt = new THREE.Vector3(t.x, t.y + HEIGHT_OFFSET + bob, t.z);

    // Spherical offset from look-at point
    const cosPitch = Math.cos(clampedPitch);
    const sinPitch = Math.sin(clampedPitch);
    const offsetX = Math.sin(y) * cosPitch * CAM_DISTANCE;
    const offsetY = sinPitch * CAM_DISTANCE;
    const offsetZ = Math.cos(y) * cosPitch * CAM_DISTANCE;

    // Shoulder offset (perpendicular to camera direction in XZ)
    const shoulderX = Math.cos(y) * SHOULDER_OFFSET;
    const shoulderZ = -Math.sin(y) * SHOULDER_OFFSET;

    const desiredPos = new THREE.Vector3(
      lookAt.x + offsetX + shoulderX,
      lookAt.y + offsetY,
      lookAt.z + offsetZ + shoulderZ
    );

    // ── Wall collision raycast ──
    rayDir.copy(desiredPos).sub(lookAt).normalize();
    raycaster.set(lookAt, rayDir);
    raycaster.far = CAM_DISTANCE;

    // Only check obstacle meshes (tagged with userData.obstacle or castShadow as proxy)
    const obstacles = scene.children.filter(c => c instanceof THREE.Mesh && c.castShadow);
    const hits = raycaster.intersectObjects(obstacles, true);

    let finalDistance = CAM_DISTANCE;
    if (hits.length > 0) {
      finalDistance = Math.max(CAM_MIN_DISTANCE, hits[0].distance - 0.5);
    }

    const actualPos = new THREE.Vector3(
      lookAt.x + rayDir.x * finalDistance + shoulderX,
      lookAt.y + rayDir.y * finalDistance,
      lookAt.z + rayDir.z * finalDistance + shoulderZ
    );

    // Initialize or lerp
    if (!initialized.current) {
      smoothPos.current.copy(actualPos);
      smoothLook.current.copy(lookAt);
      initialized.current = true;
    }

    smoothPos.current.lerp(actualPos, CAM_LERP);
    camera.position.copy(smoothPos.current);

    smoothLook.current.lerp(lookAt, LOOK_LERP);
    camera.lookAt(smoothLook.current);
  });

  return null;
}
