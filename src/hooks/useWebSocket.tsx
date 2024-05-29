import { useEffect } from 'react'
import { connectWithWebSocket, disconnectWebSocket } from '../socket'

const useWebSocket = () => {
    useEffect(() => {
        connectWithWebSocket()

        return () => {
            disconnectWebSocket()
        }
    }, [])
}

export default useWebSocket