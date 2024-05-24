import { atom, selector, selectorFamily } from 'recoil'
import { recoilPersist } from 'recoil-persist'
import { Truck } from '../types/types'
import axios from 'axios'

const {persistAtom} = recoilPersist({
    key: 'recoil-persist',
    storage: localStorage
})

export const update = atom({
    key: 'update',
    default: 0
})

export const trucks = atom({
    key: 'trucks',
    default: [],
    dangerouslyAllowMutability: true,
    effects: [persistAtom]
})

export const currentTruck = atom({
    key: 'currentTruck',
    default: [],
    dangerouslyAllowMutability: true,
    effects: [persistAtom]
})

export const getCiscos = selector({
    key: 'getCiscos',
    get: async ({get}) => {
        try {
            get(update)
            const tr = get(currentTruck)
            const res = await axios.post('http://192.168.4.70:5555/api/get_cisco', {param: tr.TrailerID})
            console.log('Response:', res.data)
            return res.data
        } catch (error) {
            console.log(error)
        }
    }
})

export const recent = atom({
    key: 'recent',
    default: [],
    dangerouslyAllowMutability: true,
    effects: [persistAtom]
})

export const loadDetails = atom({
    key: 'loadDetails',
    default: [],
    dangerouslyAllowMutability: true,
    effects: [persistAtom]
})

export const todaysTrucks = selector({
    key: 'todaysTrucks',
    get: ({get}) => {
        const t = get(trucks)
        const today = new Date().toISOString().split('T')[0];
        const filtered = t.filter((trk: any) => {
            return trk.Schedule.ScheduleDate === today
        })
        console.log(filtered)
        return filtered
    },
})

export const date1 = atom({
    key: 'date1',
    default: '',
    effects: [persistAtom]
})

export const date2 = atom({
    key: 'date2',
    default: '',
    effects: [persistAtom]
})
