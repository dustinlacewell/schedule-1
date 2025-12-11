import { shuffledNPCs, type NPC } from "./npcs.js"


class Location {
    name: string
    description: string
    who: NPC | null
    heat: number = 0

    constructor(
        name: string,
        description: string,
        heat?: number,
    ) {
        this.name = name
        this.description = description
        this.who = null
        this.heat = heat ?? 0
    }
}

const alley = new Location(
    "Dark Alley",
    "A shady alleyway filled with graffiti and the smell of damp concrete.",
)

const street_corner = new Location(
    "Street Corner",
    "A busy street corner where people hustle and bustle about their day.",
    10,
)

const nightclub = new Location(
    "Nightclub",
    "A loud and vibrant nightclub with flashing lights and thumping music.",
    2,
)

const park = new Location(
    "City Park",
    "A peaceful park with green trees and a small pond, a rare oasis in the urban jungle.",
    5
)

const arcade = new Location(
    "Arcade",
    "A retro arcade filled with the sounds of pinball machines and video games.",
    3,
)

const diner = new Location(
    "24/7 Diner",
    "A classic diner that's open all night, serving comfort food to night owls and insomniacs.",
    6
)

const underpass = new Location(
    "Underpass",
    "A dimly lit underpass where the echoes of footsteps create an eerie atmosphere.",
    3,
)

const dive_bar = new Location(
    "Dive Bar",
    "A gritty dive bar with sticky floors and cheap drinks, frequented by the city's rougher crowd.",
    4,
)

export const locations: Record<string, Location> = {
    alley,
    street_corner,
    nightclub,
    park,
    arcade,
    diner,
    underpass,
    dive_bar,
}

export const shuffledLocations = () => {
    const locs = Object.keys(locations)
    .map(l => ({ value: l, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ value }) => value)
    return locs
}

export const sampleLocations = (count: number) => {
    const shuffled = shuffledLocations()
    return shuffled.slice(0, count)
}