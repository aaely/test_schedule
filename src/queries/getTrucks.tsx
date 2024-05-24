import axios from "axios"

export const getTrucks = async () => {
    try {
        const res = await axios.get('http://192.168.4.70:5555/api/schedule_trailer')
        return res.data
    } catch(error) {
        console.log(error)
    }
}