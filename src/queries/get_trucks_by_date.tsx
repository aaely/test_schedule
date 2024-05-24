import axios from "axios"

export const getTrucksByDate = async (date: any) => {
    try {
        console.log(date)
        const res = await axios.post('http://192.168.4.70:5555/api/todays_trucks', { date })
        return res.data
    } catch(error) {
        console.log(error)
    }
}