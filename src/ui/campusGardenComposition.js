import * as THREE from 'three';

export const CAMPUS_COMPOSITION = Object.freeze({
  camera: Object.freeze({ fov: 47, position: Object.freeze([0, 4.35, 22.8]), target: Object.freeze([0, 1.95, -.35]) }),
  pavers: Object.freeze({ columns: 5, rows: 43, width: .92, depth: .72, pitch: .7, startZ: 14.65 }),
  horizon: Object.freeze({
    mountains: Object.freeze([Object.freeze([-14.5, 0x9bb7bc, 1.25]), Object.freeze([-13.9, 0x608b98, .92]), Object.freeze([-13.3, 0x3e6875, .63])]),
    clouds: Object.freeze([Object.freeze([-9, 8.4, -14.8, 1.35]), Object.freeze([-2.4, 9.7, -15, 1.1]), Object.freeze([5.6, 8.75, -14.7, 1.55]), Object.freeze([11.2, 10.1, -15, .9])]),
  }),
});

export const LANDSCAPE_PLACEMENTS = Object.freeze({
  'tree_detailed.glb': Object.freeze([[-11.3, -5.7, .76], [-9.3, 4.7, .58], [10.7, -4.5, .76], [-10.9, 3, .54], [10.9, 3.1, .54], [-11.7, -.9, .48], [11.8, .7, .5]]),
  'tree_oak.glb': Object.freeze([[-6.4, -5.9, .68], [8.9, 4.6, .66], [-8.2, 4.9, .5], [7.9, -5.2, .5], [-10.1, -3.4, .43], [10.1, -3.1, .43]]),
  'grass_large.glb': Object.freeze([[-5.2, 3.05, .23], [-4.7, 3.15, .2], [2.8, 3.1, .22], [3.75, 3.2, .19], [-7.1, -.6, .2], [7.2, -.7, .2], [-6.8, 2.8, .18], [-5.9, 3.5, .2], [-4.8, -3.6, .18], [-3.7, -4.5, .2], [3.6, -4.3, .2], [4.7, -3.5, .18], [5.8, 3.4, .2], [6.8, 2.8, .18], [-8.9, 1.1, .19], [8.8, .9, .19], [-6.4, 4.45, .2], [6.5, 4.35, .2], [-7.5, -4.6, .18], [7.6, -4.5, .18]]),
  'flower_yellowB.glb': Object.freeze([[-4.5, 3.55, .19], [-3.8, 3.72, .18], [3.0, 3.55, .2], [3.6, 3.78, .18], [-6.5, 2.4, .17], [-5.8, 2.85, .17], [5.5, 2.8, .18], [6.4, 2.35, .17]]),
  'flower_purpleB.glb': Object.freeze([[-4.1, 3.8, .18], [-3.55, 3.48, .17], [3.35, 3.48, .19], [3.95, 3.68, .17], [-4.5, -3.6, .17], [-3.75, -4.2, .16], [3.7, -4.1, .17], [4.5, -3.55, .16]]),
  'rock_largeA.glb': Object.freeze([[-8.15, 2.45, .33], [8.3, 2.8, .3], [-7.3, 3.4, .25], [7.3, 3.4, .25]]),
  'rock_smallE.glb': Object.freeze([[-9.75, -1.15, .22], [9.95, -1.75, .22], [-4.65, 5.45, .2], [5.35, 5.38, .2], [-5.5, -4.9, .18], [5.5, -4.9, .18]]),
});

export function createPaverApproach(composition = CAMPUS_COMPOSITION.pavers) {
  const { columns, rows, width, depth, pitch, startZ } = composition;
  const pavers = new THREE.InstancedMesh(new THREE.BoxGeometry(width, .055, depth), new THREE.MeshStandardMaterial({ color: 0xe6cd9b, emissive: 0x4b351b, emissiveIntensity: .1, roughness: .84, metalness: .01 }), columns * rows);
  const matrix = new THREE.Matrix4(); const position = new THREE.Vector3();
  for (let row = 0; row < rows; row += 1) for (let column = 0; column < columns; column += 1) {
    const index = row * columns + column; position.set((column - (columns - 1) / 2) * width, .052 + ((row + column) % 3) * .004, startZ - row * pitch); matrix.setPosition(position); pavers.setMatrixAt(index, matrix);
  }
  pavers.instanceMatrix.needsUpdate = true; pavers.name = 'campus-paver-approach'; pavers.castShadow = false; pavers.receiveShadow = true;
  return pavers;
}

export function attachMedicalGardenComposition(scene, { createMountainLayer, createCloudLayer, loadLandscape }) {
  scene.add(createPaverApproach());
  [-2.52, 2.52].forEach((x) => {
    const curb = new THREE.Mesh(new THREE.BoxGeometry(.16, .11, 30), new THREE.MeshStandardMaterial({ color: 0xf6eedb, roughness: .68 }));
    curb.name = 'campus-path-curb'; curb.position.set(x, .07, 0); curb.castShadow = true; curb.receiveShadow = true; scene.add(curb);
  });
  CAMPUS_COMPOSITION.horizon.mountains.forEach(([z, color, scale]) => createMountainLayer(scene, z, color, scale));
  CAMPUS_COMPOSITION.horizon.clouds.forEach(([x, y, z, scale]) => createCloudLayer(scene, x, y, z, scale));
  loadLandscape?.(LANDSCAPE_PLACEMENTS);
}
