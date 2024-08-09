import moment from "moment";
import { IS_SERVICE, LOG_LEVEL } from "./constants";
export function printLog(log: any, log_level?: LOG_LEVEL){

    if(IS_SERVICE)
        return;

    switch(log_level)
    {
        case LOG_LEVEL.LOG : 
            console.log(log) ;
            break;
        case LOG_LEVEL.WARNING : 
            console.warn(log);
            break;
        case LOG_LEVEL.ERROR : 
            console.error(log);
            break;
        default : 
            console.log(log) ;
            break;
    }
}

export function toDate(date: moment.Moment | string): Date {
    if (moment.isMoment(date)) {
      return date.toDate();
    }
    if (typeof date === 'string') {
      return moment(date).toDate();
    }
    throw new Error('Invalid date input');
}