import { useRecoilState, useSetRecoilState } from 'recoil';
import { useEffect } from 'react';
import { ws as w } from '../Recoil/socket';
import { trucks } from '../Recoil/trucks';

const useWS = () => {
  const setWS = useSetRecoilState(w);
  const [t, setT] = useRecoilState(trucks);

  useEffect(() => {
    const ws = new WebSocket(`ws://${process.env.REACT_APP_IP_ADDR || '127.0.0.1'}:9001`);
    setWS(ws);

    ws.onopen = () => {
      console.log('WS Opened');
    };

    ws.onmessage = ({ data }) => {
      const message = JSON.parse(data);
      console.log(message);

      switch (message.type) {
        case 'hot_trailer': {
          console.log('hot_trailer', message.data.message);
          setT((prevTrucks: any) => 
            prevTrucks.map((trk: any) => {
              if (trk.TrailerID === message.data.message) {
                return {
                  ...trk,
                  Schedule: {
                    ...trk.Schedule,
                    IsHot: !trk.Schedule.IsHot,
                  },
                };
              }
              return trk;
            })
          );
          break;
        }
        case 'trailer_arrived': {
          console.log('trailer_arrived', JSON.parse(message.data.message));
          const { TrailerID, ArrivalTime } = JSON.parse(message.data.message);
          setT((prevTrucks: any) => 
            prevTrucks.map((trk: any) => {
              if (trk.TrailerID === TrailerID) {
                return {
                  ...trk,
                  Schedule: {
                    ...trk.Schedule,
                    ArrivalTime,
                  },
                };
              }
              return trk;
            })
          );
          break;
        }
        case 'schedule_trailer': {
            console.log('schedule_trailer', JSON.parse(message.data.message))
            const { TrailerID, LastFreeDate, ScheduleDate, ScheduleTime, CarrierCode, RequestDate, Door} = JSON.parse(message.data.message)
            setT((prevTrucks: any) => 
                prevTrucks.map((trk: any) => {
                    if (trk.TrailerID === TrailerID) {
                        return {
                            ...trk,
                            Schedule: {
                                ...trk.Schedule,
                                LastFreeDate,
                                ScheduleDate,
                                ScheduleTime,
                                CarrierCode,
                                RequestDate,
                                DoorNumber: Door
                            },
                        };
                    }
                    return trk;
                })
            );
            break;
        }
        case 'set_door': {
            console.log('set_door', JSON.parse(message.data.message))
            const { TrailerID, Door } = JSON.parse(message.data.message)
            setT((prevTrucks: any) => 
                prevTrucks.map((trk: any) => {
                    if (trk.TrailerID === TrailerID) {
                        console.log(trk)
                        return {
                            ...trk,
                            Schedule: {
                                ...trk.Schedule,
                                DoorNumber: Door
                            },
                        };
                    }
                    return trk;
                })
            );
            break;
        }
        default: {
          break;
        }
      }
    };

    ws.onclose = () => {
      console.log('closed');
    };

    return () => {
      console.log('closing connection');
      ws.close();
    };
  }, [setWS, setT]);

  return null;
};

export default useWS;