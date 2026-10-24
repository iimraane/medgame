import * as THREE from 'three';

export function addBox(group, size, position, material) { const mesh = new THREE.Mesh(new THREE.BoxGeometry(...size), material); mesh.position.set(...position); mesh.castShadow = true; mesh.receiveShadow = true; group.add(mesh); return mesh; }
function addGableRoof(group, width, depth, roofHeight, position, material) {
  const shape = new THREE.Shape(); shape.moveTo(-width / 2, 0); shape.lineTo(0, roofHeight); shape.lineTo(width / 2, 0); shape.lineTo(-width / 2, 0);
  const roof = new THREE.Mesh(new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: false }), material); roof.position.set(position[0], position[1], position[2] - depth / 2); roof.castShadow = true; roof.receiveShadow = true; group.add(roof); return roof;
}

function addCampusSign(building, role, width, height, depth, signTextureFactory) {
  const sign = new THREE.Mesh(new THREE.PlaneGeometry(Math.max(2.55, width * .95), .5), new THREE.MeshBasicMaterial({ map: signTextureFactory(role) }));
  sign.name = 'campus-profession-sign'; sign.position.set(0, Math.min(height - .55, 2.85), depth / 2 + .17); building.add(sign); return sign;
}

function addArcadePortal(building, accentColor, depth) {
  const portal = new THREE.Group(); portal.name = 'playable-door-portal';
  const glowMaterial = new THREE.MeshStandardMaterial({ color: accentColor, emissive: accentColor, emissiveIntensity: 1.45, roughness: .18, metalness: .55 });
  const frameMaterial = new THREE.MeshStandardMaterial({ color: accentColor.clone().lerp(new THREE.Color(0xffffff), .32), emissive: accentColor, emissiveIntensity: 1.05, roughness: .24, metalness: .7 });
  const ring = new THREE.Mesh(new THREE.TorusGeometry(.92, .075, 10, 40), glowMaterial); ring.name = 'arcade-floor-ring'; ring.rotation.x = -Math.PI / 2; ring.position.set(0, .09, depth / 2 + .73); portal.add(ring);
  [-.64, .64].forEach((x) => addBox(portal, [.11, 2.16, .1], [x, 1.12, depth / 2 + .25], frameMaterial));
  addBox(portal, [1.38, .11, .1], [0, 2.18, depth / 2 + .25], frameMaterial);
  const chevrons = new THREE.Group(); chevrons.name = 'arcade-floating-chevrons';
  [-.3, 0, .3].forEach((x, index) => { const diamond = new THREE.Mesh(new THREE.OctahedronGeometry(.13, 0), glowMaterial); diamond.position.set(x, 2.55 + (index % 2) * .14, depth / 2 + .3); diamond.rotation.z = Math.PI / 4; chevrons.add(diamond); });
  portal.add(chevrons);
  const trim = new THREE.Mesh(new THREE.BoxGeometry(1.18, .055, .11), frameMaterial); trim.name = 'arcade-emissive-trim'; trim.position.set(0, .18, depth / 2 + .24); portal.add(trim);
  const light = new THREE.PointLight(accentColor, 2.2, 5.7); light.name = 'arcade-targeted-light'; light.position.set(0, 1.45, depth / 2 + .88); portal.add(light);
  building.add(portal);
  return { portal, chevrons, materials: [glowMaterial, frameMaterial], light };
}

export function createCampusBuildings(roles, signTextureFactory, atlas = null) {
  const scene = new THREE.Scene(); const doors = []; const buildings = [];
  roles.forEach((role) => {
    const { position, footprint, accent, doorId } = role.campus; const [width, height, depth] = footprint;
    const building = new THREE.Group(); building.name = `campus-house-${role.id}`; building.position.set(...position); const accentColor = new THREE.Color(accent);
    const concrete = new THREE.MeshStandardMaterial({ color: 0xd7d2c4, roughness: .77, metalness: .12, bumpMap: atlas, bumpScale: .075 });
    const roofMaterial = new THREE.MeshStandardMaterial({ color: 0x26363a, map: atlas, roughness: .72, metalness: .16 });
    const windowMaterial = new THREE.MeshStandardMaterial({ color: 0xffe6a1, emissive: 0x8f5d24, emissiveIntensity: .42, roughness: .42, metalness: .08 });
    const porchMaterial = new THREE.MeshStandardMaterial({ color: 0x806a55, map: atlas, roughness: .82, metalness: .06 });
    const wall = addBox(building, [width, height, depth], [0, height / 2, 0], concrete); wall.name = 'campus-house-wall'; const roof = addGableRoof(building, width + .22, depth + .18, .82, [0, height, 0], roofMaterial); roof.name = 'campus-house-roof'; addBox(building, [width * .54, .16, .72], [0, .08, depth / 2 + .34], porchMaterial);
    [-.27, .27].forEach((x) => { const window = addBox(building, [width * .18, .48, .06], [x * width, 1.47, depth / 2 + .04], windowMaterial); window.name = 'campus-house-window'; }); for (let column = -1; column <= 1; column += 2) { const window = addBox(building, [width * .18, .48, .06], [column * width * .29, 2.45, depth / 2 + .04], windowMaterial); window.name = 'campus-house-window'; }
    const doorMaterial = new THREE.MeshStandardMaterial({ color: role.unlocked ? accentColor : 0x33464b, emissive: role.unlocked ? accentColor : 0x000000, emissiveIntensity: role.unlocked ? .75 : 0, roughness: .35, metalness: .32 });
    const door = addBox(building, [Math.min(width * .31, 1.25), 1.75, .13], [0, .88, depth / 2 + .12], doorMaterial); const portal = role.unlocked ? addArcadePortal(building, accentColor, depth) : null;
    const sign = addCampusSign(building, role, width, height, depth, signTextureFactory); door.name = doorId; door.userData = { roleId: role.id, doorMaterial, sign, portal, baseEmissive: doorMaterial.emissiveIntensity }; doors.push(door); buildings.push(building); scene.add(building);
  });
  return { scene, doors, buildings };
}

export function setArcadePortalHighlight(door, focused) { const portal = door.userData.portal; if (!portal) return; portal.materials.forEach((material) => { material.emissiveIntensity = focused ? 2.6 : 1.2; }); portal.light.intensity = focused ? 3.5 : 2.2; portal.portal.scale.setScalar(focused ? 1.09 : 1); }
export function animateArcadePortals(doors, time, reducedMotion) { if (reducedMotion) return; doors.forEach((door, index) => { const portal = door.userData.portal; if (portal) { portal.chevrons.position.y = Math.sin(time / 520 + index) * .1; portal.portal.rotation.y = Math.sin(time / 1100 + index) * .025; } }); }
