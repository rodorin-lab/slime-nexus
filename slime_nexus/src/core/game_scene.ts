import * as THREE from 'three';

export class GameScene {
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  renderer: THREE.WebGLRenderer;
  clock: THREE.Clock;

  constructor(canvas: HTMLCanvasElement) {
    this.clock = new THREE.Clock();
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x050510);
    this.scene.fog = new THREE.FogExp2(0x050510, 0.015);

    this.camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.camera.position.set(0, 3, 10);
    this.camera.lookAt(0, 1.5, 0);

    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: false,
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.2;

    this.setupLighting();
    this.createEnvironment();

    window.addEventListener('resize', this.onResize.bind(this));
  }

  private setupLighting(): void {
    const ambientLight = new THREE.AmbientLight(0x404060, 0.8);
    this.scene.add(ambientLight);

    const hemiLight = new THREE.HemisphereLight(0x00f3ff, 0x000000, 0.4);
    this.scene.add(hemiLight);

    const mainLight = new THREE.DirectionalLight(0xffffff, 1.5);
    mainLight.position.set(5, 15, 10);
    mainLight.castShadow = true;
    mainLight.shadow.mapSize.width = 2048;
    mainLight.shadow.mapSize.height = 2048;
    this.scene.add(mainLight);

    const neonCyan = new THREE.PointLight(0x00f3ff, 10, 20);
    neonCyan.position.set(-4, 4, 2);
    this.scene.add(neonCyan);

    const neonMagenta = new THREE.PointLight(0xff00ff, 10, 20);
    neonMagenta.position.set(4, 4, 2);
    this.scene.add(neonMagenta);

    const neonYellow = new THREE.PointLight(0xffff00, 5, 15);
    neonYellow.position.set(0, 6, -5);
    this.scene.add(neonYellow);
  }

  private createEnvironment(): void {
    const groundGeometry = new THREE.PlaneGeometry(60, 60);
    const groundMaterial = new THREE.MeshStandardMaterial({
      color: 0x111122,
      roughness: 0.2,
      metalness: 0.8,
    });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    this.scene.add(ground);

    const buildingGeo = new THREE.BoxGeometry(1, 1, 1);
    
    for (let i = 0; i < 20; i++) {
      const height = 5 + Math.random() * 15;
      const width = 2 + Math.random() * 3;
      const depth = 2 + Math.random() * 3;
      
      const buildingMat = new THREE.MeshStandardMaterial({
        color: 0x1a1a2a,
        roughness: 0.7,
        metalness: 0.3,
      });
      
      const building = new THREE.Mesh(buildingGeo, buildingMat);
      building.scale.set(width, height, depth);
      building.position.set(
        (Math.random() - 0.5) * 50,
        height / 2,
        -5 - Math.random() * 30
      );
      building.castShadow = true;
      building.receiveShadow = true;
      this.scene.add(building);

      if (Math.random() > 0.5) {
        const windowGeo = new THREE.PlaneGeometry(width * 0.8, height * 0.8);
        const windowMat = new THREE.MeshBasicMaterial({
          color: Math.random() > 0.5 ? 0x00f3ff : 0xff00ff,
          transparent: true,
          opacity: 0.3 + Math.random() * 0.4,
        });
        const windows = new THREE.Mesh(windowGeo, windowMat);
        windows.position.copy(building.position);
        windows.position.z += depth / 2 + 0.1;
        this.scene.add(windows);
      }
    }

    const signGeo = new THREE.BoxGeometry(3, 0.5, 0.2);
    const signMat = new THREE.MeshBasicMaterial({ color: 0xff00ff });
    const sign = new THREE.Mesh(signGeo, signMat);
    sign.position.set(-6, 5, -8);
    this.scene.add(sign);

    const sign2Mat = new THREE.MeshBasicMaterial({ color: 0x00f3ff });
    const sign2 = new THREE.Mesh(signGeo, sign2Mat);
    sign2.position.set(6, 4, -12);
    this.scene.add(sign2);
  }

  private onResize(): void {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  update(): void {
    this.renderer.render(this.scene, this.camera);
  }
}
