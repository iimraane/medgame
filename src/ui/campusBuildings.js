import * as THREE from 'three';

export function addBox(group, size, position, material) { const mesh = new THREE.Mesh(new THREE.BoxGeometry(...size), material); mesh.position.set(...position); mesh.castShadow = true; mesh.receiveShadow = true; group.add(mesh); return mesh; }
function addGableRoof(group, width, depth, roofHeight, position, material) {
  const shape = new THREE.Shape(); shape.moveTo(-width / 2, 0); shape.lineTo(0, roofHeight); shape.lineTo(width / 2, 0); shape.lineTo(-width / 2, 0);
  const roof = new THREE.Mesh(new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: false }), material); roof.position.set(position[0], position[1], position[2] - depth / 2); roof.castShadow = true; roof.receiveShadow = true; group.add(roof); return roof;
}

function addRoofTiles(building, width, depth, wallHeight, roofHeight, material) {
  const slope = Math.atan2(roofHeight, width / 2);
  const rows = 7;
  [-1, 1].forEach((side) => {
    for (let row = 0; row < rows; row += 1) {
      const run = ((row + .5) / rows) * (width / 2);
      const surfaceY = wallHeight + roofHeight - run * (roofHeight / (width / 2));
      const tile = addBox(building, [width / (rows * 2) + .035, .055, depth + .28], [side * run, surfaceY, 0], material);
      tile.name = 'campus-roof-tile';
      tile.rotation.z = -side * slope;
    }
  });
}

function addCampusSign(building, role, width, height, depth, signTextureFactory) {
  const sign = new THREE.Mesh(new THREE.PlaneGeometry(Math.max(2.55, width * .95), .5), new THREE.MeshBasicMaterial({ map: signTextureFactory(role) }));
  sign.name = 'campus-profession-sign'; sign.position.set(0, Math.min(height - .55, 2.85), depth / 2 + .17); building.add(sign); return sign;
}

function addWindowMuntins(building, x, y, width, depth, material) {
  [-.11, .11].forEach((offset) => { const muntin = addBox(building, [.025, .58, .075], [x + offset * width * .18, y, depth / 2 + .075], material); muntin.name = 'campus-house-window-muntin'; });
  const crossbar = addBox(building, [width * .21, .025, .075], [x, y, depth / 2 + .075], material); crossbar.name = 'campus-house-window-muntin';
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
    const concrete = new THREE.MeshStandardMaterial({ color: 0xd5c7b2, roughness: .88, metalness: .03, bumpMap: atlas, bumpScale: .075 });
    const stone = new THREE.MeshStandardMaterial({ color: 0xa9987d, map: atlas, roughness: .94 });
    const roofMaterial = new THREE.MeshStandardMaterial({ color: 0x273439, map: atlas, roughness: .78, metalness: .1 });
    const roofTileMaterial = new THREE.MeshStandardMaterial({ color: 0x172328, roughness: .82, metalness: .08 });
    const windowMaterial = new THREE.MeshStandardMaterial({ color: 0xffedbd, emissive: 0xc47832, emissiveIntensity: .55, roughness: .28, metalness: .16 });
    const timber = new THREE.MeshStandardMaterial({ color: 0x745039, roughness: .8, metalness: .02 }); const trimMaterial = new THREE.MeshStandardMaterial({ color: 0xf6edda, roughness: .64 }); const roofDetailMaterial = new THREE.MeshStandardMaterial({ color: 0x1c2a2f, roughness: .68, metalness: .18 });
    const wall = addBox(building, [width, height, depth], [0, height / 2, 0], concrete); wall.name = 'campus-house-wall';
    const roof = addGableRoof(building, width + .22, depth + .18, .82, [0, height, 0], roofMaterial); roof.name = 'campus-house-roof';
    addRoofTiles(building, width + .22, depth + .18, height, .82, roofTileMaterial);
    const roofWidth = width + .22; const roofSlope = Math.atan2(.82, roofWidth / 2); [-1, 1].forEach((side) => { const batten = addBox(building, [roofWidth * .49, .045, depth + .23], [side * roofWidth * .245, height + .41, 0], roofDetailMaterial); batten.rotation.z = -side * roofSlope; });
    const soffit = addBox(building, [width + .24, .17, depth + .24], [0, height - .08, 0], timber); soffit.name = 'campus-timber-soffit';
    addBox(building, [width * .66, .13, .84], [0, .07, depth / 2 + .42], timber).name = 'campus-entry-step';
    addBox(building, [width * .54, .12, .62], [0, .19, depth / 2 + .56], trimMaterial).name = 'campus-entry-step';
    [-1, 1].forEach((side) => {
      const pier = addBox(building, [.34, 2.55, .28], [side * width * .265, 1.27, depth / 2 + .12], stone); pier.name = 'campus-stone-pier';
      const post = addBox(building, [.12, 1.2, .13], [side * width * .21, .72, depth / 2 + .58], timber); post.name = 'campus-timber-entry-post';
      addBox(building, [.13, height * .9, .08], [side * (width / 2 + .02), height * .49, depth / 2 + .045], trimMaterial);
    });
    [-.27, .27].forEach((x) => { const window = addBox(building, [width * .18, .48, .06], [x * width, 1.47, depth / 2 + .04], windowMaterial); window.name = 'campus-house-window'; addWindowMuntins(building, x * width, 1.47, width, depth, trimMaterial); }); for (let column = -1; column <= 1; column += 2) { const window = addBox(building, [width * .18, .48, .06], [column * width * .29, 2.45, depth / 2 + .04], windowMaterial); window.name = 'campus-house-window'; addWindowMuntins(building, column * width * .29, 2.45, width, depth, trimMaterial); }
    const doorMaterial = new THREE.MeshStandardMaterial({ color: role.unlocked ? accentColor.clone().lerp(new THREE.Color(0xffffff), .2) : 0x33464b, emissive: role.unlocked ? accentColor : 0x000000, emissiveIntensity: role.unlocked ? .88 : 0, roughness: .16, metalness: .18, transparent: true, opacity: .76 });
    const doorFrame = addBox(building, [Math.min(width * .39, 1.5), 2.12, .12], [0, 1.06, depth / 2 + .1], timber); doorFrame.name = 'campus-glazed-entry-frame';
    const door = addBox(building, [Math.min(width * .31, 1.25), 1.8, .14], [0, .91, depth / 2 + .18], doorMaterial); door.name = doorId;
    [-.31, .31].forEach((x) => { const mullion = addBox(building, [.045, 1.72, .06], [x, .94, depth / 2 + .27], trimMaterial); mullion.name = 'campus-entry-mullion'; });
    addBox(building, [Math.min(width * .31, 1.2), .05, .16], [0, 1.39, depth / 2 + .27], trimMaterial).name = 'campus-entry-transom';
    [-1, 1].forEach((side) => { const sconce = new THREE.Mesh(new THREE.SphereGeometry(.09, 10, 8), new THREE.MeshStandardMaterial({ color: 0xffe3a0, emissive: 0xffa43d, emissiveIntensity: .9, roughness: .32 })); sconce.name = 'campus-entry-sconce'; sconce.position.set(side * .83, 1.74, depth / 2 + .3); building.add(sconce); const light = new THREE.PointLight(0xffba61, .45, 2.1); light.name = 'campus-entry-sconce-light'; light.position.copy(sconce.position); building.add(light); });
    const portal = role.unlocked ? addArcadePortal(building, accentColor, depth) : null;
    const sign = addCampusSign(building, role, width, height, depth, signTextureFactory); door.userData = { roleId: role.id, doorMaterial, sign, portal, baseEmissive: doorMaterial.emissiveIntensity }; doors.push(door); buildings.push(building); scene.add(building);
  });
  return { scene, doors, buildings };
}

export function setArcadePortalHighlight(door, focused) { const portal = door.userData.portal; if (!portal) return; portal.materials.forEach((material) => { material.emissiveIntensity = focused ? 2.6 : 1.2; }); portal.light.intensity = focused ? 3.5 : 2.2; portal.portal.scale.setScalar(focused ? 1.09 : 1); }
export function animateArcadePortals(doors, time, reducedMotion) { if (reducedMotion) return; doors.forEach((door, index) => { const portal = door.userData.portal; if (portal) { portal.chevrons.position.y = Math.sin(time / 520 + index) * .1; portal.portal.rotation.y = Math.sin(time / 1100 + index) * .025; } }); }
