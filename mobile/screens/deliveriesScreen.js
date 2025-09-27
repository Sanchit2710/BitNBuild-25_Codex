import React, { useState } from 'react';
import { Package, Clock, CheckCircle, XCircle, MapPin, Calendar, Map } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import MapViewComponent from './MapViewComponent';

interface Delivery {
  id: string;
  trackingNumber: string;
  recipient: string;
  address: string;
  status: 'pending' | 'in-transit' | 'delivered' | 'failed';
  estimatedDelivery: string;
  actualDelivery?: string;
  coords: {
    lat: number;
    lng: number;
  };
}

interface DeliveriesScreenProps {
  onNavigateToSubscription: () => void;
  onNavigateToLiveTracking: (deliveryId: string) => void;
}

const mockDeliveries: Delivery[] = [
  {
    id: '1',
    trackingNumber: 'DL001234567',
    recipient: 'John Smith',
    address: '123 Main St, New York, NY 10001',
    status: 'delivered',
    estimatedDelivery: '2024-12-20',
    actualDelivery: '2024-12-19',
    coords: { lat: 18.9200, lng: 72.8350 }
  },
  {
    id: '2',
    trackingNumber: 'DL001234568',
    recipient: 'Sarah Johnson',
    address: '456 Oak Ave, Los Angeles, CA 90210',
    status: 'in-transit',
    estimatedDelivery: '2024-12-22',
    coords: { lat: 18.9350, lng: 72.8250 }
  },
  {
    id: '3',
    trackingNumber: 'DL001234569',
    recipient: 'Mike Davis',
    address: '789 Pine Rd, Chicago, IL 60601',
    status: 'pending',
    estimatedDelivery: '2024-12-23',
    coords: { lat: 18.9100, lng: 72.8400 }
  },
  {
    id: '4',
    trackingNumber: 'DL001234570',
    recipient: 'Emily Wilson',
    address: '321 Elm St, Houston, TX 77001',
    status: 'failed',
    estimatedDelivery: '2024-12-21',
    coords: { lat: 18.9050, lng: 72.8200 }
  }
];

// Mock optimized route data
const mockOptimizedRoute = [
  { deliveryId: '1', order: 1 },
  { deliveryId: '3', order: 2 },
  { deliveryId: '2', order: 3 },
  { deliveryId: '4', order: 4 }
];

const getStatusIcon = (status: Delivery['status']) => {
  switch (status) {
    case 'pending':
      return <Clock className="w-4 h-4" />;
    case 'in-transit':
      return <Package className="w-4 h-4" />;
    case 'delivered':
      return <CheckCircle className="w-4 h-4" />;
    case 'failed':
      return <XCircle className="w-4 h-4" />;
  }
};

const getStatusColor = (status: Delivery['status']) => {
  switch (status) {
    case 'pending':
      return 'secondary';
    case 'in-transit':
      return 'default';
    case 'delivered':
      return 'default';
    case 'failed':
      return 'destructive';
    default:
      return 'secondary';
  }
};

export default function DeliveriesScreen({ onNavigateToSubscription, onNavigateToLiveTracking }: DeliveriesScreenProps) {
  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1>Delivery Management</h1>
          <p className="text-muted-foreground">Track and manage your deliveries</p>
        </div>
        <Button variant="outline" onClick={onNavigateToSubscription}>
          Subscription Settings
        </Button>
      </div>

      <Tabs defaultValue="list" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="list">List View</TabsTrigger>
          <TabsTrigger value="map" className="flex items-center gap-2">
            <Map className="w-4 h-4" />
            Map View
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="list" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-1">
        {mockDeliveries.map((delivery) => (
          <Card key={delivery.id} className="w-full">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    {getStatusIcon(delivery.status)}
                    {delivery.trackingNumber}
                  </CardTitle>
                  <p className="text-muted-foreground">{delivery.recipient}</p>
                </div>
                <Badge variant={getStatusColor(delivery.status)}>
                  {delivery.status.replace('-', ' ')}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="w-4 h-4" />
                <span>{delivery.address}</span>
              </div>
              
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="w-4 h-4" />
                <span>
                  {delivery.status === 'delivered' && delivery.actualDelivery
                    ? `Delivered on ${new Date(delivery.actualDelivery).toLocaleDateString()}`
                    : `Expected delivery: ${new Date(delivery.estimatedDelivery).toLocaleDateString()}`}
                </span>
              </div>

              <div className="flex gap-2 pt-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => onNavigateToLiveTracking(delivery.id)}
                  disabled={delivery.status === 'delivered'}
                >
                  {delivery.status === 'in-transit' ? 'Track Live' : 'Track Package'}
                </Button>
                {delivery.status === 'failed' && (
                  <Button variant="default" size="sm">
                    Retry Delivery
                  </Button>
                )}
                {delivery.status === 'pending' && (
                  <Button variant="outline" size="sm">
                    Reschedule
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Total Deliveries</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockDeliveries.length}</div>
            <p className="text-muted-foreground">This month</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Successful Deliveries</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {mockDeliveries.filter(d => d.status === 'delivered').length}
            </div>
            <p className="text-muted-foreground">
              {Math.round((mockDeliveries.filter(d => d.status === 'delivered').length / mockDeliveries.length) * 100)}% success rate
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>In Transit</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {mockDeliveries.filter(d => d.status === 'in-transit').length}
            </div>
            <p className="text-muted-foreground">Currently shipping</p>
          </CardContent>
        </Card>
          </div>
        </TabsContent>

        <TabsContent value="map" className="space-y-6">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3>Delivery Route Map</h3>
                <p className="text-muted-foreground">
                  View all deliveries on the map with optimized routing
                </p>
              </div>
              <Button variant="outline" size="sm">
                Optimize Route
              </Button>
            </div>
            
            <MapViewComponent 
              deliveries={mockDeliveries} 
              optimizedRoute={mockOptimizedRoute}
            />
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg">
                <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                <div>
                  <p className="text-sm font-medium">Delivered</p>
                  <p className="text-xs text-muted-foreground">
                    {mockDeliveries.filter(d => d.status === 'delivered').length} locations
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
                <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                <div>
                  <p className="text-sm font-medium">In Transit</p>
                  <p className="text-xs text-muted-foreground">
                    {mockDeliveries.filter(d => d.status === 'in-transit').length} locations
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-2 p-3 bg-amber-50 rounded-lg">
                <div className="w-4 h-4 bg-amber-500 rounded-full"></div>
                <div>
                  <p className="text-sm font-medium">Pending</p>
                  <p className="text-xs text-muted-foreground">
                    {mockDeliveries.filter(d => d.status === 'pending').length} locations
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-2 p-3 bg-red-50 rounded-lg">
                <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                <div>
                  <p className="text-sm font-medium">Failed</p>
                  <p className="text-xs text-muted-foreground">
                    {mockDeliveries.filter(d => d.status === 'failed').length} locations
                  </p>
                </div>
              </div>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Route Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Distance</p>
                    <p className="text-lg font-semibold">24.8 km</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Estimated Time</p>
                    <p className="text-lg font-semibold">3h 45m</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Fuel Cost</p>
                    <p className="text-lg font-semibold">₹420</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}