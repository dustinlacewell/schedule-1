import type { City } from "../types.js"

const chicago: City = {
    name: 'Chicago',
    market: {
        weed: 10,
        coke: 20,
        meth: 30,
    },
    button: `c`
}

const new_york: City = {
    name: 'New York',
    market: {
        weed: 5,
        coke: 30,
        meth: 40,
    },
    button: `n`

}

const portland: City = {
    name: 'Portland',
    market: {
        weed: 20,
        coke: 50,
        meth: 10,
    },
    button: `p`
}

export const cities: Record<string, City> = {
    chicago,
    new_york,
    portland,
}