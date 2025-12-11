import { cities } from "./data/cities.js"
import { player } from "./state.js"


export function getCity() {
    const cityName = player.location
    return cities[cityName]!
}

export function getMarket() {
    const city = getCity()
    return city.market
}

export function getPrice(drugKey: string) {
    const market = getMarket()
    return market[drugKey]!
}

export function itemCount(item: string) {
    return player.inventory.get(item) ?? 0
}

export function addItems(item: string, amount = 1) {
    const current = itemCount(item)
    player.inventory.set(item, current + amount)
}

export function removeItems(item: string, amount = 1) {
    const current = itemCount(item)
    player.inventory.set(item, current - amount)
}