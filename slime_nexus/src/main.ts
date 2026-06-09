import { GameScene } from './core/game_scene';
import { gameState } from './core/game_state';
import { eventBus } from './core/event_bus';
import { audioManager } from './core/audio_manager';
import { SlimeEntity } from './entities/slime_entity';
import { RainSystem, SparkleSystem } from './systems/rain_system';
import { raisingCalculator } from './systems/raising_calculator';
import { evolutionSystem } from './systems/evolution_system';
import { battleCalculator } from './systems/battle_calculator';
import { slimeDefinitions } from './entities/slime_data';
import { SlimeInstance, SceneType, BattleResult } from './types/game';

class Game {
  scene: GameScene;
  rainSystem: RainSystem;
  sparkleSystem: SparkleSystem;
  slimeEntity: SlimeEntity | null = null;
  isRunning: boolean = false;

  constructor() {
    const canvas = document.getElementById('game-canvas') as HTMLCanvasElement;
    this.scene = new GameScene(canvas);
    
    this.rainSystem = new RainSystem();
    this.scene.scene.add(this.rainSystem.particles);
    
    this.sparkleSystem = new SparkleSystem();
    this.scene.scene.add(this.sparkleSystem.particles);

    this.setupUI();
    this.loadInitialSlime();
    this.updateUI();

    document.addEventListener('click', () => audioManager.resume(), { once: true });
  }

  private loadInitialSlime(): void {
    if (gameState.getSlimes().length === 0) {
      const protoDef = slimeDefinitions['proto_slime'];
      const initialSlime: SlimeInstance = {
        definition: protoDef,
        nickname: 'Proto-001',
        level: 1,
        currentStats: { ...protoDef.baseStats },
        stress: 0.2,
        affection: 0.5,
        battleCount: 0,
        ageDays: 0,
        skills: [],
      };
      gameState.addSlime(initialSlime);
    }

    const activeSlime = gameState.getActiveSlime();
    if (activeSlime) {
      this.slimeEntity = new SlimeEntity(activeSlime);
      this.scene.scene.add(this.slimeEntity.mesh);
    }
  }

  private setupUI(): void {
    document.querySelectorAll('.cyber-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const action = (e.target as HTMLElement).dataset.action;
        this.handleAction(action);
      });
    });

    document.querySelectorAll('.nav-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const sceneType = (e.target as HTMLElement).dataset.scene as SceneType;
        this.switchScene(sceneType);
      });
    });

    eventBus.on('slime_stat_changed', () => this.updateUI());
    eventBus.on('slime_evolved', () => this.updateUI());
    eventBus.on('battle_ended', (result: BattleResult) => {
      this.logMessage(`Battle ended: ${result}`);
      if (result === 'WIN') {
        gameState.addCredits(100);
        this.updateUI();
      }
    });

    document.getElementById('action-panel')?.classList.remove('hidden');
    document.getElementById('stats-panel')?.classList.remove('hidden');
    document.querySelector('[data-scene="raising"]')?.classList.add('active');
  }

  private handleAction(action: string | undefined): void {
    const slime = gameState.getActiveSlime();
    if (!slime) return;

    switch (action) {
      case 'feed':
        raisingCalculator.feed(slime);
        this.logMessage('Fed the slime. Stress decreased, affection increased.');
        if (this.slimeEntity) this.slimeEntity.setWobbleIntensity(1.0);
        setTimeout(() => { if (this.slimeEntity) this.slimeEntity.setWobbleIntensity(0.5); }, 1000);
        break;
      case 'train':
        raisingCalculator.train(slime);
        this.logMessage('Trained the slime. Stats increased, but stress went up.');
        if (this.slimeEntity) this.slimeEntity.setWobbleIntensity(0.8);
        setTimeout(() => { if (this.slimeEntity) this.slimeEntity.setWobbleIntensity(0.5); }, 1000);
        break;
      case 'rest':
        raisingCalculator.rest(slime);
        this.logMessage('Let the slime rest. HP recovered, stress decreased.');
        if (this.slimeEntity) this.slimeEntity.setWobbleIntensity(0.2);
        setTimeout(() => { if (this.slimeEntity) this.slimeEntity.setWobbleIntensity(0.5); }, 1000);
        break;
      case 'battle':
        this.startBattle();
        break;
      case 'fuse':
        this.logMessage('Fusion lab requires another slime.');
        break;
    }

    const evolution = evolutionSystem.checkEvolution(slime);
    if (evolution) {
      evolutionSystem.evolve(slime, evolution);
      this.logMessage(`Slime evolved into ${evolution.displayName}!`);
      if (this.slimeEntity) {
        this.scene.scene.remove(this.slimeEntity.mesh);
        this.slimeEntity = new SlimeEntity(slime);
        this.scene.scene.add(this.slimeEntity.mesh);
      }
    }

    gameState.save();
    this.updateUI();
  }

  private startBattle(): void {
    const player = gameState.getActiveSlime();
    if (!player) return;

    const enemyDef = slimeDefinitions['acid_slime'];
    const enemy: SlimeInstance = {
      definition: enemyDef,
      nickname: 'Wild Acid Slime',
      level: player.level,
      currentStats: { ...enemyDef.baseStats },
      stress: 0.3,
      affection: 0.4,
      battleCount: 0,
      ageDays: 0,
      skills: [],
    };

    audioManager.playBattleStart();
    this.logMessage('Battle started!');
    
    const result = battleCalculator.simulateBattle(player, enemy);
    player.battleCount++;
    player.level += result === 'WIN' ? 1 : 0;
    
    this.logMessage(`Battle result: ${result}`);
  }

  private switchScene(sceneType: SceneType): void {
    gameState.setScene(sceneType);
    document.querySelectorAll('.nav-btn').forEach(btn => {
      btn.classList.toggle('active', (btn as HTMLElement).dataset.scene === sceneType);
    });

    document.getElementById('action-panel')?.classList.toggle('hidden', sceneType !== 'raising');
    document.getElementById('stats-panel')?.classList.toggle('hidden', sceneType !== 'raising');

    this.logMessage(`Switched to ${sceneType} scene.`);
  }

  private updateUI(): void {
    const slime = gameState.getActiveSlime();
    if (!slime) return;

    document.getElementById('credits')!.textContent = `Credits: ${gameState.getCredits()}`;
    document.getElementById('day')!.textContent = `Day: ${gameState.getDay()}`;

    const maxHp = slime.definition.baseStats.hp * 2;
    document.getElementById('hp-bar')!.style.width = `${(slime.currentStats.hp / maxHp) * 100}%`;
    document.getElementById('atk-bar')!.style.width = `${Math.min(100, slime.currentStats.atk)}%`;
    document.getElementById('def-bar')!.style.width = `${Math.min(100, slime.currentStats.def)}%`;
    document.getElementById('spd-bar')!.style.width = `${Math.min(100, slime.currentStats.spd)}%`;
    document.getElementById('stress-bar')!.style.width = `${slime.stress * 100}%`;
    document.getElementById('affection-bar')!.style.width = `${slime.affection * 100}%`;
  }

  private logMessage(message: string): void {
    const logArea = document.getElementById('log-area');
    if (logArea) {
      const entry = document.createElement('div');
      entry.textContent = `> ${message}`;
      logArea.appendChild(entry);
      logArea.scrollTop = logArea.scrollHeight;
    }
  }

  start(): void {
    this.isRunning = true;
    this.animate();
  }

  private animate(): void {
    if (!this.isRunning) return;

    const delta = this.scene.clock.getDelta();
    
    if (this.slimeEntity) {
      this.slimeEntity.update(delta);
      this.sparkleSystem.particles.position.copy(this.slimeEntity.mesh.position);
    }
    
    this.rainSystem.update(delta);
    this.sparkleSystem.update(delta);
    this.scene.update();

    requestAnimationFrame(this.animate.bind(this));
  }
}

const game = new Game();
game.start();
