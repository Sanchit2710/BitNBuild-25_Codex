import React, { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { CreditCard, Calendar, Download, Wallet, Receipt, Plus, Gift, AlertCircle, CheckCircle } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface PaymentMethod {
  id: string;
  type: 'card' | 'upi' | 'wallet';
  name: string;
  details: string;
  isDefault: boolean;
  icon: React.ReactNode;
}

interface Transaction {
  id: string;
  type: 'subscription' | 'meal' | 'refund' | 'discount';
  description: string;
  amount: number;
  date: string;
  status: 'completed' | 'pending' | 'failed';
  icon: React.ReactNode;
}

export function BillingPayments() {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([
    {
      id: '1',
      type: 'card',
      name: 'Credit Card',
      details: '•••• •••• •••• 1234',
      isDefault: true,
      icon: <CreditCard className="w-5 h-5" />
    },
    {
      id: '2',
      type: 'upi',
      name: 'PhonePe',
      details: '•••••••@ybl',
      isDefault: false,
      icon: <Wallet className="w-5 h-5" />
    }
  ]);

  const [transactions] = useState<Transaction[]>([
    {
      id: '1',
      type: 'subscription',
      description: 'Premium Plan - Monthly',
      amount: -2999,
      date: 'Sept 27, 2025',
      status: 'completed',
      icon: <Calendar className="w-4 h-4" />
    },
    {
      id: '2',
      type: 'discount',
      description: 'New User Discount',
      amount: 500,
      date: 'Sept 27, 2025',
      status: 'completed',
      icon: <Gift className="w-4 h-4" />
    },
    {
      id: '3',
      type: 'subscription',
      description: 'Premium Plan - Monthly',
      amount: -2999,
      date: 'Aug 27, 2025',
      status: 'completed',
      icon: <Calendar className="w-4 h-4" />
    },
    {
      id: '4',
      type: 'refund',
      description: 'Cancelled Meal Refund',
      amount: 150,
      date: 'Aug 15, 2025',
      status: 'completed',
      icon: <CheckCircle className="w-4 h-4" />
    }
  ]);

  const [showAddPayment, setShowAddPayment] = useState(false);
  const [walletBalance, setWalletBalance] = useState(1250);
  const [showAddMoney, setShowAddMoney] = useState(false);
  const [addAmount, setAddAmount] = useState('');

  const currentBalance = 0;
  const nextBilling = 'Oct 27, 2025';

  const downloadReceipt = (transactionId: string) => {
    toast.success('Receipt downloaded successfully!');
  };

  const setDefaultPayment = (id: string) => {
    setPaymentMethods(prev => prev.map(method => ({
      ...method,
      isDefault: method.id === id
    })));
    toast.success('Default payment method updated!');
  };

  const addMoney = () => {
    const amount = parseInt(addAmount);
    if (amount > 0) {
      setWalletBalance(prev => prev + amount);
      setAddAmount('');
      setShowAddMoney(false);
      toast.success(`₹${amount} added to wallet successfully!`);
    }
  };

  const getTransactionColor = (transaction: Transaction) => {
    switch (transaction.type) {
      case 'subscription': return 'text-blue-600';
      case 'discount': return 'text-green-600';
      case 'refund': return 'text-green-600';
      case 'meal': return 'text-purple-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case 'failed':
        return <Badge className="bg-red-100 text-red-800">Failed</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-50 p-4">
      <div className="bg-[#4338CA] text-white px-4 py-4 -mx-4 -mt-4 mb-4">
        <h1 className="flex items-center gap-2">
          <Wallet className="w-5 h-5" />
          Billing & Payments
        </h1>
        <p className="text-sm opacity-90">Manage your payments & wallet</p>
      </div>

      {/* Account Balance */}
      <Card className="p-4 mb-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="flex items-center gap-2">
            <Receipt className="w-4 h-4" />
            Account Overview
          </h3>
          <Badge className="bg-[#059669] text-white animate-pulse">
            <CheckCircle className="w-3 h-3 mr-1" />
            Paid
          </Badge>
        </div>
        
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-sm text-gray-600">Current Balance</p>
            <p className="text-2xl text-[#059669]">₹{currentBalance.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Wallet Balance</p>
            <p className="text-2xl text-blue-600">₹{walletBalance.toLocaleString()}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
          <Calendar className="w-4 h-4" />
          <span>Next billing: {nextBilling}</span>
        </div>
        
        <div className="flex gap-2">
          <Dialog open={showAddMoney} onOpenChange={setShowAddMoney}>
            <DialogTrigger asChild>
              <Button variant="outline" className="flex-1">
                <Plus className="w-4 h-4 mr-2" />
                Add Money
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Add Money to Wallet</DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-gray-600 mb-2 block">Amount</label>
                  <Input
                    type="number"
                    value={addAmount}
                    onChange={(e) => setAddAmount(e.target.value)}
                    placeholder="Enter amount"
                  />
                </div>
                
                <div className="grid grid-cols-4 gap-2">
                  {[500, 1000, 2000, 5000].map(amount => (
                    <Button
                      key={amount}
                      variant="outline"
                      size="sm"
                      onClick={() => setAddAmount(amount.toString())}
                    >
                      ₹{amount}
                    </Button>
                  ))}
                </div>
                
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => setShowAddMoney(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    className="flex-1 bg-[#059669]"
                    onClick={addMoney}
                    disabled={!addAmount || parseInt(addAmount) <= 0}
                  >
                    Add ₹{addAmount || '0'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          
          <Button 
            className="flex-1 bg-[#4338CA] hover:bg-[#3730A3]"
            onClick={() => toast.info('Auto-pay is already enabled!')}
          >
            Auto-Pay: ON
          </Button>
        </div>
      </Card>

      {/* Payment Methods */}
      <Card className="p-4 mb-4">
        <div className="flex items-center justify-between mb-3">
          <h3>Payment Methods</h3>
          <Dialog open={showAddPayment} onOpenChange={setShowAddPayment}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Plus className="w-4 h-4 mr-1" />
                Add
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Add Payment Method</DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-gray-600 mb-2 block">Payment Type</label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select payment type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="card">Credit/Debit Card</SelectItem>
                      <SelectItem value="upi">UPI</SelectItem>
                      <SelectItem value="netbanking">Net Banking</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => setShowAddPayment(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    className="flex-1 bg-[#059669]"
                    onClick={() => {
                      setShowAddPayment(false);
                      toast.success('Payment method added successfully!');
                    }}
                  >
                    Add Method
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
        
        <div className="space-y-3">
          {paymentMethods.map((method) => (
            <div 
              key={method.id}
              className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-all duration-200 hover:shadow-md ${
                method.isDefault ? 'border-[#059669] bg-green-50' : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => setDefaultPayment(method.id)}
            >
              <div className={`p-2 rounded-lg ${method.isDefault ? 'bg-[#059669]' : 'bg-gray-200'} text-white`}>
                {method.icon}
              </div>
              <div className="flex-1">
                <p className="font-medium">{method.name}</p>
                <p className="text-sm text-gray-600">{method.details}</p>
              </div>
              {method.isDefault && (
                <Badge className="bg-[#059669] text-white">Default</Badge>
              )}
            </div>
          ))}
        </div>
      </Card>

      {/* Recent Transactions */}
      <Card className="p-4">
        <h3 className="mb-3">Recent Transactions</h3>
        <div className="space-y-3 max-h-64 overflow-y-auto">
          {transactions.map((transaction) => (
            <div key={transaction.id} className="flex items-center justify-between p-3 border-b last:border-b-0 hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg bg-gray-100 ${getTransactionColor(transaction)}`}>
                  {transaction.icon}
                </div>
                <div>
                  <p className="text-sm font-medium">{transaction.description}</p>
                  <div className="flex items-center gap-2">
                    <p className="text-xs text-gray-600">{transaction.date}</p>
                    {getStatusBadge(transaction.status)}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className={`text-sm font-medium ${
                  transaction.amount > 0 ? 'text-green-600' : 'text-gray-900'
                }`}>
                  {transaction.amount > 0 ? '+' : ''}₹{Math.abs(transaction.amount).toLocaleString()}
                </p>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => downloadReceipt(transaction.id)}
                  className="mt-1"
                >
                  <Download className="w-3 h-3" />
                </Button>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-4 pt-3 border-t">
          <Button variant="outline" className="w-full">
            View All Transactions
          </Button>
        </div>
      </Card>
    </div>
  );
}