import { SlimeInstance, BattleResult, SlimeElement } from '../types/game';
import { eventBus } from '../core/event_bus';

export class BattleCalculator {
  calculateDamage(attacker: SlimeInstance, defender: SlimeInstance, skillPower: number = 10): number {
    const atk = attacker.currentStats.atk;
    const def = defender.currentStats.def;
    const baseDamage = Math.max(1, atk - def / 2);
    const variance = 0.9 + Math.random() * 0.2;
    return Math.floor(baseDamage * skillPower / 10 * variance);
  }

  calculateTurnOrder(slimeA: SlimeInstance, slimeB: SlimeInstance): [SlimeInstance, SlimeInstance] {
    return slimeA.currentStats.spd >= slimeB.currentStats.spd ? [slimeA, slimeB] : [slimeB, slimeA];
  }

  getElementAdvantage(attackerElement: SlimeElement, defenderElement: SlimeElement): number {
    const advantages: Record<string, string> = {
      CYBER: 'VOLT',
      VOLT: 'ACID',
      ACID: 'VOID',
      VOID: 'CYBER',
    };
    return advantages[attackerElement] === defenderElement ? 1.5 : 1.0;
  }

  simulateBattle(player: SlimeInstance, enemy: SlimeInstance): BattleResult {
    let playerHP = player.currentStats.hp;
    let enemyHP = enemy.currentStats.hp;
    const [first, second] = this.calculateTurnOrder(player, enemy);

    let isPlayerTurn = first === player;
    while (playerHP > 0 && enemyHP > 0) {
      const attacker = isPlayerTurn ? player : enemy;
      const defender = isPlayerTurn ? enemy : player;
      const damage = this.calculateDamage(attacker, defender);
      const multiplier = this.getElementAdvantage(attacker.definition.element, defender.definition.element);
      const finalDamage = Math.floor(damage * multiplier);

      if (isPlayerTurn) {
        enemyHP = Math.max(0, enemyHP - finalDamage);
      } else {
        playerHP = Math.max(0, playerHP - finalDamage);
      }

      isPlayerTurn = !isPlayerTurn;
    }

    const result: BattleResult = playerHP > 0 ? 'WIN' : enemyHP > 0 ? 'LOSE' : 'DRAW';
    eventBus.emit('battle_ended', result);
    return result;
  }
}

export const battleCalculator = new BattleCalculator();
