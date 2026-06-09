import { SlimeInstance, SlimeDefinition } from '../types/game';
import { slimeDefinitions } from '../entities/slime_data';
import { eventBus } from '../core/event_bus';
import { audioManager } from '../core/audio_manager';

export class EvolutionSystem {
  checkEvolution(slime: SlimeInstance): SlimeDefinition | null {
    const paths = slime.definition.evolutionPaths;
    if (paths.length === 0) return null;

    for (const pathId of paths) {
      const targetDef = slimeDefinitions[pathId];
      if (!targetDef) continue;

      if (
        slime.level >= 5 &&
        slime.definition.element === targetDef.element &&
        slime.stress < 0.5 &&
        slime.affection > 0.6
      ) {
        return targetDef;
      }
    }
    return null;
  }

  evolve(slime: SlimeInstance, newDef: SlimeDefinition): void {
    const oldDef = slime.definition;
    slime.definition = newDef;
    slime.level = 1;
    slime.currentStats = { ...newDef.baseStats };
    slime.stress = 0.3;
    slime.affection = 0.7;
    
    eventBus.emit('slime_evolved', oldDef, newDef);
    audioManager.playEvolve();
  }
}

export const evolutionSystem = new EvolutionSystem();
