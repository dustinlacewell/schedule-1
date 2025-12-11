
export type ItemProp = {
    key: string,
    value: any,
}

export type Item = {
    name: string,
    buyKey: string,
    sellKey: string,
    weight?: number,
    props: Record<string, any>,
}

const weed: Item = {
    name: 'Weed',
    buyKey: 'w',
    sellKey: 'W',
    props: {
        addictiveness: 0.2,
    }
}

const weedBrick: Item = {
    name: 'Weed Brick',
    buyKey: 'b',
    sellKey: 'B',
}

const coke: Item = {
    name: 'Coke',
    buyKey: 'c',
    sellKey: 'C',
    props: {
        addictiveness: 0.5
    }
}

const cokeBrick: Item = {
    name: 'Coke Brick',
    buyKey: 'b',
    sellKey: 'B',
}

const meth: Item = {
    name: 'Meth',
    buyKey: 'm',
    sellKey: 'M',
    props: {
        addictiveness: 0.8
    }
}

export const diazepam: Item = {
    name: "Diazepam",
    buyKey: "d",
    sellKey: "D",
    props: {
        addictiveness: 0.4
    }
}

export const paracetamol: Item = {
    name: "Paracetamol",
    buyKey: "p",
    sellKey: "P",
    props: {
        addictiveness: 0.1
    }
}

export const ibuprofen: Item = {
    name: "Ibuprofen",
    buyKey: "i",
    sellKey: "I",
    props: {
        addictiveness: 0.1
    }
}

export const codeine: Item = {
    name: "Codeine",
    buyKey: "c",
    sellKey: "C",
    props: {
        addictiveness: 0.6
    }
}

export const amoxicillin: Item = {
    name: "Amoxicillin",
    buyKey: "a",
    sellKey: "A",
    props: {
        addictiveness: 0.2
    }
}
