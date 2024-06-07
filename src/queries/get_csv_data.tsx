import { api } from "../utils/api"

export const get_csv_data = async (date: string) => {
    try {
        const res = await api.post(`/api/trailers`, { date })
        return res.data
    } catch(error) {
        console.log(error)
    }
}