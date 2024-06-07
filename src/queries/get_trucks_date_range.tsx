import { api } from "../utils/api"

export const getTrucksByDateRange = async (startDate: any, endDate: any) => {
    try {
        const res = await api.post(`/api/trucks_date_range`, { startDate, endDate })
        return res.data
    } catch(error) {
        console.log(error)
    }
}