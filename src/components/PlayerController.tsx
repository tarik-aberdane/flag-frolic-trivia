import { useRef, useCallback } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { InputState } from "@/hooks/useInputHandler";
import { HALF_MAP, OBSTACLES } from "@/game/constants";
import { CharacterDef } from "@/game/characters";

// Base physics constants (scaled by character stats)
const BASE_WALK = 0.18;
const BASE_SPRINT = 0.32;
const ACCELERATION = 0.012;
const DECELERATION = 0.92;
const GRAVITY = -0.025;
const JUMP_FORCE = 0.38;
const FALL_MULTIPLIER = 1.8;
const GROUND_Y = 1;
const HEAD_BOB_SPEED = 12;
const HEAD_BOB_AMOUNT = 0.06;

interface PlayerControllerProps {
  myPos: React.MutableRefObject<THREE.Vector3>;
  yaw: React.MutableRefObject<number>;
  keys: React.MutableRefObject<InputState>;
  disabled: boolean;
  character: CharacterDef;
  stamina: React.MutableRefObject<number>;
  speedBoost: React.MutableRefObject<number>; // multiplier, 1.0 = no boost
  onHeadBob?: (bob: number) => void;
  onStaminaChange?: (val: number) => void;
}

export default function PlayerController({
  myPos, yaw, keys, disabled, character,
  stamina, speedBoost, onHeadBob, onStaminaChange,
}: PlayerControllerProps) {
  const velocity = useRef(new THREE.Vector2(0, 0));
  const verticalVel = useRef(0);
  const isGrounded = useRef(true);
  const bobPhase = useRef(0);

  const collidesObstacle = useCallback((x: number, z: number) => {
    const r = 1.2;
    for (const o of OBSTACLES) {
      const [ox, , oz] = o.pos;
      const [sx, , sz] = o.size;
      if (Math.abs(x - ox) < sx / 2 + r && Math.abs(z - oz) < sz / 2 + r) return true;
    }
    return false;
  }, []);

  useFrame((_, delta) => {
    if (disabled) return;
    const dt = Math.min(delta, 0.05);
    const k = keys.current;
    const angle = yaw.current;

    // Stamina management
    const canSprint = k.sprint && stamina.current > 0;
    if (canSprint) {
      stamina.current = Math.max(0, stamina.current - character.staminaDrain * dt);
    } else {
      stamina.current = Math.min(character.maxStamina, stamina.current + character.staminaRegen * dt);
    }
    onStaminaChange?.(stamina.current);

    // Movement direction (camera-relative)
    let inputX = 0, inputZ = 0;
    if (k.forward) { inputX -= Math.sin(angle); inputZ -= Math.cos(angle); }
    if (k.backward) { inputX += Math.sin(angle); inputZ += Math.cos(angle); }
    if (k.left) { inputX -= Math.cos(angle); inputZ += Math.sin(angle); }
    if (k.right) { inputX += Math.cos(angle); inputZ -= Math.sin(angle); }

    const hasInput = inputX !== 0 || inputZ !== 0;

    // Calculate speed with character stats and power-up boost
    const walkSpeed = BASE_WALK * character.walkSpeed * speedBoost.current;
    const sprintSpeed = BASE_SPRINT * character.sprintSpeed * speedBoost.current;
    const targetSpeed = canSprint ? sprintSpeed : walkSpeed;

    if (hasInput) {
      const len = Math.sqrt(inputX * inputX + inputZ * inputZ);
      inputX /= len; inputZ /= len;

      velocity.current.x += (inputX * targetSpeed - velocity.current.x) * ACCELERATION * dt * 60;
      velocity.current.y += (inputZ * targetSpeed - velocity.current.y) * ACCELERATION * dt * 60;
    } else {
      velocity.current.x *= Math.pow(DECELERATION, dt * 60);
      velocity.current.y *= Math.pow(DECELERATION, dt * 60);
    }

    // Apply horizontal movement with wall sliding
    const nx = myPos.current.x + velocity.current.x * dt * 60;
    const nz = myPos.current.z + velocity.current.y * dt * 60;
    const clampedX = Math.max(-HALF_MAP + 2, Math.min(HALF_MAP - 2, nx));
    const clampedZ = Math.max(-HALF_MAP + 2, Math.min(HALF_MAP - 2, nz));

    if (!collidesObstacle(clampedX, clampedZ)) {
      myPos.current.x = clampedX;
      myPos.current.z = clampedZ;
    } else if (!collidesObstacle(clampedX, myPos.current.z)) {
      myPos.current.x = clampedX;
      velocity.current.y = 0;
    } else if (!collidesObstacle(myPos.current.x, clampedZ)) {
      myPos.current.z = clampedZ;
      velocity.current.x = 0;
    }

    // Jump
    if (k.jump && isGrounded.current) {
      verticalVel.current = JUMP_FORCE;
      isGrounded.current = false;
    }

    if (!isGrounded.current) {
      const grav = verticalVel.current < 0 ? GRAVITY * FALL_MULTIPLIER : GRAVITY;
      verticalVel.current += grav * dt * 60;
      myPos.current.y += verticalVel.current * dt * 60;
      if (myPos.current.y <= GROUND_Y) {
        myPos.current.y = GROUND_Y;
        verticalVel.current = 0;
        isGrounded.current = true;
      }
    }

    // Head bob
    const speed = Math.sqrt(velocity.current.x ** 2 + velocity.current.y ** 2);
    if (hasInput && isGrounded.current && speed > 0.02) {
      bobPhase.current += dt * HEAD_BOB_SPEED * (canSprint ? 1.4 : 1);
      onHeadBob?.(Math.sin(bobPhase.current) * HEAD_BOB_AMOUNT * speed * 10);
    } else {
      bobPhase.current = 0;
      onHeadBob?.(0);
    }
  });

  return null;
}
