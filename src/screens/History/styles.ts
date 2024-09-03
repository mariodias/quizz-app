import { StyleSheet } from 'react-native';

import { THEME } from '../../styles/theme';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.COLORS.GREY_800,
  },
  history: {
    padding: 32,
    flexGrow: 1,
  },
  swipeableRemove: {
    backgroundColor: THEME.COLORS.DANGER_LIGHT,
    borderTopLeftRadius: 6,
    borderBottomLeftRadius: 6,
    width: 90,
    height: 90,
    justifyContent: 'center',
    alignItems: 'center',
  },
  swipeableContainer: {
    width: '100%',
    backgroundColor: THEME.COLORS.DANGER_LIGHT,
    borderRadius: 6,
    height: 90,
    marginBottom: 12,
  },
});