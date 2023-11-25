export type Styles = {
  "button-primary": string;
  "button-primary__icon": string;
  "button-primary__icon_left": string;
  "button-primary__icon_right": string;
  "button-primary_invert": string;
  "button-primary_large": string;
  "button-primary_medium": string;
  navbar: string;
  "navbar__account-widget": string;
  navbar__center: string;
  "navbar__center--item": string;
  "navbar__center--item-dropdown": string;
  navbar__dropdown: string;
  "navbar__dropdown--item": string;
  "navbar__dropdown--item-icon": string;
  "navbar__dropdown--item-text": string;
  "navbar__language-selector": string;
  navbar__left: string;
  "navbar__left--item": string;
  navbar__logo: string;
  "navbar__logo-desktop": string;
  "navbar__logo-mobile": string;
  navbar__pill: string;
  navbar__right: string;
  "navbar__right--cta": string;
  "navbar__right--item": string;
  "navbar__right--trigger": string;
  "navbar__sidebar-toggle": string;
  "z-depth-0": string;
  "z-depth-1": string;
  "z-depth-1-half": string;
  "z-depth-2": string;
  "z-depth-3": string;
  "z-depth-4": string;
  "z-depth-5": string;
};

export type ClassNames = keyof Styles;

declare const styles: Styles;

export default styles;
