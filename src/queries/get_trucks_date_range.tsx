import axios from "axios"

export const getTrucksByDateRange = async (startDate: any, endDate: any) => {
    try {
        const res = await axios.post(`http://${process.env.REACT_APP_IP_ADDR}:5555/api/trucks_date_range`, { startDate, endDate })
        return res.data
    } catch(error) {
        console.log(error)
    }
}