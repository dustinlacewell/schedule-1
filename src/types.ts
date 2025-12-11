export type City = {
    name: string,
    market: Market,
    button: string,
    locations: string[],
}

export type Drug = {
    name: string,
    buttonSell: string,
    buttonBuy: string,
}

export type Action = {
    key: string,
    label: string,
    action: () => void | true,
    hidden?: boolean,
}
export type ActionRecord = Record<string, Action>

export type ActionSet = {
    render: () => void,
    handle: (key: string) => void | true,
}

export type Market = Record<string, number>

export type Player = {
    money: number,
    location: string,
    inventory: Map<string, number>,
}