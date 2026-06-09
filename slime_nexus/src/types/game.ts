export enum SlimeElement {
  CYBER = 'CYBER',
  ACID = 'ACID',
  VOLT = 'VOLT',
  VOID = 'VOID',
}

export interface SlimeStats {
  hp: number;
  atk: number;
  def: number;
  spd: number;
}

export interface SlimeDefinition {
  id: string;
  displayName: string;
  baseStats: SlimeStats;
  element: SlimeElement;
  evolutionPaths: EvolutionPath[];
  fusionTraits: string[];
  spriteColor: string;
}

export interface SlimeInstance {
  definition: SlimeDefinition;
  nickname: string;
  level: number;
  currentStats: SlimeStats;
  stress: number;
  affection: number;
  battleCount: number;
  ageDays: number;
  skills: string[];
}

export interface EvolutionPath {
  targetDefinition: SlimeDefinition;
  minLevel: number;
  requiredElement: SlimeElement;
  stressThreshold: number;
  affectionThreshold: number;
  minBattleCount: number;
}

export interface SkillDefinition {
  id: string;
  name: string;
  damage: number;
  element: SlimeElement;
  effect?: string;
}

export type BattleResult = 'WIN' | 'LOSE' | 'DRAW';

export type SceneType = 'raising' | 'explore' | 'battle' | 'fusion' | 'codex';
