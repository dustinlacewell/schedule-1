export type City = {
    name: string,
    market: Market,
    button: string,
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

export type KeyBind = {
    description: string,
    // TODO: make this a part of an action map?
    exit?: boolean, // whether this keybind should exit the current menu
    action: () => void,
}

// A mapping of keyboard keys to action functions
// Can be done per menu?
export type KeyMap = Map<string, KeyBind>

export type Market = Record<string, number>

export type Player = {
    money: number,
    location: string,
    inventory: Map<string, number>,
}