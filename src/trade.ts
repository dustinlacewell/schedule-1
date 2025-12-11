import { drugs } from "./data/drugs.js"
import { BasicActionSet, globalActions, menu, simpleHeader } from "./Menu.js"
import { addItems, getPrice, itemCount, removeItems } from "./player.js"
import { player } from "./state.js"
import type { Action } from "./types.js"

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

    static generateActions(): Action[] {
        const actions: Action[] = []

        for (const drugKey in drugs) {
            const drug = drugs[drugKey]!
            actions.push({
                key: drug.buttonBuy,
                label: `Buy ${drug.name}`,
                action: () => {
                    buy(drugKey)
                },
            })
            actions.push({
                key: drug.buttonSell,
                label: `Sell ${drug.name}`,
                action: () => {
                    sell(drugKey)
                },
            })
        }

        return actions
    }

    constructor() {
        super(TradeActionSet.generateActions())
    }

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

export function tradeMenu() {
    const tradeActions = new TradeActionSet()

    menu({
        actions: [
            tradeActions,
            globalActions,
        ],
        header: simpleHeader("TRADE")
    })
}
