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

class Delta {
  delta0: number
  delta1: number
  delta2: number
  delta3: number

  constructor(delta0: number, delta1: number, delta2: number, delta3: number) {
    this.delta0 = delta0
    this.delta1 = delta1
    this.delta2 = delta2
    this.delta3 = delta3
  }

  isPositive(): boolean {
    return this.delta0 >= 0 && this.delta1 >= 0 && this.delta2 >= 0 && this.delta3 >= 0
  }

  add(delta: Delta): Delta {
    return new Delta(this.delta0 + delta.delta0,
      this.delta1 + delta.delta1,
      this.delta2 + delta.delta2,
      this.delta3 + delta.delta3)
  }

  sum(): number {
    return this.delta0 + this.delta1 + this.delta2 + this.delta3
  }
}

class Action {
  identifier: number
  type: string
  delta: Delta
  price: number
  tomeIndex: number
  taxCount: number
  castable: boolean
  repeatable: boolean

  constructor(identifier: number, type: string, delta0: number, delta1: number, delta2: number, delta3: number,
    price: number, tomeIndex: number, taxCount: number, castable: boolean, repeatable: boolean) {
      this.identifier = identifier
      this.type = type
      this.delta = new Delta(delta0, delta1, delta2, delta3)
      this.price = price
      this.tomeIndex = tomeIndex
      this.taxCount = taxCount
      this.castable = castable
      this.repeatable = repeatable
  }

  isInventoryCompatible(inventory: Delta): boolean {
    const result = this.delta.add(inventory)
    return result.isPositive() // There are enough resources in inventory
        && (result.sum() <= inventoryCapacity) // Respects inventory capacity
  }

  isBrewable(inventory: Delta): boolean {
    return this.type == ActionType.Brew && this.isInventoryCompatible(inventory)
  }

  isCastable(inventory: Delta): boolean {
    return this.type == ActionType.Cast && this.castable && this.isInventoryCompatible(inventory)
  }

  canPayTax(inventory: Delta): boolean {
    return inventory.delta0 >= this.taxCount
  }

  resultOrder(): string {
    return `${this.type} ${this.identifier}`
  }
}

function sortRecipesByPrice(actions: Action[]): Action[] {
  return actions.filter(a => a.type == ActionType.Brew)
  .map((r, i) => {
    if (i == 0) { r.price += 3 }
    if (i == 1) { r.price += 1 }
    return r
  })
  .sort((a, b) => a.price - b.price)
  .reverse()
}

function selectBrewableRecipe(recipes: Action[], inventory: Delta): Action {
  return recipes.filter(r => r.isBrewable(inventory))[0]
}

function selectSpellForRecipe(spells: Action[], recipe: Action, inventory: Delta): Action {
  const resInv = recipe.delta.add(inventory)

  const spell3 = spells.filter(s => s.delta.delta3 > 0)
                        .sort((a, b) => Math.abs(resInv.delta3 + a.delta.delta3) - Math.abs(resInv.delta3 + b.delta.delta3))
                        [0]
  const spell2 = spells.filter(s => s.delta.delta2 > 0)
                        .sort((a, b) => Math.abs(resInv.delta2 + a.delta.delta2) - Math.abs(resInv.delta2 + b.delta.delta2))
                        [0]
  const spell1 = spells.filter(s => s.delta.delta1 > 0)
                        .sort((a, b) => Math.abs(resInv.delta1 + a.delta.delta1) - Math.abs(resInv.delta1 + b.delta.delta1))
                        [0]
  const spell0 = spells.filter(s => s.delta.delta0 > 0)
                        .sort((a, b) => Math.abs(resInv.delta0 + a.delta.delta0) - Math.abs(resInv.delta0 + b.delta.delta0))
                        .reverse()
                        [0]

  if (resInv.delta3 < 0) {
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

  if (resInv.delta2 < 0) {
    if (spell2) {
      return spell2
    }
    if (spell1) {
      return spell1
    }
  }

  if (resInv.delta1 < 0) {
    if (spell1) {
      return spell1
    }
  }

  if (spell0) {
    return spell0
  }
}

function selectBestSpell(castableSpells: Action[], recipesByPrice: Action[], inventory: Delta): Action {
  const resInvs = recipesByPrice.map(r => r.delta.add(inventory))
                    .map(d => castableSpells.map(s => s.delta.add(d)))
  var resJ = -1
  resInvs.forEach(deltaArray => {
    deltaArray.forEach((resAfterSpell, j) => {
      if (resAfterSpell.isPositive() && resJ <= 0) {
        resJ = j
      }
    })
  })
  if (resJ >= 0) {
     return castableSpells[resJ]
  }

  resInvs.forEach(deltaArray => {
    deltaArray.forEach((resAfterSpell, j) => {
      castableSpells.filter(s => s.isCastable(resAfterSpell))
      .filter(s => s.identifier != castableSpells[j].identifier)
      .map(s => s.delta.add(resAfterSpell))
      .forEach(resAfterSecondSpell => {
        if (resAfterSecondSpell.isPositive() && resJ <= 0) {
          resJ = j
        }
      })
    })
  })
  if (resJ >= 0) {
    return castableSpells[resJ]
  }
}

const inventoryCapacity = 10

var learnedSpells = 0
const maxLearnedSpells = 10

// game loop
while (true) {
  var actions: Action[] = []
  var inventory: Delta

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
      inventory = new Delta(inv0, inv1, inv2, inv3)
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

  const recipesByPrice = sortRecipesByPrice(actions)
  const castableSpells = actions.filter(a => a.isCastable(inventory))

  /* Try to brew already available recipe */
  const brewableRecipe = selectBrewableRecipe(recipesByPrice, inventory)
  if (brewableRecipe) {
    doAction(brewableRecipe)
    continue
  }

  /* Choose best spell overall */
  const bestSpell = selectBestSpell(castableSpells, recipesByPrice, inventory)
  if (bestSpell) {
    doAction(bestSpell)
    continue
  }
  
  /* CAST spell to approach most expensive recipe */  
  const spell = selectSpellForRecipe(castableSpells, recipesByPrice[0], inventory)
  if (spell) {
    doAction(spell)
    continue
  }

  /* REST */
  console.log(ActionType.Rest)
}
