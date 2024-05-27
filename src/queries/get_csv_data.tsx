import axios from "axios"

export const get_csv_data = async (date: string) => {
    try {
        const res = await axios.post(`http://${process.env.REACT_APP_IP_ADDR}:5555/api/trailers`, { date })
        return res.data
    } catch(error) {
        console.log(error)
    }
}