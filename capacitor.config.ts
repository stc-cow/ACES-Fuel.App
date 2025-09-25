import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.aces.fuel",
  appName: "ACES Fuel",
  webDir: "dist/spa",
  server: {
    androidScheme: "https",
  },
};

export default config;
