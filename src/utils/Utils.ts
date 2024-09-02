import moment from "moment";
import { IS_SERVICE, LOG_LEVEL } from "./constants";
import bcrypt from 'bcryptjs';
export function printLog(...args: any[]) {
  if (IS_SERVICE) return;
  
  const formattedArgs = args.map(arg => {
    if (typeof arg === 'object' && arg !== null) {
      return JSON.stringify(arg, null, 2);
    }
    return arg;
  });
  
  console.log(...formattedArgs);
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

export async function toHashEncoding(str: string): Promise<string> {
    const SALT_ROUND = 10; 
    const hashed = await bcrypt.hash(str, SALT_ROUND);
    return hashed;
}