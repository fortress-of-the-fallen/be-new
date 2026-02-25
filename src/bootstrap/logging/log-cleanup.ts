import * as fs from 'fs';
import * as path from 'path';

// Delete old log files in the logs directory when running in the DEV environment
export function clearOldLogsIfDev() {
   if (process.env.NODE_ENV === 'development') {
      const logDir = path.join(__dirname, '..', '..', 'logs');

      if (fs.existsSync(logDir)) {
         fs.readdirSync(logDir).forEach(file => {
            const filePath = path.join(logDir, file);
            fs.unlinkSync(filePath);
         });

         console.log('Old logs have been deleted in DEV environment');
      }
   }
}
