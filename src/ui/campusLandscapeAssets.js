function disposeDecodedLandscape(scene) {
  const textures = new Set();
  scene.traverse((child) => {
    child.geometry?.dispose();
    (Array.isArray(child.material) ? child.material : [child.material]).filter(Boolean).forEach((material) => {
      ['map', 'bumpMap', 'emissiveMap', 'roughnessMap', 'metalnessMap', 'alphaMap'].forEach((key) => { if (material[key]) textures.add(material[key]); });
      material.dispose();
    });
  });
  textures.forEach((texture) => texture.dispose());
}

export function loadLocalLandscapeModels({ scene, loader, isActive = () => true, placements }) {
  const failedFiles = [];
  Object.entries(placements).forEach(([filename, positions]) => {
    loader.load(`/assets/campus/${filename}`, (gltf) => {
      if (!isActive()) { disposeDecodedLandscape(gltf.scene); return; }
      gltf.scene.traverse((child) => { if (child.isMesh) { child.castShadow = true; child.receiveShadow = true; } });
      positions.forEach(([x, z, scale], index) => { const instance = gltf.scene.clone(true); instance.name = `local-landscape-${filename}-${index}`; instance.position.set(x, 0, z); instance.scale.setScalar(scale); scene.add(instance); });
    }, undefined, () => { failedFiles.push(filename); });
  });
  return { failedFiles };
}
