import type { Drug } from "../types.js"

const weed: Drug = {
    name: 'Weed',
    buttonBuy: 'w',
    buttonSell: 'W',
}

const coke: Drug = {
    name: 'Coke',
    buttonBuy: 'c',
    buttonSell: 'C'
}

const meth: Drug = {
    name: 'Meth',
    buttonBuy: 'm',
    buttonSell: 'M',
}


export const drugs: Record<string, Drug> = { weed, coke, meth }
