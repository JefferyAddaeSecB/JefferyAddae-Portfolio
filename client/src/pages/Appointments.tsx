import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import LoadingSpinner from "@/components/LoadingSpinner";

interface Appointment {
  appointmentId: string;
  email: string;
  startTime: string;
  endTime: string;
  serviceType: string;
  timezone: string;
  status: "upcoming" | "completed" | "cancelled";
  createdAt?: string;
}

interface AppointmentStats {
  total: number;
  upcoming: number;
  completed: number;
  cancelled: number;
}

export default function Appointments() {
  const [upcomingAppointments, setUpcomingAppointments] = useState<Appointment[]>([]);
  const [pastAppointments, setPastAppointments] = useState<Appointment[]>([]);
  const [stats, setStats] = useState<AppointmentStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAppointments = async () => {
    try {
      setError(null);
      const [upcomingRes, pastRes, statsRes] = await Promise.all([
        fetch("/api/appointments/upcoming"),
        fetch("/api/appointments/past"),
        fetch("/api/appointments/stats"),
      ]);

      if (!upcomingRes.ok || !pastRes.ok || !statsRes.ok) {
        throw new Error("Failed to fetch appointments");
      }

      const upcomingData = await upcomingRes.json();
      const pastData = await pastRes.json();
      const statsData = await statsRes.json();

      setUpcomingAppointments(upcomingData.data || []);
      setPastAppointments(pastData.data || []);
      setStats(statsData);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      setError(message);
      console.error("Error fetching appointments:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
    // Refresh every 30 seconds
    const interval = setInterval(fetchAppointments, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchAppointments();
    setRefreshing(false);
  };

  const formatDateTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateString;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "upcoming":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "completed":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "cancelled":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 dark:bg-gradient-to-br dark:from-slate-950 dark:to-slate-900 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 dark:bg-gradient-to-br dark:from-slate-950 dark:to-slate-900 p-6 md:p-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-6xl mx-auto"
      >
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-12">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Appointments</h1>
            <p className="text-gray-400">Manage your scheduled calls and meetings</p>
          </div>
          <Button
            onClick={handleRefresh}
            disabled={refreshing}
            className="w-full md:w-auto"
          >
            {refreshing ? "Refreshing..." : "Refresh"}
          </Button>
        </div>

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-500/10 border border-red-500/50 text-red-200 p-4 rounded-lg mb-6"
          >
            {error}
          </motion.div>
        )}

        {/* Stats Cards */}
        {stats && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ staggerChildren: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-12"
          >
            {[
              { label: "Total", value: stats.total, color: "from-purple-600 to-purple-400" },
              { label: "Upcoming", value: stats.upcoming, color: "from-blue-600 to-blue-400" },
              { label: "Completed", value: stats.completed, color: "from-green-600 to-green-400" },
              { label: "Cancelled", value: stats.cancelled, color: "from-red-600 to-red-400" },
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur">
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <p className="text-gray-400 text-sm mb-2">{stat.label}</p>
                      <p className={`text-3xl font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>
                        {stat.value}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Upcoming Appointments */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-12"
        >
          <h2 className="text-2xl font-bold text-white mb-6">Upcoming Appointments</h2>
          {upcomingAppointments.length === 0 ? (
            <Card className="bg-slate-800/50 border-slate-700/50">
              <CardContent className="pt-6">
                <p className="text-gray-400 text-center py-8">No upcoming appointments</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {upcomingAppointments.map((apt, idx) => (
                <motion.div
                  key={apt.appointmentId}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <Card className="bg-slate-800/50 border-slate-700/50 hover:border-blue-500/50 transition-colors">
                    <CardContent className="pt-6">
                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <h3 className="text-lg font-semibold text-white mb-2">
                            {apt.serviceType}
                          </h3>
                          <div className="space-y-2">
                            <p className="text-gray-400">
                              <span className="font-semibold">Date & Time:</span>{" "}
                              {formatDateTime(apt.startTime)}
                            </p>
                            <p className="text-gray-400">
                              <span className="font-semibold">Email:</span> {apt.email}
                            </p>
                            <p className="text-gray-400">
                              <span className="font-semibold">Timezone:</span> {apt.timezone}
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-col justify-between">
                          <Badge className={getStatusColor(apt.status)}>
                            {apt.status.charAt(0).toUpperCase() + apt.status.slice(1)}
                          </Badge>
                          <p className="text-sm text-gray-500">
                            ID: {apt.appointmentId.slice(0, 12)}...
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Past Appointments */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h2 className="text-2xl font-bold text-white mb-6">Past Appointments</h2>
          {pastAppointments.length === 0 ? (
            <Card className="bg-slate-800/50 border-slate-700/50">
              <CardContent className="pt-6">
                <p className="text-gray-400 text-center py-8">No past appointments</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {pastAppointments.map((apt, idx) => (
                <motion.div
                  key={apt.appointmentId}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <Card className="bg-slate-800/30 border-slate-700/30">
                    <CardContent className="pt-6">
                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-200 mb-2">
                            {apt.serviceType}
                          </h3>
                          <div className="space-y-2">
                            <p className="text-gray-500">
                              <span className="font-semibold">Date & Time:</span>{" "}
                              {formatDateTime(apt.startTime)}
                            </p>
                            <p className="text-gray-500">
                              <span className="font-semibold">Email:</span> {apt.email}
                            </p>
                            <p className="text-gray-500">
                              <span className="font-semibold">Timezone:</span> {apt.timezone}
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-col justify-between">
                          <Badge className={getStatusColor(apt.status)}>
                            {apt.status.charAt(0).toUpperCase() + apt.status.slice(1)}
                          </Badge>
                          <p className="text-xs text-gray-600">
                            ID: {apt.appointmentId.slice(0, 12)}...
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
}
