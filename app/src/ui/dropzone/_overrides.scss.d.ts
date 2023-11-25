export type Styles = {
  dropzone: string;
  "dz-clickable": string;
  "dz-drag-hover": string;
  "dz-message": string;
  "dz-preview": string;
  "dz-started": string;
};

export type ClassNames = keyof Styles;

declare const styles: Styles;

export default styles;
