import appsettings from 'src/appsettings.json';

function applyEnvOverrides(config: any, parentKey = '') {
   for (const [key, value] of Object.entries(config)) {
      const envKey = (parentKey ? `${parentKey}_${key}` : key).toUpperCase();

      if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
         applyEnvOverrides(value, envKey);
      } else {
         const envValue = process.env[envKey];
         if (envValue !== undefined) {
            if (envValue === 'true' || envValue === 'false') {
               config[key] = envValue === 'true';
            } else if (!isNaN(Number(envValue))) {
               config[key] = Number(envValue);
            } else {
               config[key] = envValue;
            }
         }
      }
   }
}

function loadConfig() {
   const config = JSON.parse(JSON.stringify(appsettings));
   applyEnvOverrides(config);
   // eslint-disable-next-line @typescript-eslint/no-unsafe-return
   return config;
}

export const config = loadConfig();
