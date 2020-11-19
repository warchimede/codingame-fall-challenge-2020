/**
 * Auto-generated code below aims at helping you parse
 * the standard input according to the problem statement.
 **/

function doAction(a: Action) {
  console.log(a.resultOrder())
}

function printDebug(s: any[]) {
  console.error(s)
}

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

  canPayTax(inventory: number[]): boolean {
    return inventory[0] >= this.taxCount
  }

  resultOrder(): string {
    return `${this.type} ${this.identifier}`
  }
}

function sortRecipes(actions: Action[]): Action[] {
  return actions.filter(a => a.type == ActionType.Brew)
  .map((r, i) => {
    if (i == 0) { r.price += 3 }
    if (i == 1) { r.price += 1 }
    return r
  })
  .sort((a, b) => a.price - b.price)
  .reverse()
}

function selectBrewableRecipe(recipes: Action[], inventory: number[]): Action {
  return recipes.filter(r => r.isBrewable(inventory))[0]
}

function selectSpellForRecipe(spells: Action[], recipe: Action, inventory: number[]): Action {
  const resInv = recipe.resultInventoryAfterAction(inventory)

  const spell3 = spells.filter(s => s.delta3 > 0)
                        .sort((a, b) => Math.abs(resInv[3] + a.delta3) - Math.abs(resInv[3] + b.delta3))
                        [0]
  const spell2 = spells.filter(s => s.delta2 > 0)
                        .sort((a, b) => Math.abs(resInv[2] + a.delta2) - Math.abs(resInv[2] + b.delta2))
                        [0]
  const spell1 = spells.filter(s => s.delta1 > 0)
                        .sort((a, b) => Math.abs(resInv[1] + a.delta1) - Math.abs(resInv[1] + b.delta1))
                        [0]
  const spell0 = spells.filter(s => s.delta0 > 0)
                        .sort((a, b) => Math.abs(resInv[0] + a.delta0) - Math.abs(resInv[0] + b.delta0))
                        .reverse()
                        [0]

  if (resInv[3] < 0) {
    if (spell3) {
      return spell3
    }
    if (spell2) {
      return spell2
    }
    if (spell1) {
      return spell1
    }
  }

  if (resInv[2] < 0) {
    if (spell2) {
      return spell2
    }
    if (spell1) {
      return spell1
    }
  }

  if (resInv[1] < 0) {
    if (spell1) {
      return spell1
    }
  }

  if (spell0) {
    return spell0
  }
}

const inventoryCapacity = 10

var learnedSpells = 0
const maxLearnedSpells = 7

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
 
  /* LEARN a lot first */
  const learnableLessons = actions.filter(a => a.type == ActionType.Learn)
                                    .filter(l => l.taxCount == 0)
  if (learnedSpells < maxLearnedSpells) {
    /* LEARN spell */
    if (learnableLessons.length > 0) {
      const lesson = learnableLessons[0]
      ++learnedSpells
      doAction(lesson)
      continue
    }
  }

  const recipes = sortRecipes(actions)
  /* Try to brew already available recipe */
  const brewableRecipe = selectBrewableRecipe(recipes, inventory)
  if (brewableRecipe) {
    doAction(brewableRecipe)
    continue
  }

  /* Choose recipe */
  const rec = recipes[0]
  
  /* CAST spell to get to most approach chosen recipe */
  const spells = actions.filter(a => a.isCastable(inventory))
  const spell = selectSpellForRecipe(spells, rec, inventory)
  if (spell) {
    doAction(spell)
    continue
  }

  /* REST */
  console.log(ActionType.Rest)
}
