export interface LocationVideo {
  id:    number;
  title: string;
  year:  string;
  url:   string;
  type?: 'hyperlapse' | 'standard';
}

export interface UmreLocation {
  id:               number;
  name:             string;
  lat:              number;
  lng:              number;
  description:      string;
  historicalPeriod: string;
  type:             'mosque' | 'historical' | 'mountain' | 'cave';
  videos:           LocationVideo[];
  image?:           string;
  howToGetThere?:      string;
  howToGetThereImage?: string;
  directionsVideo?:    LocationVideo;
  importantInfo?: {
    quote?:        string;
    reference?:    string;
    description?:  string;
    arabicText?:   string;
    translation?:  string;
    hadith?:       boolean;
    descriptionInline?: boolean;
    narrowSideItems?:   boolean;
    sideItemsBoxed?:    boolean;
    items?: {
      icon?: string;
      title: string;
      text:  string;
    }[];
  };
}

export interface UserPosition {
  lat: number;
  lng: number;
}
