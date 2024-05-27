import axios from "axios"

export const getTrucksByDate = async (date: any) => {
    try {
        console.log(date)
        const res = await axios.post(`http://${process.env.REACT_APP_IP_ADDR}:5555/api/todays_trucks`, { date })
        return res.data
    } catch(error) {
        console.log(error)
    }
}