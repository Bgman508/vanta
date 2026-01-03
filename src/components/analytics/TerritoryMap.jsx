import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import 'leaflet/dist/leaflet.css';

const territoryCoords = {
  US: [37.0902, -95.7129],
  UK: [55.3781, -3.4360],
  CA: [56.1304, -106.3468],
  DE: [51.1657, 10.4515],
  FR: [46.2276, 2.2137],
  JP: [36.2048, 138.2529],
  AU: [-25.2744, 133.7751],
  BR: [-14.2350, -51.9253],
  MX: [23.6345, -102.5528],
  ES: [40.4637, -3.7492]
};

export default function TerritoryMap({ attendances }) {
  const territoryData = attendances.reduce((acc, a) => {
    const territory = a.territory || 'US';
    acc[territory] = (acc[territory] || 0) + 1;
    return acc;
  }, {});

  const maxCount = Math.max(...Object.values(territoryData), 1);

  return (
    <Card className="bg-neutral-900/50 border-neutral-800">
      <CardHeader>
        <CardTitle className="text-white">Territory Distribution</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-96 rounded-lg overflow-hidden">
          <MapContainer
            center={[20, 0]}
            zoom={2}
            style={{ height: '100%', width: '100%', background: '#0a0a0a' }}
            scrollWheelZoom={false}
          >
            <TileLayer
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            />
            {Object.entries(territoryData).map(([territory, count]) => {
              const coords = territoryCoords[territory];
              if (!coords) return null;

              const radius = 10 + (count / maxCount) * 30;

              return (
                <CircleMarker
                  key={territory}
                  center={coords}
                  radius={radius}
                  pathOptions={{
                    fillColor: '#6366f1',
                    fillOpacity: 0.6,
                    color: '#818cf8',
                    weight: 2
                  }}
                >
                  <Popup>
                    <div className="text-sm">
                      <p className="font-medium">{territory}</p>
                      <p className="text-xs text-neutral-600">{count} unlocks</p>
                    </div>
                  </Popup>
                </CircleMarker>
              );
            })}
          </MapContainer>
        </div>
      </CardContent>
    </Card>
  );
}