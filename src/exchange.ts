import { drugs } from "./data/drugs.js"
import { BasicActionSet } from "./menu.js"
import { getPrice, addItems, itemCount, removeItems } from "./player.js"
import { player } from "./state.js"

function buy(drugKey: string) {
    const price = getPrice(drugKey)
    if (player.money >= price) {
        player.money = player.money - price
        addItems(drugKey, 1)
    }
}

function sell(drugKey: string) {
    const price = getPrice(drugKey)
    if (itemCount(drugKey) > 0) {
        removeItems(drugKey, 1)
        player.money += price
    }
}

function handleBuySell(pressedKey: string) {
    for (const drugKey in drugs) {
        const drug = drugs[drugKey]!
        if (pressedKey === drug.buttonBuy) {
            buy(drugKey)
            return
        }
        if (pressedKey === drug.buttonSell) {
            sell(drugKey)
            return
        }
    }
}

export class TradeActionSet extends BasicActionSet {
    render() {
        for (const drugKey in drugs) {
            const drug = drugs[drugKey]!
            const price = getPrice(drugKey)
            const quantityOwned = itemCount(drugKey)
            console.log(`${drug.name} ${quantityOwned} $${price} (${drug.buttonBuy}/${drug.buttonSell})`)
        }
        console.log("")
    }
}

export type StoreStock = Record<string, {
    quantity: number,
    price: number,
}>

// specific pharmacuticals, not generic terms, only those useful for making drugs
const pharmacy: StoreStock = {
    "diazepam": { quantity: 10, price: 50 },
    "paracetamol": { quantity: 20, price: 10 },
    "ibuprofen": { quantity: 15, price: 15 },
    "codeine": { quantity: 5, price: 100 },
    "amoxicillin": { quantity: 8, price: 80 },
}

// export function exchangeMenu(
//     stock: Record<string, {
//         quantity: number,
//         price: number,
//     }>
// ) {

//     const actions: Action[] = []
//     for (const itemKey in stock) {
//         const item = stock[itemKey]!
//         actions.push({
            
// }
