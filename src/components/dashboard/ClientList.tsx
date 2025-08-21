'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Search, Users, Mail, Phone, Calendar } from 'lucide-react';
import { Client } from '@/types';
import { format } from 'date-fns';

interface ClientListProps {
  businessId: string;
  limit?: number;
}

export default function ClientList({ businessId, limit }: ClientListProps) {
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchClients = async (search?: string) => {
    try {
      const params = new URLSearchParams({ businessId });
      if (search) params.append('search', search);
      
      const response = await fetch(`/api/clients?${params}`);
      if (!response.ok) throw new Error('Failed to fetch clients');
      
      const data = await response.json();
      let clientData = data.clients || [];
      
      if (limit) {
        clientData = clientData.slice(0, limit);
      }
      
      setClients(clientData);
    } catch (error) {
      console.error('Error fetching clients:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, [businessId]);

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (searchTerm) {
        fetchClients(searchTerm);
      } else {
        fetchClients();
      }
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchTerm]);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Clients</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users size={20} />
          {limit ? 'Recent Clients' : 'All Clients'}
        </CardTitle>
        {!limit && (
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <Input
              placeholder="Search clients..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        )}
      </CardHeader>
      <CardContent>
        {clients.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            {searchTerm ? 'No clients found matching your search' : 'No clients yet'}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Client</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Appointments</TableHead>
                <TableHead>First Visit</TableHead>
                <TableHead>Last Visit</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clients.map((client) => (
                <TableRow key={client.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarFallback className="bg-blue-100 text-blue-600">
                          {getInitials(client.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{client.name}</p>
                        {client.notes && (
                          <p className="text-sm text-gray-500 truncate max-w-32">
                            {client.notes}
                          </p>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center gap-1 text-sm">
                        <Mail size={12} className="text-gray-400" />
                        <span>{client.email}</span>
                      </div>
                      {client.phone && (
                        <div className="flex items-center gap-1 text-sm">
                          <Phone size={12} className="text-gray-400" />
                          <span>{client.phone}</span>
                        </div>
                      )}
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Calendar size={14} className="text-gray-400" />
                      <span className="font-medium">{client.total_appointments}</span>
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    {client.first_visit ? (
                      <span className="text-sm">
                        {format(new Date(client.first_visit), 'MMM d, yyyy')}
                      </span>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </TableCell>
                  
                  <TableCell>
                    {client.last_visit ? (
                      <span className="text-sm">
                        {format(new Date(client.last_visit), 'MMM d, yyyy')}
                      </span>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
        
        {limit && clients.length >= limit && (
          <div className="mt-4 text-center">
            <Button variant="outline" size="sm">
              View All Clients
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}