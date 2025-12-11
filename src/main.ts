import { BasicActionSet, globalActions, menu, simpleHeader } from './Menu.js'
import { tradeMenu } from './trade.js'
import { travelMenu } from './travel.js'

const menuActions = new BasicActionSet(
    [
        {
            key: 't',
            label: 'Trade',
            action: tradeMenu
        },
        {
            key: "g",
            label: "Go to",
            action: travelMenu
        }
    ]
)

menu({
    actions: [
        globalActions,
        menuActions
    ],
    header: simpleHeader("MAIN")
})