/**
 * Auto-generated code below aims at helping you parse
 * the standard input according to the problem statement.
 **/

enum ActionType {
  Brew = "BREW",
  Cast = "CAST",
  OpponentCast = "OPPONENT_CAST",
  Learn = "LEARN",
  Rest = "REST"
}

class Action {
  identifier: number
  type: string
  delta0: number
  delta1: number
  delta2: number
  delta3: number
  price: number
  castable: boolean

  constructor(identifier: number, type: string, delta0: number, delta1: number, delta2: number, delta3: number,
    price: number, castable: boolean) {
      this.identifier = identifier
      this.type = type
      this.delta0 = delta0
      this.delta1 = delta1
      this.delta2 = delta2
      this.delta3 = delta3
      this.price = price
      this.castable = castable
  }

  resultOrder(): string {
    return `${this.type} ${this.identifier}`
  }
}

// game loop
while (true) {
  var actions: Action[] = []
  var inventory: number[] = []

  const actionCount: number = parseInt(readline()); // the number of spells and recipes in play
  for (let i = 0; i < actionCount; i++) {
    var inputs: string[] = readline().split(' ');
    const actionId: number = parseInt(inputs[0]); // the unique ID of this spell or recipe
    const actionType: string = inputs[1]; // in the first league: BREW; later: CAST, OPPONENT_CAST, LEARN, BREW
    const delta0: number = parseInt(inputs[2]); // tier-0 ingredient change
    const delta1: number = parseInt(inputs[3]); // tier-1 ingredient change
    const delta2: number = parseInt(inputs[4]); // tier-2 ingredient change
    const delta3: number = parseInt(inputs[5]); // tier-3 ingredient change
    const price: number = parseInt(inputs[6]); // the price in rupees if this is a potion
    const tomeIndex: number = parseInt(inputs[7]); // in the first two leagues: always 0; later: the index in the tome if this is a tome spell, equal to the read-ahead tax; For brews, this is the value of the current urgency bonus
    const taxCount: number = parseInt(inputs[8]); // in the first two leagues: always 0; later: the amount of taxed tier-0 ingredients you gain from learning this spell; For brews, this is how many times you can still gain an urgency bonus
    const castable: boolean = inputs[9] !== '0'; // in the first league: always 0; later: 1 if this is a castable player spell
    const repeatable: boolean = inputs[10] !== '0'; // for the first two leagues: always 0; later: 1 if this is a repeatable player spell
    
    const action = new Action(actionId, actionType, delta0, delta1, delta2, delta3, price, castable)
    actions.push(action)
  }
  for (let i = 0; i < 2; i++) {
    var inputs: string[] = readline().split(' ');
    const inv0: number = parseInt(inputs[0]); // tier-0 ingredients in inventory
    const inv1: number = parseInt(inputs[1]);
    const inv2: number = parseInt(inputs[2]);
    const inv3: number = parseInt(inputs[3]);
    const score: number = parseInt(inputs[4]); // amount of rupees

    inventory = [inv0, inv1, inv2, inv3]
  }

  // Write an action using console.log()
  // To debug: console.error('Debug messages...');
  // in the first league: BREW <id> | WAIT; later: BREW <id> | CAST <id> [<times>] | LEARN <id> | REST | WAIT
 
  const recipes = actions.filter(a => a.type == ActionType.Brew)
  const casts = actions.filter(a => a.type == ActionType.Cast)

  const availableRecipes = recipes.sort((a, b) => a.price - b.price) // Sort by price
    .reverse() // most expensive first
    .filter( action => 
      inventory[0] + action.delta0 >= 0 &&
      inventory[1] + action.delta1 >= 0 &&
      inventory[2] + action.delta2 >= 0 &&
      inventory[3] + action.delta3 >= 0
    )

  const availableCasts = casts.filter( action =>
    action.castable &&
    inventory[0] + action.delta0 >= 0 &&
    inventory[1] + action.delta1 >= 0 &&
    inventory[2] + action.delta2 >= 0 &&
    inventory[3] + action.delta3 >= 0
  )

  if (availableRecipes.length > 0) {
    // Brew the most expensive
    console.log(availableRecipes[0].resultOrder())
  } else if (availableCasts.length > 0) {
    // Cast the first available
    console.log(availableCasts[0].resultOrder())
  } else {
    console.log(ActionType.Rest)
  }
}
