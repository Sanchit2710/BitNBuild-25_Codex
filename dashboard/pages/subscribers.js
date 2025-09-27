// file: dashboard/pages/subscribers.js
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { subscribers } from '../data/mock-subscribers';

export default function SubscribersPage() {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Manage Subscribers</h1>
        <Button>+ Add New Subscriber</Button>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Subscription Plan</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Address</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {subscribers.map((sub) => (
              <TableRow key={sub.id}>
                <TableCell className="font-medium">{sub.id}</TableCell>
                <TableCell>{sub.name}</TableCell>
                <TableCell>{sub.plan}</TableCell>
                <TableCell>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    sub.status === 'Active' ? 'bg-green-200 text-green-800' : 'bg-yellow-200 text-yellow-800'
                  }`}>
                    {sub.status}
                  </span>
                </TableCell>
                <TableCell>{sub.address}</TableCell>
                <TableCell>
                  <Button variant="outline" size="sm">Edit</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}