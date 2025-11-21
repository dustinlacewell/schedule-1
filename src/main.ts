import { keyIn, question } from 'readline-sync'

let money = 100
let inventory_weed = 0
const market_weed = 10
let current_location = 'Chicago'
let stillPlaying = true

const inventory = {
    weed: 0,
    coke: 0,
    meth: 0,
}

const market_prices = {
    weed: 10,
    meth: 20,
    coke: 30,
}

function listStats() {
    console.log(`Money: $${money}`)
    console.log(`Weed: ${inventory_weed}`)
    console.log(current_location)
}

function listActions() {
    console.log('Press B to buy weed')
    console.log('Press S to sell weed')
    console.log('Press Q to quit')
}

function getKey() {
    return keyIn('> ')
}

function buy(drug: keyof typeof market_prices) {
    const price = market_prices[drug]
    if (money >= price ) {
        money = money - price
        inventory[drug] += 1
    }
}

function sell(drug: keyof typeof market_prices) {
    const price = market_prices[drug]
    if (inventory[drug] > 0) {
        inventory[drug] -= 1
        money += price
    }
}

function buyWeed() {
    if (money >= market_weed) {
     money = money - market_weed
     inventory_weed = inventory_weed + 1
    }
}
function sellWeed() {
    if (inventory_weed > 0) {
        inventory_weed = inventory_weed - 1
        money = money + market_weed
    }
}

function handleKey(key: string) {
    if (key === 'b') {
        buyWeed()
    }
    if (key === 's') {
        sellWeed()
    }
    if (key === 'q') {
        stillPlaying = false
    }
}

while (stillPlaying) {
    listStats()
    listActions()
    const key = getKey()
    handleKey(key)        
}