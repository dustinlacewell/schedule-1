import { cities } from './data/cities.js'
import { BasicActionSet, globalActions, menu, simpleHeader } from './Menu.js'
import { player } from './state.js'
import { tradeMenu } from './trade.js'
import { travelMenu } from './travel.js'
import pharmaMenu from './pharmacy.js'
import { randomizeNPCs } from './data/locations.js'

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
        },
        {// Pharmacy
            key: 'p',
            label: 'pharmacy',
            action: pharmaMenu
        }
    ]
)

randomizeNPCs()

menu({
    actions: [
        menuActions,
        globalActions,
    ],
    header: () => {
        const city = cities[player.location]!
        simpleHeader(city.name)()
    }
})