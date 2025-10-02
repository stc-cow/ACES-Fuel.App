import { Capacitor } from "@capacitor/core";
import {
  ActionPerformed,
  PushNotificationSchema,
  PushNotifications,
  Token,
} from "@capacitor/push-notifications";

import { supabase } from "./supabase";

type DriverProfile = {
  name?: string | null;
  phone?: string | null;
} | null;

let initialized = false;
let latestToken: string | null = null;
let latestProfile: DriverProfile = null;
let channelCreated = false;
let syncing = false;
let lastSyncedSignature = "";

const buildSignature = (token: string, profile: DriverProfile) => {
  const name = profile?.name?.trim() || "";
  const phone = profile?.phone?.trim() || "";
  const platform = Capacitor.getPlatform();
  return `${token}|${name}|${phone}|${platform}`;
};

const syncTokenWithServer = async () => {
  if (!latestToken) return;
  const signature = buildSignature(latestToken, latestProfile);
  if (signature === lastSyncedSignature) return;
  if (syncing) return;
  syncing = true;
  try {
    const { error } = await supabase
      .from("driver_push_tokens")
      .upsert(
        {
          token: latestToken,
          driver_name: latestProfile?.name?.trim() || null,
          driver_phone: latestProfile?.phone?.trim() || null,
          platform: Capacitor.getPlatform(),
        },
        { onConflict: "token" },
      );
    if (error) {
      console.error("Failed to sync push token", error);
      return;
    }
    lastSyncedSignature = signature;
  } catch (err) {
    console.error("Unexpected error syncing push token", err);
  } finally {
    syncing = false;
  }
};

const handleNotificationTap = (event: ActionPerformed) => {
  try {
    const data = event.notification?.data || {};
    const target =
      (typeof data.path === "string" && data.path) ||
      (typeof data.url === "string" && data.url) ||
      "/driver";

    const finalHash = target.startsWith("#")
      ? target
      : target.startsWith("/")
        ? `#${target}`
        : "#/driver";

    if (typeof window !== "undefined") {
      window.location.hash = finalHash;
    }
  } catch (err) {
    console.error("Failed to handle notification tap", err);
  }
};

const attachListeners = () => {
  PushNotifications.addListener(
    "registration",
    async (token: Token) => {
      latestToken = token.value;
      await syncTokenWithServer();
    },
  );

  PushNotifications.addListener("registrationError", (error) => {
    console.error("Push registration error", error);
  });

  PushNotifications.addListener(
    "pushNotificationReceived",
    (notification: PushNotificationSchema) => {
      console.info("Push notification received", notification);
    },
  );

  PushNotifications.addListener(
    "pushNotificationActionPerformed",
    handleNotificationTap,
  );
};

const ensureAndroidChannel = async () => {
  if (channelCreated) return;
  if (Capacitor.getPlatform() !== "android") return;
  try {
    await PushNotifications.createChannel({
      id: "driver-updates",
      name: "Driver Updates",
      description: "Fuel tasks and status updates",
      importance: 5,
      visibility: 1,
      sound: "default",
    });
    channelCreated = true;
  } catch (err) {
    console.error("Failed to create Android notification channel", err);
  }
};

export const initializePushNotifications = async (): Promise<boolean> => {
  if (!Capacitor.isNativePlatform()) return false;
  if (initialized) return true;
  initialized = true;
  try {
    const status = await PushNotifications.checkPermissions();
    let granted = status.receive === "granted";
    if (!granted) {
      const request = await PushNotifications.requestPermissions();
      granted = request.receive === "granted";
    }
    if (!granted) {
      console.warn("Push notifications permission not granted");
      return false;
    }

    attachListeners();
    await ensureAndroidChannel();
    await PushNotifications.register();
    return true;
  } catch (err) {
    initialized = false;
    console.error("Failed to initialize push notifications", err);
    return false;
  }
};

export const bindDriverToPushNotifications = async (
  profile: DriverProfile,
): Promise<void> => {
  latestProfile = profile;
  await syncTokenWithServer();
};

export const unregisterPushProfile = async () => {
  latestProfile = null;
  await syncTokenWithServer();
};
