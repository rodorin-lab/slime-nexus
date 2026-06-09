import * as THREE from 'three';

export class RainSystem {
  particles: THREE.Points;
  material: THREE.PointsMaterial;
  geometry: THREE.BufferGeometry;
  count: number = 8000;
  velocity: number = 20;

  constructor() {
    this.geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(this.count * 3);
    const colors = new Float32Array(this.count * 3);

    for (let i = 0; i < this.count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 50;
      positions[i * 3 + 1] = Math.random() * 30;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 50;
      
      const colorChoice = Math.random();
      if (colorChoice > 0.9) {
        colors[i * 3] = 0; colors[i * 3 + 1] = 0.95; colors[i * 3 + 2] = 1;
      } else if (colorChoice > 0.8) {
        colors[i * 3] = 1; colors[i * 3 + 1] = 0; colors[i * 3 + 2] = 1;
      } else {
        colors[i * 3] = 0.5; colors[i * 3 + 1] = 0.5; colors[i * 3 + 2] = 0.8;
      }
    }

    this.geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    this.geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    this.material = new THREE.PointsMaterial({
      size: 0.08,
      transparent: true,
      opacity: 0.8,
      vertexColors: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    this.particles = new THREE.Points(this.geometry, this.material);
  }

  update(delta: number): void {
    const positions = this.geometry.attributes.position.array as Float32Array;
    
    for (let i = 0; i < this.count; i++) {
      positions[i * 3 + 1] -= this.velocity * delta;
      
      if (positions[i * 3 + 1] < 0) {
        positions[i * 3 + 1] = 30;
        positions[i * 3] = (Math.random() - 0.5) * 50;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 50;
      }
    }
    
    this.geometry.attributes.position.needsUpdate = true;
  }
}

export class SparkleSystem {
  particles: THREE.Points;
  material: THREE.PointsMaterial;
  geometry: THREE.BufferGeometry;
  count: number = 200;

  constructor() {
    this.geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(this.count * 3);
    const colors = new Float32Array(this.count * 3);

    for (let i = 0; i < this.count; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI;
      const r = 2 + Math.random() * 2;
      
      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.cos(phi) + 1;
      positions[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);
      
      colors[i * 3] = 1; colors[i * 3 + 1] = 1; colors[i * 3 + 2] = 1;
    }

    this.geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    this.geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    this.material = new THREE.PointsMaterial({
      size: 0.15,
      transparent: true,
      opacity: 0.9,
      vertexColors: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    this.particles = new THREE.Points(this.geometry, this.material);
  }

  update(delta: number): void {
    const positions = this.geometry.attributes.position.array as Float32Array;
    
    for (let i = 0; i < this.count; i++) {
      positions[i * 3 + 1] += Math.sin(Date.now() * 0.001 + i) * 0.01;
      positions[i * 3] += Math.cos(Date.now() * 0.0005 + i) * 0.01;
    }
    
    this.geometry.attributes.position.needsUpdate = true;
  }
}
