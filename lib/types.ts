export interface FactoryLocation {
  id: string;
  company_name: string;
  position: {
    lat: number;
    lng: number;
  };
  address: string;
  business_type?: string;
  image?: string;
}

export interface MapViewState {
  center: { lat: number; lng: number };
  level: number;
  selectedFactoryId?: string;
}

export interface MapFilters {
  region?: string;
  businessType?: string;
  searchRadius?: number;
} 