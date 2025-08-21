'use client';

import { useState, useEffect } from 'react';
import { Calendar, Users, Clock, TrendingUp } from 'lucide-react';
import StatsCard from '@/components/dashboard/StatsCard';
import AppointmentList from '@/components/dashboard/AppointmentList';
import ClientList from '@/components/dashboard/ClientList';
import CalendarView from '@/components/calendar/CalendarView';

// For MVP, we'll use a hardcoded business ID
// In production, this would come from authentication
const DEMO_BUSINESS_ID = '00000000-0000-0000-0000-000000000001';

export default function DashboardPage() {
  const [stats, setStats] = useState({
    todayAppointments: 0,
    totalClients: 0,
    monthlyAppointments: 0,
    completionRate: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  const fetchStats = async () => {
    try {
      // Fetch today's appointments
      const today = new Date().toISOString().split('T')[0];
      const todayResponse = await fetch(`/api/appointments?businessId=${DEMO_BUSINESS_ID}&date=${today}`);
      const todayData = await todayResponse.json();
      const todayAppointments = todayData.appointments?.length || 0;

      // Fetch all clients
      const clientsResponse = await fetch(`/api/clients?businessId=${DEMO_BUSINESS_ID}`);
      const clientsData = await clientsResponse.json();
      const totalClients = clientsData.clients?.length || 0;

      // Fetch this month's appointments
      const monthStart = new Date();
      monthStart.setDate(1);
      const monthEnd = new Date();
      monthEnd.setMonth(monthEnd.getMonth() + 1);
      monthEnd.setDate(0);

      const monthResponse = await fetch(`/api/appointments?businessId=${DEMO_BUSINESS_ID}`);
      const monthData = await monthResponse.json();
      const monthlyAppointments = monthData.appointments?.filter((apt: { date: string }) => {
        const aptDate = new Date(apt.date);
        return aptDate >= monthStart && aptDate <= monthEnd;
      }).length || 0;

      // Calculate completion rate
      const completedAppointments = monthData.appointments?.filter((apt: { status: string }) => 
        apt.status === 'completed'
      ).length || 0;
      const completionRate = monthlyAppointments > 0 
        ? Math.round((completedAppointments / monthlyAppointments) * 100) 
        : 0;

      setStats({
        todayAppointments,
        totalClients,
        monthlyAppointments,
        completionRate
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-gray-600">Welcome back! Here&apos;s what&apos;s happening with your appointments.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Today's Appointments"
          value={isLoading ? '-' : stats.todayAppointments}
          icon={Calendar}
          description="Scheduled for today"
        />
        <StatsCard
          title="Total Clients"
          value={isLoading ? '-' : stats.totalClients}
          icon={Users}
          description="All time"
        />
        <StatsCard
          title="Monthly Appointments"
          value={isLoading ? '-' : stats.monthlyAppointments}
          icon={Clock}
          description="This month"
        />
        <StatsCard
          title="Completion Rate"
          value={isLoading ? '-' : `${stats.completionRate}%`}
          icon={TrendingUp}
          description="This month"
        />
      </div>

      {/* Calendar View */}
      <CalendarView businessId={DEMO_BUSINESS_ID} />

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AppointmentList businessId={DEMO_BUSINESS_ID} limit={5} />
        <ClientList businessId={DEMO_BUSINESS_ID} limit={5} />
      </div>
    </div>
  );
}