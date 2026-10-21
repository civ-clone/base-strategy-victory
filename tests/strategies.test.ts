import AfterTurn from '@civ-clone/core-strategy-ai-client/PlayerActions/AfterTurn';
import BuildSpaceship from '../Strategies/City/BuildSpaceship';
import { Buildable } from '@civ-clone/core-city-build/Buildable';
import CityBuild from '@civ-clone/core-city-build/CityBuild';
import Knowledge from '@civ-clone/base-strategy-ai/lib/Knowledge';
import LaunchSpaceship from '../Strategies/Turn/LaunchSpaceship';
import Part from '@civ-clone/core-spaceship/Part';
import Player from '@civ-clone/core-player/Player';
import PlayerAction from '@civ-clone/core-player/PlayerAction';
import RuleRegistry from '@civ-clone/core-rule/RuleRegistry';
import SpaceRacePolicy, { spaceRaceGoal } from '../lib/Space/SpaceRacePolicy';
import Spaceship from '@civ-clone/core-spaceship/Spaceship';
import { VictoryGoal, goalFor } from '../lib/goal';
import { createDependencies } from '@civ-clone/base-strategy-ai/lib/Dependencies';
import { createVictoryDependencies } from '../lib/VictoryDependencies';
import { expect } from 'chai';

class Apollo extends Buildable {}
class Barracks extends Buildable {}
class Structure extends Part {}
class Module extends Part {}

const knowledge = {} as Knowledge,
  goal = (name: string, weight: number): VictoryGoal => ({
    name,
    weight: () => weight,
    advances: () => [],
  });

describe('goalFor', (): void => {
  it('plays for the goal with the most weight above 0, the first on a tie', (): void => {
    const dependencies = createDependencies(),
      victory = createVictoryDependencies(),
      player = new Player(new RuleRegistry()),
      space = goal('space', 2),
      conquest = goal('conquest', 2);

    expect(
      goalFor([goal('none', 0), space, conquest], dependencies, victory, player)
    ).to.equal(space);
    expect(goalFor([goal('none', 0)], dependencies, victory, player)).to.equal(
      null
    );
  });
});

// A city of `player`'s that can build `available`, with the player's other cities building `building`.
const setUp = ({
  available,
  building = [],
  spaceship = null,
  weight = 1,
  partsCity = true,
  enablerCity = true,
}: {
  available: (typeof Buildable)[];
  building?: (typeof Buildable)[];
  spaceship?: Partial<Spaceship> | null;
  weight?: number;
  partsCity?: boolean;
  enablerCity?: boolean;
}) => {
  const player = new Player(new RuleRegistry()),
    built: (typeof Buildable)[] = [],
    city: any = { player: () => player },
    others = building.map((Item) => ({
      player: () => player,
      building: Item,
    })),
    cityBuild = Object.assign(Object.create(CityBuild.prototype), {
      available: () => available.map((Item) => ({ item: () => Item })),
      build: (Item: typeof Buildable) => built.push(Item),
      city: () => city,
    }) as CityBuild,
    dependencies = createDependencies({
      cityRegistry: { getByPlayer: () => [city, ...others] } as any,
      cityBuildRegistry: {
        getByCity: (other: any) => ({
          building: () =>
            other.building ? { item: () => other.building } : null,
        }),
      } as any,
    }),
    victory = createVictoryDependencies({
      spaceshipRegistry: { getActiveByPlayer: () => spaceship } as any,
    }),
    policy: SpaceRacePolicy = {
      weight: () => weight,
      advances: () => [],
      enablers: [Apollo],
      enablerCity: () => (enablerCity ? city : null),
      buildsParts: () => partsCity,
      nextPart: (_d, _v, _s, availableParts, buildingParts) =>
        availableParts.find((Item) => !buildingParts.includes(Item)) ?? null,
      shouldLaunch: () => true,
    },
    space = spaceRaceGoal(policy),
    strategy = new BuildSpaceship(
      dependencies,
      knowledge,
      space,
      [space],
      policy,
      victory
    ),
    action = new PlayerAction(player, cityBuild);

  return { action, built, strategy };
};

describe('BuildSpaceship', (): void => {
  it('builds the Apollo Program in the city chosen for it, before there is a ship', (): void => {
    const { action, built, strategy } = setUp({
      available: [Barracks, Apollo],
    });

    expect(strategy.handles(action)).to.equal(true);
    expect(strategy.attempt(action)).to.equal(true);
    expect(built).to.deep.equal([Apollo]);
  });

  it('leaves the choice to others elsewhere, when another city builds it, or when the race is not the goal', (): void => {
    [
      setUp({ available: [Apollo], enablerCity: false }),
      setUp({ available: [Apollo], building: [Apollo] }),
      setUp({ available: [Apollo], weight: 0 }),
    ].forEach(({ action, built, strategy }) => {
      expect(strategy.attempt(action)).to.equal(false);
      expect(built).to.deep.equal([]);
    });
  });

  it("builds the part the ship wants next, not one another city is building, until it's launched", (): void => {
    const { action, built, strategy } = setUp({
      available: [Barracks, Structure, Module],
      building: [Structure],
      spaceship: { launched: () => false },
    });

    expect(strategy.attempt(action)).to.equal(true);
    expect(built).to.deep.equal([Module]);

    const launched = setUp({
      available: [Structure],
      spaceship: { launched: () => 12 },
    });

    expect(launched.strategy.attempt(launched.action)).to.equal(false);

    const elsewhere = setUp({
      available: [Structure],
      spaceship: { launched: () => false },
      partsCity: false,
    });

    expect(elsewhere.strategy.attempt(elsewhere.action)).to.equal(false);
  });
});

describe('LaunchSpaceship', (): void => {
  const launching = (spaceship: any, shouldLaunch: boolean) => {
    const player = new Player(new RuleRegistry()),
      strategy = new LaunchSpaceship(
        createDependencies(),
        knowledge,
        { shouldLaunch: () => shouldLaunch } as unknown as SpaceRacePolicy,
        createVictoryDependencies({
          spaceshipRegistry: { getActiveByPlayer: () => spaceship } as any,
        })
      );

    return strategy.attempt(new AfterTurn(player, player));
  };

  it('launches a ship with parts once the policy says so, and only then', (): void => {
    let launches = 0;
    const ship = (parts: number, launched: false | number = false) => ({
      activeParts: () => new Array(parts),
      launch: () => launches++,
      launched: () => launched,
    });

    launching(ship(3), true);
    launching(ship(3), false);
    launching(ship(0), true);
    launching(ship(3, 10), true);
    launching(null, true);

    expect(launches).to.equal(1);
  });
});
