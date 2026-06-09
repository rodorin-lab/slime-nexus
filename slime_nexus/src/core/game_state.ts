import { SceneType, SlimeInstance } from '../types/game';

class GameState {
  private currentScene: SceneType = 'raising';
  private playerSlimes: SlimeInstance[] = [];
  private credits: number = 1000;
  private day: number = 1;
  private activeSlime: SlimeInstance | null = null;

  constructor() {
    this.load();
  }

  getScene(): SceneType {
    return this.currentScene;
  }

  setScene(scene: SceneType): void {
    this.currentScene = scene;
    this.save();
  }

  getSlimes(): SlimeInstance[] {
    return this.playerSlimes;
  }

  addSlime(slime: SlimeInstance): void {
    this.playerSlimes.push(slime);
    if (!this.activeSlime) {
      this.activeSlime = slime;
    }
    this.save();
  }

  setActiveSlime(slime: SlimeInstance): void {
    this.activeSlime = slime;
  }

  getActiveSlime(): SlimeInstance | null {
    return this.activeSlime;
  }

  getCredits(): number {
    return this.credits;
  }

  addCredits(amount: number): void {
    this.credits += amount;
    this.save();
  }

  spendCredits(amount: number): boolean {
    if (this.credits >= amount) {
      this.credits -= amount;
      this.save();
      return true;
    }
    return false;
  }

  getDay(): number {
    return this.day;
  }

  advanceDay(): void {
    this.day++;
    this.save();
  }

  save(): void {
    try {
      localStorage.setItem('slime_nexus_state', JSON.stringify({
        currentScene: this.currentScene,
        playerSlimes: this.playerSlimes,
        credits: this.credits,
        day: this.day,
        activeSlimeId: this.activeSlime?.nickname,
      }));
    } catch (e) {
      console.warn('Failed to save game state:', e);
    }
  }

  load(): void {
    try {
      const saved = localStorage.getItem('slime_nexus_state');
      if (saved) {
        const data = JSON.parse(saved);
        this.currentScene = data.currentScene || 'raising';
        this.playerSlimes = data.playerSlimes || [];
        this.credits = data.credits || 1000;
        this.day = data.day || 1;
        if (this.playerSlimes.length > 0) {
          this.activeSlime = this.playerSlimes.find(
            (s: SlimeInstance) => s.nickname === data.activeSlimeId
          ) || this.playerSlimes[0];
        }
      }
    } catch (e) {
      console.warn('Failed to load game state:', e);
    }
  }
}

export const gameState = new GameState();
