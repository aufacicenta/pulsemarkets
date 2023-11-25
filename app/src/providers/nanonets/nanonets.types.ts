export type NanonetsResults = {
  results: Result[];
};

export type Result = {
  filename: string;
  page_data: PageData[];
};

export type PageData = {
  page: number;
  size: Size;
  words: Word[];
  raw_text: string;
};

export type Size = Record<string, number>;

export type Word = {
  text: string;
  xmin: number;
  ymin: number;
  xmax: number;
  ymax: number;
};
