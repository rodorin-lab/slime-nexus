import * as THREE from 'three';
import { SlimeInstance } from '../types/game';

export class SlimeEntity {
  mesh: THREE.Mesh;
  coreLight: THREE.PointLight;
  slimeData: SlimeInstance;
  wobbleTime: number = 0;
  wobbleIntensity: number = 0.5;

  constructor(slimeData: SlimeInstance) {
    this.slimeData = slimeData;

    const geometry = new THREE.SphereGeometry(1.2, 64, 64);
    const material = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(slimeData.definition.spriteColor),
      roughness: 0.1,
      metalness: 0.1,
      transmission: 0.9,
      thickness: 1.5,
      ior: 1.5,
      transparent: true,
      opacity: 0.95,
      clearcoat: 1.0,
      clearcoatRoughness: 0.1,
    });

    this.mesh = new THREE.Mesh(geometry, material);
    this.mesh.position.set(0, 1.2, 0);
    this.mesh.castShadow = true;
    this.mesh.scale.set(1, 0.7, 1);

    this.coreLight = new THREE.PointLight(slimeData.definition.spriteColor, 5, 5);
    this.mesh.add(this.coreLight);

    const coreGeo = new THREE.SphereGeometry(0.3, 16, 16);
    const coreMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const core = new THREE.Mesh(coreGeo, coreMat);
    core.position.y = 0.2;
    this.mesh.add(core);
  }

  update(delta: number): void {
    this.wobbleTime += delta * 4;
    const wobbleX = Math.sin(this.wobbleTime) * this.wobbleIntensity;
    const wobbleZ = Math.cos(this.wobbleTime * 0.7) * this.wobbleIntensity;
    
    this.mesh.scale.set(
      1 + wobbleX * 0.15,
      0.7 - Math.abs(wobbleX) * 0.1,
      1 + wobbleZ * 0.15
    );
    
    this.mesh.rotation.y += delta * 0.8;
    this.coreLight.intensity = 5 + Math.sin(this.wobbleTime * 2) * 2;
  }

  setWobbleIntensity(intensity: number): void {
    this.wobbleIntensity = intensity;
  }

  setPosition(x: number, y: number, z: number): void {
    this.mesh.position.set(x, y, z);
  }
}
