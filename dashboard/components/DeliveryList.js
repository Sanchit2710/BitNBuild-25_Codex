// file: dashboard/components/DeliveryList.js
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { optimizedRoute } from '../data/mock-deliveries';

export default function DeliveryList() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Today's Optimized Delivery Route</CardTitle>
        <p className="text-sm text-gray-600">
          Assigned to: <strong>{optimizedRoute.deliveryPerson}</strong> ({optimizedRoute.vehicle})
        </p>
        <p className="text-sm text-gray-600">
          Est. Time: <strong>{optimizedRoute.estimatedTime}</strong>
        </p>
      </CardHeader>
      <CardContent>
        <ol className="relative border-l border-gray-200">
          {optimizedRoute.stops.map(stop => (
             <li key={stop.id} className="mb-10 ml-4">
                <div className="absolute w-3 h-3 bg-gray-200 rounded-full mt-1.5 -left-1.5 border border-white"></div>
                <h3 className="text-lg font-semibold text-gray-900">{stop.order}. {stop.subscriber}</h3>
                <p className="text-base font-normal text-gray-500">{stop.address}</p>
                <p className="text-sm text-blue-600">{stop.status}</p>
             </li>
          ))}
        </ol>
      </CardContent>
    </Card>
  );
}