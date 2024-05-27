import axios from "axios"

export const get_load_info = async (tr: string) => {
    try {
        const res = await axios.post(`http://${process.env.REACT_APP_IP_ADDR}:5555/api/get_load_info`, {param: tr})
        return res.data
    } catch(error) {
        console.log(error)
    }
}