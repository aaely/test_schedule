import { atom } from 'recoil'
import { recoilPersist } from "recoil-persist";

const { persistAtom } = recoilPersist({
    key: 'recoil-persist-session', // this key is using to store data in local storage
    storage: localStorage, // configurate which stroage will be used to store the data
  })

export const chat = atom<string>({
    key: 'chat',
    default: '',
    effects: [persistAtom]
})

export const truckForm = atom({
    key: 'truckForm',
    default: {
        door: '',
        contactEmail: '',
        scheduledDate: '',
        scheduledTime: '',
        lastFreeDate: '',
        scac: '',
    },
    effects: [persistAtom]
})

export const user = atom<string>({
    key: 'user',
    default: '',
    effects: [persistAtom]
})

export const messages = atom({
    key: 'messages',
    default: [],
    effects: [persistAtom]
})
