import { SlimeInstance, SlimeStats } from '../types/game';
import { eventBus } from '../core/event_bus';
import { audioManager } from '../core/audio_manager';

export class RaisingCalculator {
  feed(slime: SlimeInstance): void {
    slime.currentStats.hp = Math.min(slime.currentStats.hp + 5, slime.definition.baseStats.hp * 2);
    slime.currentStats.atk += 1;
    slime.stress = Math.max(0, slime.stress - 0.1);
    slime.affection = Math.min(1, slime.affection + 0.05);
    eventBus.emit('slime_stat_changed', slime, 'feed');
    audioManager.playFeed();
  }

  train(slime: SlimeInstance): void {
    slime.currentStats.atk += 2;
    slime.currentStats.def += 1;
    slime.currentStats.spd += 1;
    slime.stress = Math.min(1, slime.stress + 0.15);
    slime.affection = Math.max(0, slime.affection - 0.05);
    eventBus.emit('slime_stat_changed', slime, 'train');
    audioManager.playTrain();
  }

  rest(slime: SlimeInstance): void {
    slime.currentStats.hp = Math.min(slime.currentStats.hp + 10, slime.definition.baseStats.hp * 2);
    slime.stress = Math.max(0, slime.stress - 0.25);
    slime.affection = Math.min(1, slime.affection + 0.02);
    eventBus.emit('slime_stat_changed', slime, 'rest');
    audioManager.playRest();
  }

  calculateStats(slime: SlimeInstance): SlimeStats {
    const base = slime.definition.baseStats;
    const levelMultiplier = 1 + (slime.level - 1) * 0.1;
    return {
      hp: Math.floor(base.hp * levelMultiplier + slime.currentStats.hp * 0.1),
      atk: Math.floor(base.atk * levelMultiplier + slime.currentStats.atk * 0.1),
      def: Math.floor(base.def * levelMultiplier + slime.currentStats.def * 0.1),
      spd: Math.floor(base.spd * levelMultiplier + slime.currentStats.spd * 0.1),
    };
  }
}

export const raisingCalculator = new RaisingCalculator();
