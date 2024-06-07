import { api } from '../utils/api'
export const get_load_info = async (tr: string) => {
    try {
        const res = await api.post(`/api/get_load_info`, {param: tr})
        return res.data
    } catch(error) {
        console.log(error)
    }
}