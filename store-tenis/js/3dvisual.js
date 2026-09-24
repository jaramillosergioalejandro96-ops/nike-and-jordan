(function () {
  const holder = document.getElementById('canvas-holder');

  // Ruta de tu imagen fija. Cámbiala por la tuya, p. ej. 'assets/mi-imagen.jpg'
const DEFAULT_IMAGE_SRC = 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&q=80';
  // Cómo se monta la imagen en 3D: 'plane', 'box', 'cylinder' o 'curve'
  const SHAPE_MODE = 'plane';

  // --- Escena base ---
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, holder.clientWidth / holder.clientHeight, 0.1, 100);
  camera.position.set(0, 0, 6);

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(holder.clientWidth, holder.clientHeight);
  holder.appendChild(renderer.domElement);

  scene.add(new THREE.AmbientLight(0xffffff, 0.7));
  const key = new THREE.DirectionalLight(0x8ea2ff, 0.9);
  key.position.set(4, 5, 6);
  scene.add(key);
  const rim = new THREE.DirectionalLight(0xff8ce0, 0.5);
  rim.position.set(-5, -3, -4);
  scene.add(rim);

  const pivot = new THREE.Group();
  scene.add(pivot);

  let mesh = null;
  let currentTexture = null;
  let currentMode = SHAPE_MODE;

  // --- Geometrías según el modo elegido ---
  function buildGeometry(mode, aspect) {
    switch (mode) {
      case 'box': {
        const s = 2;
        return new THREE.BoxGeometry(s, s / aspect, s * 0.15);
      }
      case 'cylinder':
        return new THREE.CylinderGeometry(1.6, 1.6, 1.6 / aspect, 64, 1, true);
      case 'curve': {
        const geo = new THREE.PlaneGeometry(3, 3 / aspect, 40, 1);
        const pos = geo.attributes.position;
        for (let i = 0; i < pos.count; i++) {
          const x = pos.getX(i);
          const z = -Math.pow(x / 1.5, 2) * 0.6;
          pos.setZ(i, z);
        }
        geo.computeVertexNormals();
        return geo;
      }
      case 'plane':
      default:
        return new THREE.PlaneGeometry(3, 3 / aspect);
    }
  }

  function buildMaterial(mode, texture) {
    if (mode === 'box') {
      const side = new THREE.MeshStandardMaterial({ color: 0x2a2d45, metalness: 0.2, roughness: 0.6 });
      const front = new THREE.MeshStandardMaterial({ map: texture, metalness: 0.1, roughness: 0.5 });
      // Orden de caras en THREE.BoxGeometry: +x,-x,+y,-y,+z,-z -> ponemos la imagen en +z (frontal)
      return [side, side, side, side, front, side];
    }
    return new THREE.MeshStandardMaterial({
      map: texture,
      side: THREE.DoubleSide,
      metalness: 0.05,
      roughness: 0.6
    });
  }

  function rebuildMesh() {
    if (!currentTexture) return;
    if (mesh) {
      pivot.remove(mesh);
      mesh.geometry.dispose();
    }
    const img = currentTexture.image;
    const aspect = (img.width / img.height) || 1;
    const geo = buildGeometry(currentMode, aspect);
    const mat = buildMaterial(currentMode, currentTexture);
    mesh = new THREE.Mesh(geo, mat);
    pivot.add(mesh);
  }

  function loadImage(src) {
    const loader = new THREE.TextureLoader();
    loader.load(
      src,
      (texture) => {
        currentTexture = texture;
        rebuildMesh();
        zoom = 6; rotX = 0.15; rotY = 0.3;
      },
      undefined,
      () => {
        // Si la imagen por defecto no existe, se genera un placeholder para no dejar la escena vacía.
        loadImage(generatePlaceholderDataUrl());
      }
    );
  }

  function generatePlaceholderDataUrl() {
    const c = document.createElement('canvas');
    c.width = 512; c.height = 512;
    const ctx = c.getContext('2d');
    const grad = ctx.createLinearGradient(0, 0, 512, 512);
    grad.addColorStop(0, '#7c8cff');
    grad.addColorStop(1, '#ff7ce0');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 512, 512);
    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    ctx.font = 'bold 32px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Reemplaza esta imagen', 256, 256);
    return c.toDataURL();
  }

  // Carga automática al iniciar: no se le pide nada al usuario.
  loadImage(DEFAULT_IMAGE_SRC);

  // Suelo de referencia sutil
  const grid = new THREE.GridHelper(10, 20, 0x555577, 0x33334a);
  grid.position.y = -2.6;
  grid.material.transparent = true;
  grid.material.opacity = 0.2;
  scene.add(grid);

  // --- Arrastre para rotar ---
  let isDragging = false;
  let prevX = 0, prevY = 0;
  let rotX = 0.15, rotY = 0.3;
  let autoRotate = true;
  let velX = 0, velY = 0;

  function pointerDown(x, y) {
    isDragging = true;
    autoRotate = false;
    prevX = x; prevY = y;
    holder.classList.add('dragging');
  }
  function pointerMove(x, y) {
    if (!isDragging) return;
    const dx = x - prevX;
    const dy = y - prevY;
    velY = dx * 0.005;
    velX = dy * 0.005;
    rotY += velY;
    rotX += velX;
    prevX = x; prevY = y;
  }
  function pointerUp() {
    isDragging = false;
    holder.classList.remove('dragging');
  }

  holder.addEventListener('mousedown', (e) => pointerDown(e.clientX, e.clientY));
  window.addEventListener('mousemove', (e) => pointerMove(e.clientX, e.clientY));
  window.addEventListener('mouseup', pointerUp);

  holder.addEventListener('touchstart', (e) => {
    if (e.touches.length === 1) pointerDown(e.touches[0].clientX, e.touches[0].clientY);
  }, { passive: true });
  holder.addEventListener('touchmove', (e) => {
    if (e.touches.length === 1) {
      pointerMove(e.touches[0].clientX, e.touches[0].clientY);
    } else if (e.touches.length === 2) {
      handlePinch(e);
    }
  }, { passive: true });
  holder.addEventListener('touchend', () => { pointerUp(); lastPinchDist = null; });

  // --- Zoom con rueda ---
  let zoom = 6;
  const minZoom = 2, maxZoom = 14;
  holder.addEventListener('wheel', (e) => {
    e.preventDefault();
    zoom += e.deltaY * 0.01;
    zoom = Math.max(minZoom, Math.min(maxZoom, zoom));
  }, { passive: false });

  // --- Pellizco (pinch) para zoom en móvil ---
  let lastPinchDist = null;
  function handlePinch(e) {
    const dx = e.touches[0].clientX - e.touches[1].clientX;
    const dy = e.touches[0].clientY - e.touches[1].clientY;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (lastPinchDist !== null) {
      const delta = lastPinchDist - dist;
      zoom += delta * 0.02;
      zoom = Math.max(minZoom, Math.min(maxZoom, zoom));
    }
    lastPinchDist = dist;
  }

  document.getElementById('zoomIn').addEventListener('click', () => { zoom = Math.max(minZoom, zoom - 0.8); });
  document.getElementById('zoomOut').addEventListener('click', () => { zoom = Math.min(maxZoom, zoom + 0.8); });

  // --- Resize ---
  window.addEventListener('resize', () => {
    camera.aspect = holder.clientWidth / holder.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(holder.clientWidth, holder.clientHeight);
  });

  // --- Loop de render ---
  function animate() {
    requestAnimationFrame(animate);

    if (autoRotate) {
      rotY += 0.006;
    } else if (!isDragging) {
      velX *= 0.92; velY *= 0.92;
      rotX += velX; rotY += velY;
    }

    pivot.rotation.x = rotX;
    pivot.rotation.y = rotY;

    camera.position.z += (zoom - camera.position.z) * 0.12;
    camera.lookAt(0, 0, 0);

    renderer.render(scene, camera);
  }
  animate();
})();