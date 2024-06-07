import { api } from '../utils/api'

export const getTrucks = async () => {
    try {
        const res = await api.get(`/api/schedule_trailer`)
        return res.data
    } catch(error) {
        console.log(error)
    }
}