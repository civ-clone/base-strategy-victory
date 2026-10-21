# base-strategy-victory

Playing to win: the goals a computer player chooses between, and the strategies that play for them. Generic, with a
ruleset's numbers passed in, as `simple-ai-client` passes Civ1's.

## Goals

A `VictoryGoal` (`lib/goal`) has a name, a weight for a player now, and the advances it needs. `goalFor` picks the goal
with the most weight above 0. While a player plays for a goal, `ResearchForGoal` researches the way to its advances,
worked out from the ruleset's `Requirements` rules (`lib/research`), and leaves the choice to the strategies after it
otherwise.

## The space race

`spaceRaceGoal(policy)` is the space race, played as a `SpaceRacePolicy` says: its weight, its advances, what gives a
player a ship (Civ1's Apollo Program) and the city to build it in, the cities that build parts, the part a ship wants
next, and when to launch.

- `BuildSpaceship` handles a city's production: the enabler in its one city, then parts.
- `LaunchSpaceship`, at the end of a turn, launches once the policy says so. Launching isn't a choice a player is made to
  take, so no other strategy is offered it.

Strategies take `base-strategy-ai`'s `Dependencies` and this package's `VictoryDependencies` (`victoryDependenciesFor`).
