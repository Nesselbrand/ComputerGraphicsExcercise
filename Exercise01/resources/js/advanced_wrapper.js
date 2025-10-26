function waitForGlobalFunction(name, timeout = 3000) {
  return new Promise((resolve, reject) => {
    const interval = 50;
    let waited = 0;
    const check = () => {
      if (typeof window[name] === 'function') {
        resolve(window[name]);
      } else if (waited >= timeout) {
        reject(new Error(`${name} not found on window.`));
      } else {
        waited += interval;
        setTimeout(check, interval);
      }
    };
    check();
  });
}

async function testCallbackImplementation(canvas, start, end, split=false, testEnd=false) {
  const setupMandelbrot = await waitForGlobalFunction('setupMandelbrot');
  const startMoveCanvas = await waitForGlobalFunction('startMoveCanvas');
  const updateMoveCanvas = await waitForGlobalFunction('updateMoveCanvas');
  const endMoveCanvas = await waitForGlobalFunction('endMoveCanvas');
  setupMandelbrot(canvas);
  startMoveCanvas(canvas.id, start.x, start.y);
  if (split) {
    updateMoveCanvas(canvas.id, end.x/2, end.y/2);
  }
  updateMoveCanvas(canvas.id, end.x, end.y);
  endMoveCanvas(canvas.id);
  if (testEnd) {
      updateMoveCanvas(canvas.id, 2*end.x, 2*end.y);
  }
}