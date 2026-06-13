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
}

export interface UserPosition {
  lat: number;
  lng: number;
}
