'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Calendar, Clock, User, Phone, Mail, MoreHorizontal } from 'lucide-react';
import { Appointment } from '@/types';
import { format } from 'date-fns';

interface AppointmentListProps {
  businessId: string;
  limit?: number;
}

export default function AppointmentList({ businessId, limit }: AppointmentListProps) {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAppointments = async () => {
    try {
      const response = await fetch(`/api/appointments?businessId=${businessId}`);
      if (!response.ok) throw new Error('Failed to fetch appointments');
      
      const data = await response.json();
      let appointmentData = data.appointments || [];
      
      // Filter to upcoming appointments only
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      appointmentData = appointmentData.filter((apt: Appointment) => {
        const aptDate = new Date(apt.date);
        return aptDate >= today && apt.status !== 'cancelled';
      });

      if (limit) {
        appointmentData = appointmentData.slice(0, limit);
      }

      setAppointments(appointmentData);
    } catch (error) {
      console.error('Error fetching appointments:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [businessId]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'no_show': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const updateAppointmentStatus = async (appointmentId: string, newStatus: string) => {
    try {
      const response = await fetch('/api/appointments', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: appointmentId, status: newStatus })
      });

      if (!response.ok) throw new Error('Failed to update appointment');
      
      // Refresh the list
      fetchAppointments();
    } catch (error) {
      console.error('Error updating appointment:', error);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Appointments</CardTitle>
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
          <Calendar size={20} />
          {limit ? 'Upcoming Appointments' : 'All Appointments'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {appointments.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No upcoming appointments
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date & Time</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {appointments.map((appointment) => (
                <TableRow key={appointment.id}>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium">
                        {format(new Date(appointment.date), 'MMM d, yyyy')}
                      </span>
                      <span className="text-sm text-gray-500 flex items-center gap-1">
                        <Clock size={12} />
                        {format(new Date(`2000-01-01T${appointment.time}`), 'h:mm a')}
                      </span>
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    {appointment.client ? (
                      <div className="flex items-center gap-2">
                        <User size={16} className="text-gray-400" />
                        <span className="font-medium">{appointment.client.name}</span>
                      </div>
                    ) : (
                      <span className="text-gray-500">No client info</span>
                    )}
                  </TableCell>
                  
                  <TableCell>
                    {appointment.client && (
                      <div className="space-y-1">
                        <div className="flex items-center gap-1 text-sm">
                          <Mail size={12} className="text-gray-400" />
                          <span>{appointment.client.email}</span>
                        </div>
                        {appointment.client.phone && (
                          <div className="flex items-center gap-1 text-sm">
                            <Phone size={12} className="text-gray-400" />
                            <span>{appointment.client.phone}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </TableCell>
                  
                  <TableCell>
                    <Badge className={getStatusColor(appointment.status)}>
                      {appointment.status}
                    </Badge>
                  </TableCell>
                  
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {appointment.status === 'scheduled' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateAppointmentStatus(appointment.id, 'confirmed')}
                        >
                          Confirm
                        </Button>
                      )}
                      {(appointment.status === 'scheduled' || appointment.status === 'confirmed') && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateAppointmentStatus(appointment.id, 'completed')}
                        >
                          Complete
                        </Button>
                      )}
                      <Button size="sm" variant="ghost">
                        <MoreHorizontal size={16} />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}