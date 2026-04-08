import * as THREE from 'three';

/**
 * InterpolationUtils - Funciones de suavizado para movimiento fluido
 * 
 * Optimizadas para multiplicar 120 jugadores sin lag
 */

export class InterpolationUtils {
  /**
   * Lerp lineal entre dos valores
   */
  static lerp(a: number, b: number, t: number): number {
    return a + (b - a) * Math.min(1, Math.max(0, t));
  }

  /**
   * Lerp para Vector3
   */
  static lerpVector(a: THREE.Vector3, b: THREE.Vector3, t: number): THREE.Vector3 {
    const result = new THREE.Vector3();
    result.x = this.lerp(a.x, b.x, t);
    result.y = this.lerp(a.y, b.y, t);
    result.z = this.lerp(a.z, b.z, t);
    return result;
  }

  /**
   * Ease-out cubic para movimiento más natural
   */
  static easeOutCubic(t: number): number {
    const t1 = t - 1;
    return t1 * t1 * t1 + 1;
  }

  /**
   * Ease-in-out cubic para movimiento suave
   */
  static easeInOutCubic(t: number): number {
    t = Math.min(1, Math.max(0, t));
    return t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
  }

  /**
   * Smooth damp - suaviza cambios gradualmente
   */
  static smoothDamp(
    current: number,
    target: number,
    velocity: { value: number },
    smoothTime: number,
    maxSpeed: number = Infinity,
    deltaTime: number = 0.016
  ): number {
    smoothTime = Math.max(0.0001, smoothTime);
    const omega = 2 / smoothTime;
    const x = omega * deltaTime;
    const exp = 1 / (1 + x + 0.48 * x * x + 0.235 * x * x * x);
    const change = current - target;
    const originalTo = target;
    const maxChange = maxSpeed * smoothTime;
    const clampedChange = Math.max(-maxChange, Math.min(maxChange, change));
    target = current - clampedChange;

    const dampedVelocity = (velocity.value + omega * clampedChange) * deltaTime;
    velocity.value = (velocity.value - omega * dampedVelocity) * exp;

    let output = target + (clampedChange + dampedVelocity) * exp;

    if (originalTo - current > 0 === output > originalTo) {
      output = originalTo;
      velocity.value = (output - originalTo) / deltaTime;
    }

    return output;
  }

  /**
   * Smooth damp para Vector3
   */
  static smoothDampVector(
    current: THREE.Vector3,
    target: THREE.Vector3,
    velocity: THREE.Vector3,
    smoothTime: number,
    maxSpeed: number = Infinity,
    deltaTime: number = 0.016
  ): THREE.Vector3 {
    const result = new THREE.Vector3();
    const velObj = { value: 0 };

    result.x = this.smoothDamp(current.x, target.x, velObj, smoothTime, maxSpeed, deltaTime);
    result.y = this.smoothDamp(current.y, target.y, velObj, smoothTime, maxSpeed, deltaTime);
    result.z = this.smoothDamp(current.z, target.z, velObj, smoothTime, maxSpeed, deltaTime);

    velocity.copy(result).sub(current).divideScalar(deltaTime);

    return result;
  }

  /**
   * Slerp (Spherical Linear Interpolation) para rotaciones fluidas
   */
  static slerpQuaternion(
    a: THREE.Quaternion,
    b: THREE.Quaternion,
    t: number
  ): THREE.Quaternion {
    return a.clone().slerp(b, Math.min(1, Math.max(0, t)));
  }

  /**
   * Catmull-Rom interpolation para curvas suaves
   */
  static catmullRom(
    p0: number,
    p1: number,
    p2: number,
    p3: number,
    t: number
  ): number {
    const v0 = (p2 - p0) * 0.5;
    const v1 = (p3 - p1) * 0.5;
    const t2 = t * t;
    const t3 = t * t2;

    return (2 * p1 - 2 * p2 + v0 + v1) * t3 +
           (-3 * p1 + 3 * p2 - 2 * v0 - v1) * t2 +
           v0 * t +
           p1;
  }

  /**
   * Bezier cúbica para paths suaves
   */
  static cubicBezier(
    p0: THREE.Vector3,
    p1: THREE.Vector3,
    p2: THREE.Vector3,
    p3: THREE.Vector3,
    t: number
  ): THREE.Vector3 {
    const t1 = 1 - t;
    const t1_3 = Math.pow(t1, 3);
    const t1_2 = t1 * t1;
    const t_3 = Math.pow(t, 3);
    const t_2 = t * t;

    return new THREE.Vector3().copy(p0).multiplyScalar(t1_3)
      .add(p1.clone().multiplyScalar(3 * t1_2 * t))
      .add(p2.clone().multiplyScalar(3 * t1 * t_2))
      .add(p3.clone().multiplyScalar(t_3));
  }

  /**
   * Elastic easing - rebote elástico
   */
  static easeOutElastic(t: number): number {
    const c5 = (2 * Math.PI) / 4.5;
    return t === 0
      ? 0
      : t === 1
      ? 1
      : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c5) + 1;
  }

  /**
   * Back easing - efecto de atraso
   */
  static easeOutBack(t: number): number {
    const c1 = 1.70158;
    const c3 = c1 + 1;
    return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
  }

  /**
   * Bounce easing - efecto de rebote
   */
  static easeOutBounce(t: number): number {
    const n1 = 7.5625;
    const d1 = 2.75;

    if (t < 1 / d1) {
      return n1 * t * t;
    } else if (t < 2 / d1) {
      return n1 * (t -= 1.5 / d1) * t + 0.75;
    } else if (t < 2.5 / d1) {
      return n1 * (t -= 2.25 / d1) * t + 0.9375;
    } else {
      return n1 * (t -= 2.625 / d1) * t + 0.984375;
    }
  }

  /**
   * Obtiene velocidad requerida para llegar de A a B en cierto tiempo
   */
  static getVelocityForDistance(
    from: THREE.Vector3,
    to: THREE.Vector3,
    duration: number
  ): THREE.Vector3 {
    return to.clone().sub(from).divideScalar(duration);
  }

  /**
   * Predice posición futura (útil para lag compensation)
   */
  static predictPosition(
    currentPosition: THREE.Vector3,
    velocity: THREE.Vector3,
    latency: number
  ): THREE.Vector3 {
    return currentPosition.clone().addScaledVector(velocity, latency);
  }

  /**
   * Damping de velocidad (fricción)
   */
  static applyDamping(
    velocity: THREE.Vector3,
    damping: number,
    deltaTime: number
  ): THREE.Vector3 {
    const factor = Math.pow(damping, deltaTime);
    return velocity.multiplyScalar(factor);
  }
}