import { requireOptionalNativeModule } from 'expo';

// Optional: returns null on platforms without the native module (Android/web),
// so callers can invoke setWidgetData unconditionally.
const WidgetBridge = requireOptionalNativeModule<{
  setWidgetData(json: string): void;
}>('WidgetBridge');

/**
 * Persist the JSON widget payload into the shared App Group and reload the
 * home-screen widget. No-op on platforms without the native module.
 */
export function setWidgetData(json: string): void {
  WidgetBridge?.setWidgetData(json);
}
