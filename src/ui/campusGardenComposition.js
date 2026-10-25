import * as THREE from 'three';

export const CAMPUS_COMPOSITION = Object.freeze({
  camera: Object.freeze({ fov: 47, position: Object.freeze([0, 4.35, 22.8]), target: Object.freeze([0, 1.95, -.35]) }),
  pavers: Object.freeze({ columns: 5, rows: 30, width: .92, depth: .72, pitch: .7, startZ: 10.35 }),
  horizon: Object.freeze({
    mountains: Object.freeze([Object.freeze([-14.5, 0x9bb7bc, 1.25]), Object.freeze([-13.9, 0x608b98, .92]), Object.freeze([-13.3, 0x3e6875, .63])]),
    clouds: Object.freeze([Object.freeze([-9, 8.4, -14.8, 1.35]), Object.freeze([-2.4, 9.7, -15, 1.1]), Object.freeze([5.6, 8.75, -14.7, 1.55]), Object.freeze([11.2, 10.1, -15, .9])]),
  }),
});

export function createPaverApproach(composition = CAMPUS_COMPOSITION.pavers) {
  const { columns, rows, width, depth, pitch, startZ } = composition;
  const pavers = new THREE.InstancedMesh(new THREE.BoxGeometry(width, .055, depth), new THREE.MeshStandardMaterial({ color: 0xd4bd8c, roughness: .92 }), columns * rows);
  const matrix = new THREE.Matrix4(); const position = new THREE.Vector3();
  for (let row = 0; row < rows; row += 1) for (let column = 0; column < columns; column += 1) {
    position.set((column - (columns - 1) / 2) * width, .052, startZ - row * pitch); matrix.setPosition(position); pavers.setMatrixAt(row * columns + column, matrix);
  }
  pavers.instanceMatrix.needsUpdate = true; pavers.name = 'campus-paver-approach'; pavers.castShadow = false; pavers.receiveShadow = true;
  return pavers;
}
