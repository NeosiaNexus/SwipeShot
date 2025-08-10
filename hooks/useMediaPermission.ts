import * as MediaLibrary from 'expo-media-library';
import { useCallback, useMemo } from 'react';
import { Linking } from 'react-native';

export function useMediaPermission() {
  const [permission, request] = MediaLibrary.usePermissions();

  const status = permission?.status ?? 'undetermined';
  const canAskAgain = permission?.canAskAgain ?? true;
  const accessPrivileges = permission?.accessPrivileges ?? 'none';
  const isLimited = accessPrivileges === 'limited';

  const presentLimitedPicker = useCallback(async () => {
    await MediaLibrary.presentLimitedLibraryPickerAsync();
  }, []);

  const openSettings = useCallback(async () => {
    await Linking.openSettings();
  }, []);

  return useMemo(
    () => ({ status, request, canAskAgain, isLimited, presentLimitedPicker, openSettings }),
    [status, request, canAskAgain, isLimited, presentLimitedPicker, openSettings],
  );
}
