import { api } from "../utils/api"

export const getTrucksByDate = async (date: any) => {
    try {
        const res = await api.post(`/api/todays_trucks`, { date })
        return res.data
    } catch(error) {
        console.log(error)
    }
}