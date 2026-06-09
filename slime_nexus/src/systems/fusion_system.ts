import { SlimeInstance, SlimeDefinition, SlimeElement } from '../types/game';
import { slimeDefinitions } from '../entities/slime_data';
import { eventBus } from '../core/event_bus';

export class FusionSystem {
  fuse(parentA: SlimeInstance, parentB: SlimeInstance): SlimeInstance | null {
    const childDef = this.calculateChildDefinition(parentA.definition, parentB.definition);
    if (!childDef) return null;

    const child: SlimeInstance = {
      definition: childDef,
      nickname: `${childDef.displayName}-${Date.now().toString().slice(-4)}`,
      level: 1,
      currentStats: {
        hp: Math.floor((parentA.currentStats.hp + parentB.currentStats.hp) / 2),
        atk: Math.floor((parentA.currentStats.atk + parentB.currentStats.atk) / 2),
        def: Math.floor((parentA.currentStats.def + parentB.currentStats.def) / 2),
        spd: Math.floor((parentA.currentStats.spd + parentB.currentStats.spd) / 2),
      },
      stress: (parentA.stress + parentB.stress) / 2,
      affection: (parentA.affection + parentB.affection) / 2,
      battleCount: 0,
      ageDays: 0,
      skills: [],
    };

    eventBus.emit('slime_fused', parentA, parentB, child);
    return child;
  }

  private calculateChildDefinition(defA: SlimeDefinition, defB: SlimeDefinition): SlimeDefinition | null {
    const allDefs = Object.values(slimeDefinitions);
    const possibleChildren = allDefs.filter(d => 
      d.evolutionPaths.length === 0 &&
      (d.element === defA.element || d.element === defB.element)
    );

    if (possibleChildren.length === 0) {
      return allDefs[Math.floor(Math.random() * allDefs.length)];
    }

    return possibleChildren[Math.floor(Math.random() * possibleChildren.length)];
  }
}

export const fusionSystem = new FusionSystem();
