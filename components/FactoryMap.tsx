"use client";
import { GoogleMap, Marker, useJsApiLoader } from "@react-google-maps/api";
import { Factory } from "@/lib/factories";

interface FactoryMapProps {
  factories: Factory[];
  selectedFactoryId: string;
  onSelectFactory: (id: string) => void;
  height?: string;
}

const defaultCenter = { lat: 36.5, lng: 127.8 }; // 한반도 중심

export default function FactoryMap({ factories, selectedFactoryId, onSelectFactory, height = "420px" }: FactoryMapProps) {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "", // 반드시 환경변수 필요
  });

  const handleMapLoad = (map: google.maps.Map) => {
    // 지도 클릭 시 줌 레벨 8로 설정 (마커가 아닌 지도 영역 클릭 시에만)
    map.addListener('click', (e: google.maps.MapMouseEvent) => {
      // 마커를 클릭한 것이 아닌 지도 영역을 클릭한 경우에만 줌 레벨 변경
      if (!e.placeId) {
        map.setZoom(8);
      }
    });
  };

  if (!isLoaded) return <div className="flex items-center justify-center h-[200px]">지도를 불러오는 중...</div>;

  const selected = factories.find(f => f.id === selectedFactoryId) || factories[0];
  const center = selected ? { lat: selected.lat, lng: selected.lng } : defaultCenter;

  return (
    <GoogleMap
      mapContainerStyle={{ width: "100%", height }}
      center={center}
      zoom={7}
      options={{
        disableDefaultUI: true,
        clickableIcons: false,
      }}
      onLoad={handleMapLoad}
    >
      {factories.map(f => (
        <Marker
          key={f.id}
          position={{ lat: f.lat, lng: f.lng }}
          onClick={() => onSelectFactory(f.id)}
          icon={f.id === selectedFactoryId ? {
            url: "https://maps.google.com/mapfiles/ms/icons/blue-dot.png",
            scaledSize: new window.google.maps.Size(40, 40),
          } : undefined}
        />
      ))}
    </GoogleMap>
  );
} 