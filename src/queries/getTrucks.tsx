import axios from "axios"

export const getTrucks = async () => {
    try {
        const res = await axios.get(`http://${process.env.REACT_APP_IP_ADDR}:5555/api/schedule_trailer`)
        console.log(process.env.REACT_APP_IP_ADDR)
        return res.data
    } catch(error) {
        console.log(error)
    }
}