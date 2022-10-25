import * as log from 'lambda-log';

export class LoggerService {

    /**
   * Logs every API transaction that results in data access
   */
     public static error(message: string, trace?:any):any {
        try {
            const msg = `ERR: [${new Date().toUTCString()}] - [${message}] - ACTION: [DEBUG]\n`;
            if (trace instanceof Error) {
              trace = trace.stack;
            } else if (trace instanceof Object) {
              trace = JSON.stringify(trace, null, 4);
            }
            log.error(msg, trace);
          } catch (err) {
            log.error(err);
          }
    }

    public static accessLog(actionName: string, input?:any):any {
        input = input ? JSON.stringify(input) : ''
        const msg = `[${new Date().toUTCString()}] - ACTION[${actionName}]`;
        log.info(msg, input)
    }
}