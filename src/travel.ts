import { cities } from "./data/cities.js"
import { BasicActionSet, globalActions, menu, simpleHeader } from "./Menu.js"
import { player } from "./state.js"
import type { Action } from "./types.js"


function generateActions(): Action[] {
    const actions: Action[] = []

    for (const cityKey in cities) {
        const city = cities[cityKey]!
        actions.push({
            key: city.button,
            label: `Go to ${city.name}`,
            action: () => {
                player.location = cityKey
                return true
            },
        })
    }

    return actions
}

export function travelMenu() {
    menu({
        actions: [
            new BasicActionSet(generateActions()),
            globalActions
        ],
        header: simpleHeader("TRAVEL")
    })
}