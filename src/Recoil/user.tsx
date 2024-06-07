import { atom } from 'recoil'
import { recoilPersist } from 'recoil-persist'

const {persistAtom} = recoilPersist({
    key: 'recoil-persist',
    storage: localStorage
})

export const token = atom({
    key: 'token',
    default: '',
    effects: [persistAtom]
})

export const role = atom({
    key: 'role',
    default: '',
    effects: [persistAtom]
})