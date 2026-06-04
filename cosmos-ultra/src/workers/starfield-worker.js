function createStars(width, height, density) {
  const colors = ["#ffffff", "#dff7ff", "#ffe7a0", "#ffb4a2"];

  return Array.from({ length: density }, (_, index) => {
    const layer = index % 4;

    return {
      x: Math.random() * width,
      y: Math.random() * height,
      size: [0.35, 0.7, 1.05, 1.6][layer] * (0.8 + Math.random() * 0.8),
      opacity: [0.35, 0.5, 0.65, 0.8][layer] + Math.random() * 0.2,
      depth: [0.008, 0.02, 0.05, 0.1][layer],
      phase: Math.random() * Math.PI * 2,
      color: colors[Math.floor(Math.random() * colors.length)]
    };
  });
}

self.addEventListener("message", (event) => {
  const { width, height, density } = event.data || {};

  self.postMessage({
    stars: createStars(width || 1920, height || 1080, density || 1500)
  });
});
