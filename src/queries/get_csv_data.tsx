import axios from "axios"

export const get_csv_data = async () => {
    try {
        const res = await axios.get('http://192.168.4.70:5555/api/trailers')
        return res.data
    } catch(error) {
        console.log(error)
    }
}