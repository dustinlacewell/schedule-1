import { keyIn } from "readline-sync"
import { getCity } from "./player.js"
import { player } from "./state.js"
import type { Action, ActionSet } from "./types.js"
import chalk from "chalk"

export function simpleHeader(menuTitle: string) {
    return () => {
        console.log(`=== ${chalk.rgb(255, 165, 0)(menuTitle)} ===`)
        console.log(`You have ${chalk.green('$' + player.money)}`)
        console.log("")
    }
}

export class BasicActionSet implements ActionSet {
    actions: Action[]

    constructor(
        actions: Action[],
    ) {
        this.actions = actions
    }


    handle(pressedKey: string) {
        const action = this.actions.find((x: Action) => x.key === pressedKey)!

        if (action) {
            return action.action()
        }
    }

    render() {
        for (const action of this.actions) {
            if (action.hidden) continue
            console.log(`${action.key}: ${action.label}`)
        }
    }

}

export const menu = ({
    actions, display, header
}: {
    actions: ActionSet[],
    display?: () => void | true,
    header?: () => void,
}) => {
    while (true) {
        console.clear()

        if (header) {
            header()
        }

        display?.()

        for (const actionSet of actions) {
            actionSet.render()
        }

        const key = keyIn("> ")

        for (const actionSet of actions) {
            const result = actionSet.handle(key)
            if (result) {
                return
            }
        }
    }
}


export const globalActions = new BasicActionSet([
    {
        key: 'Q',
        label: 'Quit',
        hidden: true,
        action: () => {
            process.exit(0)
        },
    },
    {
        key: 'q',
        label: 'Back',
        action: () => true
    }
])