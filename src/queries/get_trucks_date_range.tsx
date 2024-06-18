import { api } from "../utils/api"

export const getTrucksByDateRange = async (date1: any, date2: any) => {
    try {
        const res = await api.post(`/api/trucks_date_range`, { date1, date2 })
        return res.data
    } catch(error) {
        console.log(error)
    }
}