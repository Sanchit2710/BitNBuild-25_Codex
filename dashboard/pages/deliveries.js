// file: dashboard/pages/deliveries.js
import DeliveryList from '../components/DeliveryList';
import { Button } from '@/components/ui/button';

export default function DeliveriesPage() {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Daily Deliveries</h1>
        <Button>Generate Today's Route</Button>
      </div>
      <DeliveryList />
    </div>
  );
}