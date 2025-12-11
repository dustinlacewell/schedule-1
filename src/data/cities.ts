import type { City } from "../types.js"
import { sampleLocations } from "./locations.js"
import { sampleNPCs } from "./npcs.js"

const chicago: City = {
    name: 'Chicago',
    market: {
        weed: 10,
        coke: 20,
        meth: 30,
    },
    button: `c`,
    locations: [],
}

const new_york: City = {
    name: 'New York',
    market: {
        weed: 5,
        coke: 30,
        meth: 40,
    },
    button: `n`,
    locations: [],
}

const portland: City = {
    name: 'Portland',
    market: {
        weed: 20,
        coke: 50,
        meth: 10,
    },
    button: `p`,
    locations: [],
}

export const cities: Record<string, City> = {
    chicago,
    new_york,
    portland,
}

// export const initializeCities = () => {
//     for (const cityKey in cities) {
//         const city = cities[cityKey]!
//         const locations = sampleLocations(3)
//         const npcs = sampleNPCs(3)
//         for (let i = 0; i < locations.length; i++) {
//             const loc = locations[i]
//             loc.who = npcs[i]
//             city.locations.push(loc)
//         }
//     }
// }