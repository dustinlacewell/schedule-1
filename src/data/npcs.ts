export class NPC {
    name: string
    likes: string[]
    hates: string[]
    catchphrase: string = "Yo brotha!"

    constructor(
        name: string, 
        likes: string[], 
        hates: string[],
        catchphrase: string
    ) {
        this.name = name
        this.likes = likes
        this.hates = hates
        this.catchphrase = catchphrase
    }
}


const cyber = new NPC(
    "Cyber", 
    ["Weed"], 
    ["Coke"],
    "I say a lot of things all the time."
)

const ldle = new NPC("ldle", ["Weed", "Meth"], ["Coke"], "Blinks.")
const valen = new NPC("Valen", ["Coke"], ["Weed", "Meth"], "I don't know what to tell you.")

export const npcs = [
    cyber,
    ldle,
    valen,
]

export const shuffledNPCs = () => {
    const shuffled = npcs
        .map(value => ({ value, sort: Math.random() }))
        .sort((a, b) => a.sort - b.sort)
        .map(({ value }) => value)
    return shuffled
}

export const sampleNPCs = (count: number) => {
    const shuffled = shuffledNPCs()
    return shuffled.slice(0, count)
}
