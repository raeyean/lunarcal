import { Alert, type AlertButton } from 'react-native';

export type ActionMenuButton = AlertButton;

/**
 * Show a titled list of actions (issue #38). On iOS and Android this is
 * `Alert.alert` unchanged. Use it instead of `Alert.alert`, which is a no-op on
 * react-native-web; `ActionMenu.web.tsx` draws the menu itself.
 */
export function showActions(title: string, message: string | undefined, buttons: ActionMenuButton[]) {
  Alert.alert(title, message, buttons);
}

/** Renders the web menu. Native uses the system alert, so there is nothing to mount. */
export function ActionMenuHost() {
  return null;
}
