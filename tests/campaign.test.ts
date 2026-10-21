import BeforeTurn from '@civ-clone/core-strategy-ai-client/PlayerActions/BeforeTurn';
import Campaign from '../Strategies/Unit/Campaign';
import ConquestPolicy, { conquestGoal } from '../lib/Conquest/ConquestPolicy';
import Knowledge from '@civ-clone/base-strategy-ai/lib/Knowledge';
import Player from '@civ-clone/core-player/Player';
import PlayerAction from '@civ-clone/core-player/PlayerAction';
import RuleRegistry from '@civ-clone/core-rule/RuleRegistry';
import Unit from '@civ-clone/core-unit/Unit';
import { createDependencies } from '@civ-clone/base-strategy-ai/lib/Dependencies';
import { createVictoryDependencies } from '../lib/VictoryDependencies';
import { expect } from 'chai';

// One of `player`'s attackers on `tile`, with a campaign against a city on `targetTile` mustering on `musterTile`.
const setUp = ({
  attacker = true,
  cost = 1,
  enemyBeside = false,
  mustered = false,
  onMuster = false,
  weight = 1,
}: {
  attacker?: boolean;
  cost?: number;
  enemyBeside?: boolean;
  mustered?: boolean;
  onMuster?: boolean;
  weight?: number;
}) => {
  const player = new Player(new RuleRegistry()),
    enemy = { player: () => new Player(new RuleRegistry()) },
    // Tiles in a row: the muster city's at 0, the unit at 5 and the target at 10.
    at = (name: string, x: number): any => ({
      name,
      x,
      distanceFrom: (other: any) => Math.abs(other.x - x),
      getNeighbours: () => (enemyBeside ? [enemyTile] : []),
    }),
    tile = at('here', 5),
    musterTile = at('muster', 0),
    targetTile = at('target', 10),
    enemyTile = at('enemy', 1),
    orders: string[] = [],
    travelled: string[] = [],
    unit = Object.assign(Object.create(Unit.prototype), {
      activate: () => orders.push('activate'),
      busy: () => 'Fortified',
      action: (action: object) => orders.push(action.constructor.name),
      movement: () => ({ value: () => 1 }),
      player: () => player,
      tile: () => (onMuster ? musterTile : tile),
    }) as Unit,
    policy: ConquestPolicy = {
      weight: () => weight,
      advances: () => [],
      target: () => ({ tile: () => targetTile } as any),
      musterCity: () => ({ tile: () => musterTile } as any),
      isAttacker: () => attacker,
      mayLeave: () => true,
      marchTurns: 10,
      mustered: () => mustered,
    },
    goal = conquestGoal(policy),
    // A path finder that goes straight there.
    PathFinder = class {
      private end: any;

      constructor(unit: Unit, start: any, end: any) {
        this.end = end;
      }

      generate() {
        return Object.assign([null, this.end], {
          entries() {
            return [...this];
          },
          movementCost: () => cost,
        });
      }
    },
    dependencies = createDependencies({
      pathFinderRegistry: { entries: () => [PathFinder] } as any,
      ruleRegistry: new RuleRegistry(),
      turn: { value: () => 1 } as any,
      unitRegistry: {
        getByPlayer: () => [unit],
        getByTile: (tile: any) => (tile === enemyTile ? [enemy] : []),
      } as any,
    }),
    strategy = new Campaign(
      dependencies,
      {} as Knowledge,
      goal,
      [goal],
      policy,
      createVictoryDependencies(),
      async (dependencies, player, memory, knowledge, unit) => {
        travelled.push(memory.unitPathData.get(unit)![0].name);
        memory.unitPathData.delete(unit);
      }
    );

  return {
    attempt: () => strategy.attempt(new PlayerAction(player, unit)),
    beforeTurn: () => strategy.attempt(new BeforeTurn(player, player)),
    orders,
    travelled,
  };
};

describe('Campaign', (): void => {
  it('gathers attackers in the muster city, and waits there', async (): Promise<void> => {
    const away = setUp({});

    expect(await away.attempt()).to.equal(true);
    expect(away.travelled).to.deep.equal(['muster']);

    const there = setUp({ onMuster: true });

    expect(await there.attempt()).to.equal(true);
    expect(there.travelled).to.deep.equal([]);
    expect(there.orders).to.deep.equal(['NoOrders']);
  });

  it('goes for the target once mustered', async (): Promise<void> => {
    const { attempt, travelled } = setUp({ mustered: true, onMuster: true });

    expect(await attempt()).to.equal(true);
    expect(travelled).to.deep.equal(['target']);
  });

  it('waits rather than set off again in a turn it was already sent', async (): Promise<void> => {
    const { attempt, orders, travelled } = setUp({});

    await attempt();
    await attempt();

    expect(travelled).to.deep.equal(['muster']);
    expect(orders).to.deep.equal(['NoOrders']);
  });

  it('leaves a unit waiting in the muster city with an enemy beside it to the strategies after it', async (): Promise<void> => {
    const { attempt, orders } = setUp({ onMuster: true, enemyBeside: true });

    expect(await attempt()).to.equal(false);
    expect(orders).to.deep.equal([]);
  });

  it('wakes a fortified attacker the policy can spare before the turn, taking its fortification off', async (): Promise<void> => {
    const { beforeTurn, orders } = setUp({});

    await beforeTurn();

    expect(orders).to.deep.equal(['activate']);
  });

  it('leaves a unit further than the policy marches from the muster city to the strategies after it', async (): Promise<void> => {
    const { attempt, travelled } = setUp({ cost: 11 });

    expect(await attempt()).to.equal(false);
    expect(travelled).to.deep.equal([]);
  });

  it('leaves a unit that is not an attacker, or a player not playing for conquest, to the strategies after it', async (): Promise<void> => {
    expect(await setUp({ attacker: false }).attempt()).to.equal(false);
    expect(await setUp({ weight: 0 }).attempt()).to.equal(false);
  });
});
