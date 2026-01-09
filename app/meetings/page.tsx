'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { format } from 'date-fns';
import { Calendar, Clock, Mail, User, X, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { toast, Toaster } from 'sonner';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

interface Booking {
  id: number;
  event_name: string;
  duration: number;
  color: string;
  invitee_name: string;
  invitee_email: string;
  start_time: string;
  end_time: string;
  status: string;
  cancellation_reason?: string;
}

export default function MeetingsPage() {
  const [upcomingMeetings, setUpcomingMeetings] = useState<Booking[]>([]);
  const [pastMeetings, setPastMeetings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [cancelReason, setCancelReason] = useState('');

  useEffect(() => {
    fetchMeetings();
  }, []);

  const fetchMeetings = async () => {
    try {
      const [upcomingRes, pastRes] = await Promise.all([
        axios.get(`${API_URL}/bookings?type=upcoming`),
        axios.get(`${API_URL}/bookings?type=past`)
      ]);
      
      setUpcomingMeetings(upcomingRes.data);
      setPastMeetings(pastRes.data);
    } catch (error) {
      console.error('Error fetching meetings:', error);
      toast.error('Failed to load meetings');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async () => {
    if (!selectedBooking) return;

    try {
      await axios.patch(`${API_URL}/bookings/${selectedBooking.id}/cancel`, {
        reason: cancelReason
      });
      
      toast.success('Meeting Cancelled');
      
      setCancelDialogOpen(false);
      setSelectedBooking(null);
      setCancelReason('');
      fetchMeetings();
    } catch (error) {
      toast.error('Failed to cancel meeting');
    }
  };

  const openCancelDialog = (booking: Booking) => {
    setSelectedBooking(booking);
    setCancelDialogOpen(true);
  };

  const MeetingCard = ({ booking, showCancel }: { booking: Booking; showCancel: boolean }) => (
    <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6 hover:shadow-md transition-shadow">
      <div className="flex flex-col sm:flex-row items-start justify-between gap-3 sm:gap-4">
        <div className="flex items-start space-x-3 sm:space-x-4 flex-1 w-full">
          <div
            className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: booking.color }}
          >
            <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900">{booking.event_name}</h3>
              {booking.status === 'cancelled' && (
                <span className="px-2 py-0.5 bg-red-100 text-red-700 text-[10px] sm:text-xs font-medium rounded">
                  Cancelled
                </span>
              )}
            </div>
            
            <div className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-gray-600">
              <div className="flex items-center">
                <Calendar className="w-3 h-3 sm:w-4 sm:h-4 mr-2 flex-shrink-0" />
                <span className="truncate">{format(new Date(booking.start_time), 'EEEE, MMMM d, yyyy')}</span>
              </div>
              <div className="flex items-center">
                <Clock className="w-3 h-3 sm:w-4 sm:h-4 mr-2 flex-shrink-0" />
                <span className="text-xs sm:text-sm">
                  {format(new Date(booking.start_time), 'h:mm a')} - {format(new Date(booking.end_time), 'h:mm a')}
                  {' '}({booking.duration} min)
                </span>
              </div>
              <div className="flex items-center">
                <User className="w-3 h-3 sm:w-4 sm:h-4 mr-2 flex-shrink-0" />
                <span className="truncate">{booking.invitee_name}</span>
              </div>
              <div className="flex items-center">
                <Mail className="w-3 h-3 sm:w-4 sm:h-4 mr-2 flex-shrink-0" />
                <span className="truncate">{booking.invitee_email}</span>
              </div>
              
              {booking.cancellation_reason && (
                <div className="mt-2 sm:mt-3 p-2 sm:p-3 bg-red-50 rounded-lg">
                  <div className="flex items-start space-x-2">
                    <AlertCircle className="w-3 h-3 sm:w-4 sm:h-4 text-red-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-[10px] sm:text-xs font-medium text-red-900 mb-1">Cancellation Reason</p>
                      <p className="text-xs sm:text-sm text-red-700">{booking.cancellation_reason}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {showCancel && booking.status === 'confirmed' && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => openCancelDialog(booking)}
            className="text-red-600 hover:text-red-700 hover:bg-red-50 w-full sm:w-auto text-xs sm:text-sm"
          >
            <X className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
            Cancel
          </Button>
        )}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-8">
      <Toaster />

      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Meetings</h1>
        <p className="text-sm sm:text-base text-gray-600">View and manage your scheduled meetings</p>
      </div>

      <Tabs defaultValue="upcoming" className="space-y-4 sm:space-y-6">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="upcoming" className="text-xs sm:text-sm">
            Upcoming ({upcomingMeetings.length})
          </TabsTrigger>
          <TabsTrigger value="past" className="text-xs sm:text-sm">
            Past ({pastMeetings.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="space-y-3 sm:space-y-4">
          {upcomingMeetings.length === 0 ? (
            <div className="text-center py-8 sm:py-12 bg-white rounded-lg border-2 border-dashed border-gray-300">
              <Calendar className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400 mx-auto mb-3 sm:mb-4" />
              <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">No upcoming meetings</h3>
              <p className="text-sm sm:text-base text-gray-600">Your scheduled meetings will appear here</p>
            </div>
          ) : (
            upcomingMeetings.map((booking) => (
              <MeetingCard key={booking.id} booking={booking} showCancel={true} />
            ))
          )}
        </TabsContent>

        <TabsContent value="past" className="space-y-3 sm:space-y-4">
          {pastMeetings.length === 0 ? (
            <div className="text-center py-8 sm:py-12 bg-white rounded-lg border-2 border-dashed border-gray-300">
              <Clock className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400 mx-auto mb-3 sm:mb-4" />
              <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">No past meetings</h3>
              <p className="text-sm sm:text-base text-gray-600">Your completed meetings will appear here</p>
            </div>
          ) : (
            pastMeetings.map((booking) => (
              <MeetingCard key={booking.id} booking={booking} showCancel={false} />
            ))
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <DialogContent className="w-[95vw] sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base sm:text-lg">Cancel Meeting</DialogTitle>
            <DialogDescription className="text-sm">
              Are you sure you want to cancel this meeting? The invitee will be notified.
            </DialogDescription>
          </DialogHeader>

          {selectedBooking && (
            <div className="space-y-3 sm:space-y-4">
              <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                <p className="font-medium text-gray-900 mb-2 text-sm sm:text-base">{selectedBooking.event_name}</p>
                <p className="text-xs sm:text-sm text-gray-600">
                  {format(new Date(selectedBooking.start_time), 'EEEE, MMMM d, yyyy')} at{' '}
                  {format(new Date(selectedBooking.start_time), 'h:mm a')}
                </p>
                <p className="text-xs sm:text-sm text-gray-600 mt-1">
                  with {selectedBooking.invitee_name}
                </p>
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                  Reason for cancellation (optional)
                </label>
                <textarea
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  rows={3}
                  placeholder="Let the invitee know why you're cancelling..."
                />
              </div>

              <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setCancelDialogOpen(false);
                    setCancelReason('');
                  }}
                  className="w-full sm:w-auto text-sm"
                >
                  Keep Meeting
                </Button>
                <Button
                  onClick={handleCancelBooking}
                  className="bg-red-600 hover:bg-red-700 w-full sm:w-auto text-sm"
                >
                  Cancel Meeting
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}