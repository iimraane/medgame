export const CAMPUS_DESKTOP_MIN_WIDTH = 1024;

export function canInitializeCampus(viewportWidth) {
  return viewportWidth >= CAMPUS_DESKTOP_MIN_WIDTH;
}

export function resolveCampusSelection(roleId, getDoorAction, previewOpen = false) {
  if (previewOpen) return { kind: 'ignore' };
  const action = getDoorAction(roleId);
  return action.roleId ? { kind: 'levels', roleId: action.roleId } : { kind: 'preview', feedback: action.feedback };
}

export function shouldExitCampusOnEscape(previewOpen, key) {
  return key === 'Escape' && !previewOpen;
}

export function createCampusLifecycle(setTimer, clearTimer) {
  let loadingTimer = null;
  let disposeScene = () => {};
  return {
    scheduleLoading(callback, delay) {
      if (loadingTimer !== null) clearTimer(loadingTimer);
      loadingTimer = setTimer(() => { loadingTimer = null; callback(); }, delay);
    },
    setSceneDisposer(dispose) { disposeScene = dispose; },
    dispose() {
      if (loadingTimer !== null) clearTimer(loadingTimer);
      loadingTimer = null;
      disposeScene();
      disposeScene = () => {};
    },
  };
}
