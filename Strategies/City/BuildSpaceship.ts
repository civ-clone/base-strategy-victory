// Generic: while a player races for space, builds what gives it a ship (Civ1's Apollo Program) in one city, then the
//  ship's parts in the cities that build them, as its `SpaceRacePolicy` says. Otherwise it leaves the choice to the
//  strategies after it.
import { IBuildable } from '@civ-clone/core-city-build/Buildable';
import AIStrategy from '@civ-clone/base-strategy-ai/Strategies/lib/AIStrategy';
import BuildItem from '@civ-clone/core-city-build/BuildItem';
import City from '@civ-clone/core-city/City';
import CityBuild from '@civ-clone/core-city-build/CityBuild';
import Dependencies from '@civ-clone/base-strategy-ai/lib/Dependencies';
import Knowledge from '@civ-clone/base-strategy-ai/lib/Knowledge';
import Part from '@civ-clone/core-spaceship/Part';
import PlayerAction from '@civ-clone/core-player/PlayerAction';
import SpaceRacePolicy from '../../lib/Space/SpaceRacePolicy';
import VictoryDependencies from '../../lib/VictoryDependencies';
import { VictoryGoal, goalFor } from '../../lib/goal';

// `BuildItem.item()` holds a class, though it's typed as an instance.
const classOf = (buildItem: BuildItem): IBuildable =>
  buildItem.item() as unknown as IBuildable;

const partsOf = (Items: IBuildable[]): (typeof Part)[] =>
  Items.filter(
    (Item: IBuildable): boolean => Item.prototype instanceof Part
  ) as unknown as (typeof Part)[];

export class BuildSpaceship extends AIStrategy {
  private _goal: VictoryGoal;
  private _goals: VictoryGoal[];
  private _policy: SpaceRacePolicy;
  private _victoryDependencies: VictoryDependencies;

  // `goal` is the space race's own, among the `goals` the player chooses between.
  constructor(
    dependencies: Dependencies,
    knowledge: Knowledge,
    goal: VictoryGoal,
    goals: VictoryGoal[],
    policy: SpaceRacePolicy,
    victoryDependencies: VictoryDependencies
  ) {
    super(dependencies, knowledge);

    this._goal = goal;
    this._goals = goals;
    this._policy = policy;
    this._victoryDependencies = victoryDependencies;
  }

  handles(action: PlayerAction): boolean {
    return action.value() instanceof CityBuild;
  }

  attempt(action: PlayerAction<CityBuild>): boolean {
    const cityBuild = action.value(),
      city = cityBuild.city(),
      player = city.player(),
      dependencies = this.dependencies(),
      victoryDependencies = this._victoryDependencies;

    if (
      goalFor(this._goals, dependencies, victoryDependencies, player) !==
      this._goal
    ) {
      return false;
    }

    const available = cityBuild.available().map(classOf),
      // What the player's other cities are building already.
      building = dependencies.cityRegistry
        .getByPlayer(player)
        .filter((other: City): boolean => other !== city)
        .map((other: City) =>
          dependencies.cityBuildRegistry.getByCity(other).building()
        )
        .filter((buildItem): buildItem is BuildItem => buildItem !== null)
        .map(classOf),
      spaceship =
        victoryDependencies.spaceshipRegistry.getActiveByPlayer(player);

    if (spaceship === null) {
      const Enabler = this._policy.enablers.find(
        (Item: IBuildable): boolean =>
          available.includes(Item) && !building.includes(Item)
      );

      if (
        !Enabler ||
        this._policy.enablerCity(dependencies, victoryDependencies, player) !==
          city
      ) {
        return false;
      }

      cityBuild.build(Enabler);

      return true;
    }

    if (
      spaceship.launched() !== false ||
      !this._policy.buildsParts(dependencies, victoryDependencies, city)
    ) {
      return false;
    }

    const NextPart = this._policy.nextPart(
      dependencies,
      victoryDependencies,
      spaceship,
      partsOf(available),
      partsOf(building)
    );

    if (NextPart === null) {
      return false;
    }

    cityBuild.build(NextPart as unknown as IBuildable);

    return true;
  }
}

export default BuildSpaceship;
