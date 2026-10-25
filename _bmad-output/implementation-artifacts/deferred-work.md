- source_spec: `/Users/imrane/Desktop/Code/medgame/_bmad-output/implementation-artifacts/spec-nursing-consultation-clarity.md`
  summary: Add a DOM-level automated Nursing consultation test once the project adopts a browser or DOM test runtime.
  evidence: The primary rail and shared-modal interaction is currently covered by manual local-browser verification and source contracts, but the Node test suite has no DOM runtime to execute the interaction automatically.
- source_spec: `/Users/imrane/Desktop/Code/medgame/_bmad-output/implementation-artifacts/spec-nursing-consultation-polish.md`
  summary: Add a DOM-level automated Nursing hypothesis interaction test once the project adopts a browser or DOM test runtime.
  evidence: Source contracts cannot exercise short-click, completed-hold, movement, capture-loss, blur, and synthetic-click outcomes; a DOM test harness would settle these behaviors.
- source_spec: `/Users/imrane/Desktop/Code/medgame/_bmad-output/implementation-artifacts/spec-nursing-consultation-polish.md`
  summary: Add rendered debrief tests once the project adopts a browser or DOM test runtime.
  evidence: The Node suite currently validates result markup by source contract, so a DOM harness is needed to verify rendered Nursing and Dietetics result states and route handlers.
- source_spec: `/Users/imrane/Desktop/Code/medgame/_bmad-output/implementation-artifacts/spec-controlled-3d-medical-garden.md`
  summary: Add a browser or DOM-level test that mounts the 3D campus and observes WebGL initialization and fallback.
  evidence: The Node suite has no DOM/WebGL runtime; current executable tests cover scene data, lifecycle, doors, local-loader disposal, and source contracts, while a browser harness would settle rendered-canvas behavior.
