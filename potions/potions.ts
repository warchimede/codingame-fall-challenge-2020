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
  tomeIndex: number
  taxCount: number
  castable: boolean
  repeatable: boolean

  constructor(identifier: number, type: string, delta0: number, delta1: number, delta2: number, delta3: number,
    price: number, tomeIndex: number, taxCount: number, castable: boolean, repeatable: boolean) {
      this.identifier = identifier
      this.type = type
      this.delta0 = delta0
      this.delta1 = delta1
      this.delta2 = delta2
      this.delta3 = delta3
      this.price = price
      this.tomeIndex = tomeIndex
      this.taxCount = taxCount
      this.castable = castable
      this.repeatable = repeatable
  }

  resultInventoryAfterAction(inventory: number[]): number[] { 
    return [inventory[0] + this.delta0, inventory[1] + this.delta1, inventory[2] + this.delta2, inventory[3] + this.delta3]
  }

  isInventoryCompatible(inventory: number[]): boolean {
    const result = this.resultInventoryAfterAction(inventory)
    return result.map(x => x >= 0).reduce((acc, val) => acc && val) // There are enough resources in inventory
        && (result.reduce((acc, val) => acc + val) <= inventoryCapacity) // Respects inventory capacity
  }

  isBrewable(inventory: number[]): boolean {
    return this.type == ActionType.Brew && this.isInventoryCompatible(inventory)
  }

  isCastable(inventory: number[]): boolean {
    return this.type == ActionType.Cast && this.castable && this.isInventoryCompatible(inventory)
  }

  resultOrder(): string {
    return `${this.type} ${this.identifier}`
  }
}

const inventoryCapacity = 10

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
    
    const action = new Action(actionId, actionType, delta0, delta1, delta2, delta3, price, tomeIndex, taxCount, castable, repeatable)
    actions.push(action)
  }
  for (let i = 0; i < 2; i++) {
    var inputs: string[] = readline().split(' ');
    const inv0: number = parseInt(inputs[0]); // tier-0 ingredients in inventory
    const inv1: number = parseInt(inputs[1]);
    const inv2: number = parseInt(inputs[2]);
    const inv3: number = parseInt(inputs[3]);

    if (i == 0) {
      inventory = [inv0, inv1, inv2, inv3]
    }
  }

  // Write an action using console.log()
  // To debug: console.error('Debug messages...');
  // in the first league: BREW <id> | WAIT; later: BREW <id> | CAST <id> [<times>] | LEARN <id> | REST | WAIT
 
  /* BREW Recipe */
  const recipes = actions.filter(a => a.type == ActionType.Brew)
  // const bestRecipe = recipes.sort((a, b) => a.price - b.price).reverse()[0] // most expensive selling price
  const bestRecipe = recipes[0] // first recipe

  if (bestRecipe.isBrewable(inventory)) {
    console.log(bestRecipe.resultOrder())
    continue
  } 

  /* CAST spell */
  const spells = actions.filter(a => a.type == ActionType.Cast)
  const bestSpells = spells.filter( spell => {
    const result = bestRecipe.resultInventoryAfterAction(inventory)
    const improves3 = (result[3] + spell.delta3 <= 0) && (spell.delta3 > 0)
    const improves2for3 = (result[3] < 0) && (spell.delta2 > 0)
    const improves2 = (result[2] + spell.delta2 <= 0) && (spell.delta2 > 0)
    const improves1for2 = (result[2] < 0) && (spell.delta1 > 0)
    const improves1 = (result[1] + spell.delta1 <= 0) && (spell.delta1 > 0)
    const improves0for1 = (result[1] < 0) && (spell.delta0 > 0)
    const improves0 = spell.delta0 > 0
    const isResultNotTooMuch = improves3 || improves2for3 || improves2 || improves1for2 || improves1 || improves0for1 || improves0
  
    return spell.isCastable(inventory) && isResultNotTooMuch
  }).reverse()

  if (bestSpells.length > 0) {
    console.log(bestSpells[0].resultOrder())
    continue
  }

  /* LEARN spell */
  const lessons = actions.filter(a => a.type == ActionType.Learn)

  /* REST */
  console.log(ActionType.Rest)
}
