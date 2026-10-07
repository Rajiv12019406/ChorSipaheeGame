import {TextStyle} from 'react-native';

export const typography = {
  display: {
    fontFamily: 'serif',
    fontSize: 36,
    fontWeight: '700',
    letterSpacing: 1.2,
    lineHeight: 44,
  } satisfies TextStyle,
  displaySm: {
    fontFamily: 'serif',
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: 0.8,
    lineHeight: 34,
  } satisfies TextStyle,
  title: {
    fontFamily: 'serif',
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: 0.4,
    lineHeight: 28,
  } satisfies TextStyle,
  subtitle: {
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.6,
    lineHeight: 22,
  } satisfies TextStyle,
  body: {
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 24,
  } satisfies TextStyle,
  bodyBold: {
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 24,
  } satisfies TextStyle,
  caption: {
    fontSize: 13,
    fontWeight: '500',
    letterSpacing: 0.4,
    lineHeight: 18,
  } satisfies TextStyle,
  button: {
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 1.4,
    textTransform: 'uppercase',
  } satisfies TextStyle,
  overline: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 2.2,
    textTransform: 'uppercase',
  } satisfies TextStyle,
} as const;
