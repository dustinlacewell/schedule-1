import { globalActions, menu, simpleHeader } from "./menu.js"


export function pharmaMenu() {
    menu({
        actions: [
            globalActions,
        ],
        header: simpleHeader("Pharmacy"),
    })
}
