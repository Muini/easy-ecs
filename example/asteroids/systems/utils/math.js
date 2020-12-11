export function shortAngleDist(a0, a1) {
  const max = Math.PI * 2;
  const da = Math.sign(a1 - a0) * (Math.abs(a1 - a0) % max);
  return Math.sign(a1 - a0) * ((2 * Math.abs(da)) % max) - da;
}
export function lerpAngle(a0, a1, t) {
  return a0 + shortAngleDist(a0, a1) * t;
}

//https://spicyyoghurt.com/tutorials/html5-javascript-game-development/collision-detection-physics
export function circleIntersect(x1, y1, r1, x2, y2, r2) {
  let squareDistance = (x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2);
  return squareDistance <= (r1 + r2) * (r1 + r2);
}
export function dot(v1, v2) {
  return v1.x * v2.x + v1.y * v2.y;
}
export const rotateVector = (v, angle) => {
  const newV = { x: v.x, y: v.y };
  newV.x = v.x * Math.cos(angle) - v.y * Math.sin(angle);
  newV.y = v.x * Math.sin(angle) + v.y * Math.cos(angle);
  return newV;
};
