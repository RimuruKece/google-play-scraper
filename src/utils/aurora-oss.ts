import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { protocol, toPlainObject } from './protocol.js';
import createDebug from 'debug';

const debug = createDebug('google-play-scraper:aurora');

export enum AuroraDevice {
  ACER_ASPIRE_ONE_CLOUDBOOK_ANDROID_6_X86_64 = 'ACER_ASPIRE_ONE_CLOUDBOOK_ANDROID_6_X86_64',
  AMAZON_FIRE_TV_2_ANDROID_5_ARM64 = 'AMAZON_FIRE_TV_2_ANDROID_5_ARM64',
  ASUS_EEEPAD_TF300T_ANDROID_4_ARMV7 = 'ASUS_EEEPAD_TF300T_ANDROID_4_ARMV7',
  ASUS_MEMO_PAD_7_ANDROID_7_X86 = 'ASUS_MEMO_PAD_7_ANDROID_7_X86',
  ASUS_ZENFONE_4_ANDROID_5_X86 = 'ASUS_ZENFONE_4_ANDROID_5_X86',
  BLACKBERRY_KEYONE_ANDROID_7_ARM64 = 'BLACKBERRY_KEYONE_ANDROID_7_ARM64',
  BRAVIA_VU2_ANDROID_11_ARMV7 = 'BRAVIA_VU2_ANDROID_11_ARMV7',
  CHUWI_V88S_ANDROID_4_ARMV7 = 'CHUWI_V88S_ANDROID_4_ARMV7',
  EXPLAY_FRESH_ANDROID_4_ARMV7 = 'EXPLAY_FRESH_ANDROID_4_ARMV7',
  FAIRPHONE_FP2_ANDROID_7_ARMV7 = 'FAIRPHONE_FP2_ANDROID_7_ARMV7',
  FLY_FS454_NIMBUS_8_ANDROID_6_ARMV7 = 'FLY_FS454_NIMBUS_8_ANDROID_6_ARMV7',
  GALAXY_S23_ULTRA = 'GALAXY_S23_ULTRA',
  GALAXY_S24 = 'GALAXY_S24',
  GALAXY_S25_ULTRA_ANDROID_15_ARM64 = 'GALAXY_S25_ULTRA_ANDROID_15_ARM64',
  GOOGLE_PIXEL_2_ANDROID_9_ARM64 = 'GOOGLE_PIXEL_2_ANDROID_9_ARM64',
  GOOGLE_PIXEL_4_XL_ANDROID_10_ARM64 = 'GOOGLE_PIXEL_4_XL_ANDROID_10_ARM64',
  GOOGLE_PIXEL_ANDROID_8_ARM64 = 'GOOGLE_PIXEL_ANDROID_8_ARM64',
  GOOGLE_PLAY_GAMES_PC_ANDROID_14_X86_64 = 'GOOGLE_PLAY_GAMES_PC_ANDROID_14_X86_64',
  HTC_DESIRE_ANDROID_2_ARMV7 = 'HTC_DESIRE_ANDROID_2_ARMV7',
  HTC_EXPLORER_A310E_ANDROID_4_ARMV7 = 'HTC_EXPLORER_A310E_ANDROID_4_ARMV7',
  HUAWEI_MATE_20_ANDROID_10_ARM64 = 'HUAWEI_MATE_20_ANDROID_10_ARM64',
  HUAWEI_MATE_8_ANDROID_6_ARM64 = 'HUAWEI_MATE_8_ANDROID_6_ARM64',
  INTEL_3G_I80_ANDROID_4_X86 = 'INTEL_3G_I80_ANDROID_4_X86',
  JOLLA_ALIEN_DALVIK_ANDROID_4_ARMV7 = 'JOLLA_ALIEN_DALVIK_ANDROID_4_ARMV7',
  JOLLA_C_ANDROID_4_ARMV7 = 'JOLLA_C_ANDROID_4_ARMV7',
  MBX_M201_SMART_TV_ANDROID_4_ARMV7 = 'MBX_M201_SMART_TV_ANDROID_4_ARMV7',
  NEXTBOOK_ARES_8_ANDROID_5_X86 = 'NEXTBOOK_ARES_8_ANDROID_5_X86',
  NEXUS_10_ANDROID_8_ARMV7 = 'NEXUS_10_ANDROID_8_ARMV7',
  NEXUS_4_ANDROID_7_ARMV7 = 'NEXUS_4_ANDROID_7_ARMV7',
  NEXUS_5_ANDROID_8_ARMV7 = 'NEXUS_5_ANDROID_8_ARMV7',
  NEXUS_5X_ANDROID_8_ARM64 = 'NEXUS_5X_ANDROID_8_ARM64',
  NEXUS_6_ANDROID_8_ARMV7 = 'NEXUS_6_ANDROID_8_ARMV7',
  NEXUS_6P_ANDROID_8_ARM64 = 'NEXUS_6P_ANDROID_8_ARM64',
  NOKIA_1_3_ANDROID_10_ARM64 = 'NOKIA_1_3_ANDROID_10_ARM64',
  NOTHING_PHONE_1_ANDROID_14_ARM64 = 'NOTHING_PHONE_1_ANDROID_14_ARM64',
  NVIDIA_SHIELD_TV_PRO_2015_ANDROID_8_ARM64 = 'NVIDIA_SHIELD_TV_PRO_2015_ANDROID_8_ARM64',
  ONEPLUS_11 = 'ONEPLUS_11',
  ONEPLUS_3_ANDROID_8_ARM64 = 'ONEPLUS_3_ANDROID_8_ARM64',
  ONEPLUS_8_PRO_EEA_ANDROID_10_ARM64 = 'ONEPLUS_8_PRO_EEA_ANDROID_10_ARM64',
  ONEPLUS_ONE_ANDROID_7_ARMV7 = 'ONEPLUS_ONE_ANDROID_7_ARMV7',
  OPPO_R17_ANDROID_10_ARM64 = 'OPPO_R17_ANDROID_10_ARM64',
  PIXEL_7_PRO = 'PIXEL_7_PRO',
  PIXEL_7A_ANDROID_13_ARM64 = 'PIXEL_7A_ANDROID_13_ARM64',
  PIXEL_8_PRO = 'PIXEL_8_PRO',
  PIXEL_9_PRO_FOLD_ANDROID_15_ARM64 = 'PIXEL_9_PRO_FOLD_ANDROID_15_ARM64',
  PIXEL_9A_ANDROID_15_ARM64 = 'PIXEL_9A_ANDROID_15_ARM64',
  PIXEL_TABLET_ANDROID_13_ARM64 = 'PIXEL_TABLET_ANDROID_13_ARM64',
  POCO_F1_ANDROID_11_ARM64 = 'POCO_F1_ANDROID_11_ARM64',
  REALME_5_PRO_ANDROID_10_ARMV7 = 'REALME_5_PRO_ANDROID_10_ARMV7',
  REALME_5I_ANDROID_10_ARM64 = 'REALME_5I_ANDROID_10_ARM64',
  REDMI_7_ANDROID_10_ARM64 = 'REDMI_7_ANDROID_10_ARM64',
  REDMI_NOTE_12_4G_ANDROID_13_ARM64 = 'REDMI_NOTE_12_4G_ANDROID_13_ARM64',
  SAMSUNG_A13_5G_ANDROID_13_ARMV7 = 'SAMSUNG_A13_5G_ANDROID_13_ARMV7',
  SAMSUNG_F34_5G_ANDROID_14_ARM64 = 'SAMSUNG_F34_5G_ANDROID_14_ARM64',
  SAMSUNG_GALAXY_NEXUS_ANDROID_6_ARMV7 = 'SAMSUNG_GALAXY_NEXUS_ANDROID_6_ARMV7',
  SAMSUNG_GALAXY_S3_ANDROID_7_ARMV7 = 'SAMSUNG_GALAXY_S3_ANDROID_7_ARMV7',
  SAMSUNG_GALAXY_S7_EDGE_ANDROID_8_ARM64 = 'SAMSUNG_GALAXY_S7_EDGE_ANDROID_8_ARM64',
  SAMSUNG_GALAXY_TAB_10_1_ANDROID_7_ARMV7 = 'SAMSUNG_GALAXY_TAB_10_1_ANDROID_7_ARMV7',
  SAMSUNG_GALAXY_TAB_S3_ANDROID_7_ARM64 = 'SAMSUNG_GALAXY_TAB_S3_ANDROID_7_ARM64',
  SAMSUNG_J5_PRIME_ANDROID_10_ARMV7 = 'SAMSUNG_J5_PRIME_ANDROID_10_ARMV7',
  SAMSUNG_S20_PLUS_ANDROID_13_ARM64 = 'SAMSUNG_S20_PLUS_ANDROID_13_ARM64',
  SONY_BRAVIA_4K_GB_ANDROID_7_ARMV7 = 'SONY_BRAVIA_4K_GB_ANDROID_7_ARMV7',
  SONY_XPERIA_Z1_ANDROID_7_ARMV7 = 'SONY_XPERIA_Z1_ANDROID_7_ARMV7',
  SONY_XPERIA_Z3_COMPACT_ANDROID_7_ARMV7 = 'SONY_XPERIA_Z3_COMPACT_ANDROID_7_ARMV7',
  VIVO_Y28_V2352_ANDROID_15_ARM64 = 'VIVO_Y28_V2352_ANDROID_15_ARM64',
  VOLVO_EX30_ANDROID_12_ARM64 = 'VOLVO_EX30_ANDROID_12_ARM64',
  WETEK_PLAY_2_SMART_TV_ANDROID_6_ARMV7 = 'WETEK_PLAY_2_SMART_TV_ANDROID_6_ARMV7',
  WILEYFOX_SWIFT_ANDROID_8_ARM64 = 'WILEYFOX_SWIFT_ANDROID_8_ARM64',
  XIAOMI_11_LITE_5G_NE_ANDROID_13_ARM64 = 'XIAOMI_11_LITE_5G_NE_ANDROID_13_ARM64',
  XIAOMI_MI_A1_ANDROID_10_ARM64 = 'XIAOMI_MI_A1_ANDROID_10_ARM64',
  XIAOMI_MI5_ANDROID_8_ARM64 = 'XIAOMI_MI5_ANDROID_8_ARM64',
  XIAOMI_REDMI_NOTE_3_ANDROID_8_ARM64 = 'XIAOMI_REDMI_NOTE_3_ANDROID_8_ARM64',
  XPERIA_5_DUAL_ANDROID_10_ARM64 = 'XPERIA_5_DUAL_ANDROID_10_ARM64',
  CUSTOM = 'CUSTOM'
}

export interface DeviceProfile {
  brand: string;
  device: string;
  model: string;
  manufacturer: string;
  product: string;
  hardware: string;
  id: string;
  fingerprint: string;
  sdkVersion: number;
  releaseVersion: string;
  density: number;
  width: number;
  height: number;
  vendingVersion: string;
  vendingVersionCode: number;
  // Extra fields for complete checkin
  radio?: string;
  bootloader?: string;
  client?: string;
  googleServicesVersion?: number;
  cellOperator?: string;
  simOperator?: string;
  roaming?: string;
  timeZone?: string;
  touchScreen?: number;
  keyboard?: number;
  navigation?: number;
  screenLayout?: number;
  hasHardKeyboard?: boolean;
  hasFiveWayNavigation?: boolean;
  lowRamDevice?: boolean;
  maxNumCPUCores?: number;
  totalMemoryBytes?: number;
  glEsVersion?: number;
  glExtensions?: string[];
  sharedLibraries?: string[];
  features?: string[];
  platforms?: string[];
  locales?: string[];
}

export interface AuroraCredentials {
  email: string;
  aasToken: string;
  device?: AuroraDevice;
  deviceFile?: string;
}

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DEVICES_DIR = path.resolve(__dirname, '../../resources/devices');

const DEVICE_FILE_MAP: Record<Exclude<AuroraDevice, AuroraDevice.CUSTOM>, string> = {
  [AuroraDevice.ACER_ASPIRE_ONE_CLOUDBOOK_ANDROID_6_X86_64]: 'acer-aspire-one-cloudbook-android-6-x86-64.properties',
  [AuroraDevice.AMAZON_FIRE_TV_2_ANDROID_5_ARM64]: 'amazon-fire-tv-2-android-5-arm64.properties',
  [AuroraDevice.ASUS_EEEPAD_TF300T_ANDROID_4_ARMV7]: 'asus-eeepad-tf300t-android-4-armv7.properties',
  [AuroraDevice.ASUS_MEMO_PAD_7_ANDROID_7_X86]: 'asus-memo-pad-7-android-7-x86.properties',
  [AuroraDevice.ASUS_ZENFONE_4_ANDROID_5_X86]: 'asus-zenfone-4-android-5-x86.properties',
  [AuroraDevice.BLACKBERRY_KEYONE_ANDROID_7_ARM64]: 'blackberry-keyone-android-7-arm64.properties',
  [AuroraDevice.BRAVIA_VU2_ANDROID_11_ARMV7]: 'bravia-vu2-android-11-armv7.properties',
  [AuroraDevice.CHUWI_V88S_ANDROID_4_ARMV7]: 'chuwi-v88s-android-4-armv7.properties',
  [AuroraDevice.EXPLAY_FRESH_ANDROID_4_ARMV7]: 'explay-fresh-android-4-armv7.properties',
  [AuroraDevice.FAIRPHONE_FP2_ANDROID_7_ARMV7]: 'fairphone-fp2-android-7-armv7.properties',
  [AuroraDevice.FLY_FS454_NIMBUS_8_ANDROID_6_ARMV7]: 'fly-fs454-nimbus-8-android-6-armv7.properties',
  [AuroraDevice.GALAXY_S23_ULTRA]: 'galaxy_s23_ultra.properties',
  [AuroraDevice.GALAXY_S24]: 'galaxy_s24.properties',
  [AuroraDevice.GALAXY_S25_ULTRA_ANDROID_15_ARM64]: 'galaxy-s25-ultra-android-15-arm64.properties',
  [AuroraDevice.GOOGLE_PIXEL_2_ANDROID_9_ARM64]: 'google-pixel-2-android-9-arm64.properties',
  [AuroraDevice.GOOGLE_PIXEL_4_XL_ANDROID_10_ARM64]: 'google-pixel-4-xl-android-10-arm64.properties',
  [AuroraDevice.GOOGLE_PIXEL_ANDROID_8_ARM64]: 'google-pixel-android-8-arm64.properties',
  [AuroraDevice.GOOGLE_PLAY_GAMES_PC_ANDROID_14_X86_64]: 'google-play-games-pc-android-14-x86-64.properties',
  [AuroraDevice.HTC_DESIRE_ANDROID_2_ARMV7]: 'htc-desire-android-2-armv7.properties',
  [AuroraDevice.HTC_EXPLORER_A310E_ANDROID_4_ARMV7]: 'htc-explorer-a310e-android-4-armv7.properties',
  [AuroraDevice.HUAWEI_MATE_20_ANDROID_10_ARM64]: 'huawei-mate-20-android-10-arm64.properties',
  [AuroraDevice.HUAWEI_MATE_8_ANDROID_6_ARM64]: 'huawei-mate-8-android-6-arm64.properties',
  [AuroraDevice.INTEL_3G_I80_ANDROID_4_X86]: 'intel-3g-i80-android-4-x86.properties',
  [AuroraDevice.JOLLA_ALIEN_DALVIK_ANDROID_4_ARMV7]: 'jolla-alien-dalvik-android-4-armv7.properties',
  [AuroraDevice.JOLLA_C_ANDROID_4_ARMV7]: 'jolla-c-android-4-armv7.properties',
  [AuroraDevice.MBX_M201_SMART_TV_ANDROID_4_ARMV7]: 'mbx-m201-smart-tv-android-4-armv7.properties',
  [AuroraDevice.NEXTBOOK_ARES_8_ANDROID_5_X86]: 'nextbook-ares-8-android-5-x86.properties',
  [AuroraDevice.NEXUS_10_ANDROID_8_ARMV7]: 'nexus-10-android-8-armv7.properties',
  [AuroraDevice.NEXUS_4_ANDROID_7_ARMV7]: 'nexus-4-android-7-armv7.properties',
  [AuroraDevice.NEXUS_5_ANDROID_8_ARMV7]: 'nexus-5-android-8-armv7.properties',
  [AuroraDevice.NEXUS_5X_ANDROID_8_ARM64]: 'nexus-5x-android-8-arm64.properties',
  [AuroraDevice.NEXUS_6_ANDROID_8_ARMV7]: 'nexus-6-android-8-armv7.properties',
  [AuroraDevice.NEXUS_6P_ANDROID_8_ARM64]: 'nexus-6p-android-8-arm64.properties',
  [AuroraDevice.NOKIA_1_3_ANDROID_10_ARM64]: 'nokia-1-3-android-10-arm64.properties',
  [AuroraDevice.NOTHING_PHONE_1_ANDROID_14_ARM64]: 'nothing-phone-1-android-14-arm64.properties',
  [AuroraDevice.NVIDIA_SHIELD_TV_PRO_2015_ANDROID_8_ARM64]: 'nvidia-shield-tv-pro-2015-android-8-arm64.properties',
  [AuroraDevice.ONEPLUS_11]: 'oneplus_11.properties',
  [AuroraDevice.ONEPLUS_3_ANDROID_8_ARM64]: 'oneplus-3-android-8-arm64.properties',
  [AuroraDevice.ONEPLUS_8_PRO_EEA_ANDROID_10_ARM64]: 'oneplus-8-pro-eea-android-10-arm64.properties',
  [AuroraDevice.ONEPLUS_ONE_ANDROID_7_ARMV7]: 'oneplus-one-android-7-armv7.properties',
  [AuroraDevice.OPPO_R17_ANDROID_10_ARM64]: 'oppo-r17-android-10-arm64.properties',
  [AuroraDevice.PIXEL_7_PRO]: 'pixel_7_pro.properties',
  [AuroraDevice.PIXEL_7A_ANDROID_13_ARM64]: 'pixel-7a-android-13-arm64.properties',
  [AuroraDevice.PIXEL_8_PRO]: 'pixel_8_pro.properties',
  [AuroraDevice.PIXEL_9_PRO_FOLD_ANDROID_15_ARM64]: 'pixel-9-pro-fold-android-15-arm64.properties',
  [AuroraDevice.PIXEL_9A_ANDROID_15_ARM64]: 'pixel-9a-android-15-arm64.properties',
  [AuroraDevice.PIXEL_TABLET_ANDROID_13_ARM64]: 'pixel-tablet-android-13-arm64.properties',
  [AuroraDevice.POCO_F1_ANDROID_11_ARM64]: 'poco-f1-android-11-arm64.properties',
  [AuroraDevice.REALME_5_PRO_ANDROID_10_ARMV7]: 'realme-5-pro-android-10-armv7.properties',
  [AuroraDevice.REALME_5I_ANDROID_10_ARM64]: 'realme-5i-android-10-arm64.properties',
  [AuroraDevice.REDMI_7_ANDROID_10_ARM64]: 'redmi-7-android-10-arm64.properties',
  [AuroraDevice.REDMI_NOTE_12_4G_ANDROID_13_ARM64]: 'redmi-note-12-4g-android-13-arm64.properties',
  [AuroraDevice.SAMSUNG_A13_5G_ANDROID_13_ARMV7]: 'samsung-a13-5g-android-13-armv7.properties',
  [AuroraDevice.SAMSUNG_F34_5G_ANDROID_14_ARM64]: 'samsung-f34-5g-android-14-arm64.properties',
  [AuroraDevice.SAMSUNG_GALAXY_NEXUS_ANDROID_6_ARMV7]: 'samsung-galaxy-nexus-android-6-armv7.properties',
  [AuroraDevice.SAMSUNG_GALAXY_S3_ANDROID_7_ARMV7]: 'samsung-galaxy-s3-android-7-armv7.properties',
  [AuroraDevice.SAMSUNG_GALAXY_S7_EDGE_ANDROID_8_ARM64]: 'samsung-galaxy-s7-edge-android-8-arm64.properties',
  [AuroraDevice.SAMSUNG_GALAXY_TAB_10_1_ANDROID_7_ARMV7]: 'samsung-galaxy-tab-10-1-android-7-armv7.properties',
  [AuroraDevice.SAMSUNG_GALAXY_TAB_S3_ANDROID_7_ARM64]: 'samsung-galaxy-tab-s3-android-7-arm64.properties',
  [AuroraDevice.SAMSUNG_J5_PRIME_ANDROID_10_ARMV7]: 'samsung-j5-prime-android-10-armv7.properties',
  [AuroraDevice.SAMSUNG_S20_PLUS_ANDROID_13_ARM64]: 'samsung-s20-plus-android-13-arm64.properties',
  [AuroraDevice.SONY_BRAVIA_4K_GB_ANDROID_7_ARMV7]: 'sony-bravia-4k-gb-android-7-armv7.properties',
  [AuroraDevice.SONY_XPERIA_Z1_ANDROID_7_ARMV7]: 'sony-xperia-z1-android-7-armv7.properties',
  [AuroraDevice.SONY_XPERIA_Z3_COMPACT_ANDROID_7_ARMV7]: 'sony-xperia-z3-compact-android-7-armv7.properties',
  [AuroraDevice.VIVO_Y28_V2352_ANDROID_15_ARM64]: 'vivo-y28-v2352-android-15-arm64.properties',
  [AuroraDevice.VOLVO_EX30_ANDROID_12_ARM64]: 'volvo-ex30-android-12-arm64.properties',
  [AuroraDevice.WETEK_PLAY_2_SMART_TV_ANDROID_6_ARMV7]: 'wetek-play-2-smart-tv-android-6-armv7.properties',
  [AuroraDevice.WILEYFOX_SWIFT_ANDROID_8_ARM64]: 'wileyfox-swift-android-8-arm64.properties',
  [AuroraDevice.XIAOMI_11_LITE_5G_NE_ANDROID_13_ARM64]: 'xiaomi-11-lite-5g-ne-android-13-arm64.properties',
  [AuroraDevice.XIAOMI_MI_A1_ANDROID_10_ARM64]: 'xiaomi-mi-a1-android-10-arm64.properties',
  [AuroraDevice.XIAOMI_MI5_ANDROID_8_ARM64]: 'xiaomi-mi5-android-8-arm64.properties',
  [AuroraDevice.XIAOMI_REDMI_NOTE_3_ANDROID_8_ARM64]: 'xiaomi-redmi-note-3-android-8-arm64.properties',
  [AuroraDevice.XPERIA_5_DUAL_ANDROID_10_ARM64]: 'xperia-5-dual-android-10-arm64.properties',
};

const profileCache = new Map<string, DeviceProfile>();

const SDK_MAP: Record<number, string> = {
  34: '14', 33: '13', 32: '12', 31: '12', 30: '11', 29: '10',
  28: '9.0', 27: '8.1', 26: '8.0', 25: '7.1', 24: '7.0',
  23: '6.0', 22: '5.1', 21: '5.0', 19: '4.4'
};

export function parsePropertiesFile(filePath: string): DeviceProfile {
  const content = fs.readFileSync(filePath, 'utf-8');
  const props: Record<string, string> = {};
  content.split(/\r?\n/).forEach(line => {
    line = line.trim();
    if (!line || line.startsWith('#') || line.startsWith('!')) return;
    const idx = line.indexOf('=');
    if (idx !== -1) {
      props[line.substring(0, idx).trim()] = line.substring(idx + 1).trim();
    }
  });

  const features = splitValues(props.Features);
  return {
    brand: props['Build.BRAND'] || 'google',
    device: props['Build.DEVICE'] || 'cheetah',
    model: props['Build.MODEL'] || 'Pixel 7 Pro',
    manufacturer: props['Build.MANUFACTURER'] || 'Google',
    product: props['Build.PRODUCT'] || 'cheetah',
    hardware: props['Build.HARDWARE'] || 'cheetah',
    id: props['Build.ID'] || 'AP1A.240405.002',
    fingerprint: props['Build.FINGERPRINT'] || 'google/cheetah/cheetah:14/AP1A.240405.002/11649233:user/release-keys',
    sdkVersion: parseInt(props['Build.VERSION.SDK_INT'] || '34', 10),
    releaseVersion: props['Build.VERSION.RELEASE'] || '14',
    density: parseInt(props['Screen.Density'] || '560', 10),
    width: parseInt(props['Screen.Width'] || '1440', 10),
    height: parseInt(props['Screen.Height'] || '3120', 10),
    vendingVersion: props['Vending.versionString'] || '41.3.22-29 [0] [PR] 640887647',
    vendingVersionCode: parseInt(props['Vending.version'] || '84132210', 10),
    radio: props['Build.RADIO'],
    bootloader: props['Build.BOOTLOADER'],
    client: props.Client,
    googleServicesVersion: parseInt(props['GSF.version'] || '0', 10) || undefined,
    cellOperator: props.CellOperator,
    simOperator: props.SimOperator,
    roaming: props.Roaming,
    timeZone: props.TimeZone,
    touchScreen: parseInt(props.TouchScreen || '0', 10) || undefined,
    keyboard: parseInt(props.Keyboard || '0', 10) || undefined,
    navigation: parseInt(props.Navigation || '0', 10) || undefined,
    screenLayout: parseInt(props.ScreenLayout || '0', 10) || undefined,
    hasHardKeyboard: props.HasHardKeyboard === 'true' || undefined,
    hasFiveWayNavigation: props.HasFiveWayNavigation === 'true' || undefined,
    lowRamDevice: props.LowRamDevice === 'true' || undefined,
    maxNumCPUCores: parseInt(props.MaxNumOfCPUCores || '0', 10) || undefined,
    totalMemoryBytes: parseInt(props.TotalMemoryBytes || '0', 10) || undefined,
    glEsVersion: parseInt(props['GL.Version'] || '0', 10) || undefined,
    glExtensions: splitValues(props['GL.Extensions']),
    sharedLibraries: splitValues(props.SharedLibraries),
    features,
    platforms: splitValues(props.Platforms),
    locales: splitValues(props.Locales),
  };
}

function splitValues(value: string | undefined): string[] | undefined {
  if (!value) return undefined;
  const parts = value.split(',').filter(Boolean);
  return parts.length > 0 ? parts : undefined;
}

// Module-level state: last setAuroraOSS() call wins per process.
// Fine for typical scraper usage (one credential set); multiple callers share state.
let globalConfig: AuroraCredentials | null = null;

export function setAuroraOSS(config: AuroraCredentials): void {
  globalConfig = { ...globalConfig, ...config };
}

export function getAuroraConfig(): AuroraCredentials | null {
  return globalConfig;
}

export function resolveDeviceProfile(device?: AuroraDevice, file?: string): DeviceProfile {
  const chosenDevice = device || globalConfig?.device || AuroraDevice.PIXEL_7_PRO;
  const chosenFile = file || globalConfig?.deviceFile;

  if (chosenDevice === AuroraDevice.CUSTOM && chosenFile) {
    return parsePropertiesFile(chosenFile);
  }

  const fileName = DEVICE_FILE_MAP[chosenDevice as Exclude<AuroraDevice, AuroraDevice.CUSTOM>];
  if (!fileName) {
    return parsePropertiesFile(path.resolve(DEVICES_DIR, DEVICE_FILE_MAP[AuroraDevice.PIXEL_7_PRO]));
  }

  const filePath = path.resolve(DEVICES_DIR, fileName);

  if (profileCache.has(filePath)) {
    return profileCache.get(filePath)!;
  }

  const profile = parsePropertiesFile(filePath);
  profileCache.set(filePath, profile);
  return profile;
}

function buildDeviceConfiguration(profile: DeviceProfile) {
  const features = profile.features || [];
  return {
    touchScreen: profile.touchScreen ?? 3,
    keyboard: profile.keyboard ?? 1,
    navigation: profile.navigation ?? 1,
    screenLayout: profile.screenLayout ?? 2,
    hasHardKeyboard: profile.hasHardKeyboard ?? false,
    hasFiveWayNavigation: profile.hasFiveWayNavigation ?? false,
    lowRamDevice: profile.lowRamDevice ? 1 : 0,
    maxNumOf_CPUCores: profile.maxNumCPUCores ?? 8,
    totalMemoryBytes: profile.totalMemoryBytes ?? 8_354_971_648,
    glEsVersion: profile.glEsVersion ?? 196608,
    glExtension: profile.glExtensions ?? [],
    systemSharedLibrary: profile.sharedLibraries ?? [],
    systemAvailableFeature: features,
    nativePlatform: profile.platforms ?? ['arm64-v8a'],
    screenDensity: profile.density,
    screenWidth: profile.width,
    screenHeight: profile.height,
    systemSupportedLocale: profile.locales ?? ['en_US'],
    deviceClass: 0,
    deviceFeature: features.map((name: string) => ({ name, value: 0 })),
  };
}

const BASE_URL = 'https://android.clients.google.com';
const REQUEST_TIMEOUT = 10_000;

interface SessionTokens {
  authToken: string;
  gsfId: string;
  deviceCheckInConsistencyToken: string;
  deviceConfigToken: string;
  dfeCookie: string;
  userAgent: string;
}

const SESSION_DIR = os.homedir();

function sessionKey (email: string): string {
  return createHash('sha256').update(email).digest('hex').slice(0, 12);
}

function sessionFilePath (email: string): string {
  return path.resolve(SESSION_DIR, `.aurora_session_${sessionKey(email)}.json`);
}

function readSessionFile (email: string): SessionTokens | null {
  if (process.env.NODE_ENV === 'test') return null;
  const filePath = sessionFilePath(email);
  try {
    if (fs.existsSync(filePath)) {
      return JSON.parse(fs.readFileSync(filePath, 'utf-8')) as SessionTokens;
    }
  } catch { /* ignore */ }
  return null;
}

function writeSessionFile (email: string, tokens: SessionTokens): void {
  if (process.env.NODE_ENV === 'test') return;
  try {
    fs.writeFileSync(sessionFilePath(email), JSON.stringify(tokens, null, 2), { mode: 0o600 });
  } catch { /* ignore */ }
}

function buildUserAgent(profile: DeviceProfile): string {
  const values = {
    api: 3,
    versionCode: profile.vendingVersionCode,
    sdk: profile.sdkVersion,
    device: profile.device,
    hardware: profile.hardware,
    product: profile.product,
    platformVersionRelease: profile.releaseVersion,
    model: profile.model,
    buildId: profile.id,
    isWideScreen: 0,
    supportedAbis: (profile.platforms || ['arm64-v8a']).join(';'),
  };
  const encoded = Object.entries(values)
    .map(([k, v]) => `${k}=${v}`)
    .join(',');
  return `Android-Finsky/${profile.vendingVersion} (${encoded})`;
}

async function checkedFetch(url: string, init?: RequestInit): Promise<Response> {
  const response = await fetch(url, {
    ...init,
    signal: init?.signal ?? AbortSignal.timeout(REQUEST_TIMEOUT),
  });

  if (!response.ok) {
    throw new Error(`Google Play request failed: HTTP ${response.status}`);
  }

  return response;
}

function buildPlayHeaders(
  session: Omit<SessionTokens, 'authToken'>,
  authToken?: string,
): Record<string, string> {
  return {
    ...(authToken ? { authorization: `Bearer ${authToken}` } : {}),
    'user-agent': session.userAgent,
    'x-dfe-cookie': session.dfeCookie,
    'x-dfe-device-checkin-consistency-token': session.deviceCheckInConsistencyToken,
    'x-dfe-device-config-token': session.deviceConfigToken,
    'x-dfe-device-id': session.gsfId,
    'x-dfe-client-id': 'am-android-google',
    'x-dfe-network-type': '4',
    'x-dfe-mccmnc': '310260',
    'x-dfe-userlanguages': 'en_US',
    'accept-language': 'en_US',
    'x-dfe-request-params': 'timeoutMs=10000',
  };
}

async function checkin(profile: DeviceProfile, language: string): Promise<{
  gsfId: string;
  consistencyToken: string;
}> {
  const checkinBuf = protocol.AndroidCheckinRequest.encode({
    id: '0',
    checkin: {
      build: {
        id: profile.fingerprint,
        product: profile.hardware,
        carrier: profile.brand,
        radio: profile.radio || '',
        bootloader: profile.bootloader || '',
        client: profile.client || 'android-google',
        timestamp: Date.now(),
        googleServices: profile.googleServicesVersion ?? 203615037,
        device: profile.device,
        sdkVersion: profile.sdkVersion,
        model: profile.model,
        manufacturer: profile.manufacturer,
        buildProduct: profile.product,
        otaInstalled: false,
      },
      lastCheckinMsec: 0,
      cellOperator: profile.cellOperator || '',
      simOperator: profile.simOperator || '',
      roaming: profile.roaming || '',
      userNumber: 0,
    },
    locale: language,
    timeZone: profile.timeZone || 'UTC',
    version: 3,
    deviceConfiguration: buildDeviceConfiguration(profile),
    fragment: 0,
  }).finish();

  const response = await checkedFetch(`${BASE_URL}/checkin`, {
    method: 'POST',
    headers: {
      'app': 'com.google.android.gms',
      'content-type': 'application/x-protobuffer',
    },
    body: new Uint8Array(checkinBuf),
  });

  const checkinData = toPlainObject(
    protocol.AndroidCheckinResponse,
    new Uint8Array(await response.arrayBuffer()),
  );

  const gsfIdStr = checkinData.androidId as string | undefined;
  if (!gsfIdStr || gsfIdStr === '0') {
    throw new Error(`Checkin rejected by Google (statsOk=${checkinData.statsOk})`);
  }

  const gsfId = BigInt(gsfIdStr).toString(16);
  const consistencyToken = checkinData.deviceCheckinConsistencyToken as string;
  if (!consistencyToken) {
    throw new Error('Checkin response missing deviceCheckinConsistencyToken');
  }

  return { gsfId, consistencyToken };
}

async function uploadDeviceConfig(
  profile: DeviceProfile,
  session: Omit<SessionTokens, 'authToken'>,
): Promise<string> {
  const configBuf = protocol.UploadDeviceConfigRequest.encode({
    deviceConfiguration: buildDeviceConfiguration(profile),
  }).finish();

  const response = await checkedFetch(`${BASE_URL}/fdfe/uploadDeviceConfig`, {
    method: 'POST',
    headers: {
      ...buildPlayHeaders(session),
      'content-type': 'application/x-protobuf',
    },
    body: new Uint8Array(configBuf),
  });

  const upload = toPlainObject(
    protocol.ResponseWrapper,
    new Uint8Array(await response.arrayBuffer()),
  );

  const payload = upload.payload as Record<string, unknown> | undefined;
  const uploadDeviceConfigResponse = payload?.uploadDeviceConfigResponse as Record<string, unknown> | undefined;
  const token = uploadDeviceConfigResponse?.uploadDeviceConfigToken as string | undefined;

  if (!token) {
    throw new Error('uploadDeviceConfig response missing token');
  }

  return token;
}

async function auth(
  profile: DeviceProfile,
  credentials: AuroraCredentials,
  gsfId: string,
  language: string,
): Promise<string> {
  const authUrl = new URL(`${BASE_URL}/auth`);
  const params = new URLSearchParams({
    app: 'com.android.vending',
    oauth2_foreground: '1',
    Email: credentials.email,
    token_request_options: 'CAA4AVAB',
    client_sig: '38918a453d07199354f8b19af05ec6562ced5788',
    Token: credentials.aasToken,
    google_play_services_version: String(profile.googleServicesVersion ?? 203615037),
    check_email: '1',
    system_partition: '1',
    sdk_version: String(profile.sdkVersion),
    callerPkg: 'com.google.android.gms',
    device_country: 'us',
    lang: language,
    androidId: gsfId,
    callerSig: '38918a453d07199354f8b19af05ec6562ced5788',
    service: 'oauth2:https://www.googleapis.com/auth/googleplay',
  });
  authUrl.search = params.toString();

  const response = await fetch(authUrl.toString(), {
    method: 'POST',
    headers: {
      'app': 'com.google.android.gms',
      'device': gsfId,
      'user-agent': `GoogleAuth/1.4 (${profile.device} ${profile.id})`,
    },
    signal: AbortSignal.timeout(REQUEST_TIMEOUT),
  });

  if (!response.ok) {
    throw new Error(`Google Play authentication failed with HTTP ${response.status}`);
  }

  const body = await response.text();
  const entries = new Map(
    body.split(/\r?\n/).filter(Boolean).map((line) => {
      const idx = line.indexOf('=');
      return [line.slice(0, idx), line.slice(idx + 1)];
    }),
  );

  const token = entries.get('Auth');
  if (!token) {
    throw new Error(`Authentication failed: ${body.slice(0, 200)}`);
  }

  return token;
}

async function fetchToc(
  session: Omit<SessionTokens, 'authToken'>,
  authToken: string,
): Promise<string> {
  const response = await checkedFetch(`${BASE_URL}/fdfe/toc`, {
    headers: buildPlayHeaders(session, authToken),
  });

  const toc = toPlainObject(
    protocol.ResponseWrapper,
    new Uint8Array(await response.arrayBuffer()),
  );

  const payload = toc.payload as Record<string, unknown> | undefined;
  const tocResponse = payload?.tocResponse as Record<string, unknown> | undefined;
  const cookie = tocResponse?.cookie as string | undefined;

  if (!cookie) {
    throw new Error('TOC response missing cookie');
  }

  return cookie;
}

async function fetchDetails(
  appId: string,
  session: SessionTokens,
): Promise<Record<string, unknown>> {
  const url = new URL(`${BASE_URL}/fdfe/details`);
  url.searchParams.set('doc', appId);

  const response = await checkedFetch(url.toString(), {
    headers: buildPlayHeaders(session, session.authToken),
  });

  return toPlainObject(
    protocol.ResponseWrapper,
    new Uint8Array(await response.arrayBuffer()),
  );
}

const activeSessionPromises = new Map<string, Promise<SessionTokens>>();

async function getOrCreateSession(
  profile: DeviceProfile,
  credentials: AuroraCredentials,
  language: string,
): Promise<SessionTokens> {
  const key = sessionKey(credentials.email);
  const existing = activeSessionPromises.get(key);
  if (existing) return existing;

  const promise = (async () => {
    const userAgent = buildUserAgent(profile);

    const { gsfId, consistencyToken } = await checkin(profile, language);

    const baseSession = {
      userAgent,
      gsfId,
      deviceCheckInConsistencyToken: consistencyToken,
      dfeCookie: '',
      deviceConfigToken: '',
    };

    const deviceConfigToken = await uploadDeviceConfig(profile, baseSession);
    const sessionWithConfig = { ...baseSession, deviceConfigToken };

    const authToken = await auth(profile, credentials, gsfId, language);
    const dfeCookie = await fetchToc(sessionWithConfig, authToken);

    const fullSession: SessionTokens = {
      ...sessionWithConfig,
      authToken,
      dfeCookie,
    };

    writeSessionFile(credentials.email, fullSession);
    return fullSession;
  })().finally(() => {
    activeSessionPromises.delete(key);
  });

  activeSessionPromises.set(key, promise);
  return promise;
}

export interface AuroraAppDetails {
  version: string;
  versionCode: number;
  androidVersion: string;
  androidVersionText: string;
}

export async function fetchAuroraOSS(
  appId: string,
  opts?: { device?: AuroraDevice; deviceFile?: string }
): Promise<AuroraAppDetails | null> {
  if (!globalConfig || !globalConfig.email || !globalConfig.aasToken) {
    return null; // Not configured
  }

  const deviceProfile = resolveDeviceProfile(opts?.device, opts?.deviceFile);
  const language = 'en_US';

  let session: SessionTokens;
  try {
    const cached = readSessionFile(globalConfig.email);
    if (cached && cached.gsfId) {
      session = cached;
    } else {
      session = await getOrCreateSession(deviceProfile, globalConfig, language);
    }
  } catch (err) {
    debug('Session creation failed: %o', err);
    return null;
  }

  let data: Record<string, unknown>;
  try {
    data = await fetchDetails(appId, session);
  } catch {
    try {
      session = await getOrCreateSession(deviceProfile, globalConfig, language);
      writeSessionFile(globalConfig.email, session);
      data = await fetchDetails(appId, session);
    } catch (retryErr) {
      debug('Details fetch failed after session refresh: %o', retryErr);
      return null;
    }
  }

  const payload = data.payload as Record<string, unknown> | undefined;
  const detailsResponse = payload?.detailsResponse as Record<string, unknown> | undefined;
  const item = detailsResponse?.item as Record<string, unknown> | undefined;
  const itemDetails = item?.details as Record<string, unknown> | undefined;
  const appDetails = itemDetails?.appDetails as Record<string, unknown> | undefined;

  if (!appDetails) {
    return null;
  }

  const versionString = appDetails.versionString as string | undefined;
  const versionCodeNum = appDetails.versionCode as number | string | undefined;
  const targetSdk = appDetails.targetSdkVersion as number | string | undefined;

  const sdk = targetSdk ? Number(targetSdk) : deviceProfile.sdkVersion;
  const ver = SDK_MAP[sdk] || String(sdk - 20 > 0 ? sdk - 20 : 5);

  return {
    version: versionString || 'VARY',
    versionCode: versionCodeNum ? Number(versionCodeNum) : 0,
    androidVersion: ver,
    androidVersionText: `${ver} and up`,
  };
}
