import { MutableRefObject, useEffect, useRef } from 'react'

export function useInterval(callback: any, delay: number) {
    const savedCallback: MutableRefObject<any> = useRef(null)

    useEffect(() => {
        savedCallback.current = callback
    }, [callback])

    useEffect(() => {
        function tick() {
            savedCallback?.current()
        }
        if(delay !== null) {
            const id = setInterval(tick, delay)
            return() => {clearInterval(id)}
        }
    }, [callback, delay])
}