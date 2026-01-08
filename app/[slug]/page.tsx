'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday, isPast, startOfDay } from 'date-fns';
import { ChevronLeft, ChevronRight, Clock, Calendar as CalendarIcon, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

interface EventType {
  id: number;
  name: string;
  description: string;
  duration: number;
  color: string;
}

interface TimeSlot {
  start: string;
  end: string;
  display: string;
}

export default function BookingPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const [eventType, setEventType] = useState<EventType | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: ''
  });

  useEffect(() => {
    fetchEventType();
  }, [slug]);

  useEffect(() => {
    if (selectedDate && eventType) {
      fetchTimeSlots(selectedDate);
    }
  }, [selectedDate, eventType]);

  const fetchEventType = async () => {
    try {
      const response = await axios.get(`${API_URL}/event-types/${slug}`);
      setEventType(response.data);
    } catch (error) {
      console.error('Error fetching event type:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTimeSlots = async (date: Date) => {
    if (!eventType) return;
    
    setLoadingSlots(true);
    try {
      const dateStr = format(date, 'yyyy-MM-dd');
      const response = await axios.get(`${API_URL}/availability/${slug}/${dateStr}`, {
        params: { timezone: Intl.DateTimeFormat().resolvedOptions().timeZone }
      });
      setTimeSlots(response.data.slots);
    } catch (error) {
      console.error('Error fetching time slots:', error);
      setTimeSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSlot || !eventType) return;

    try {
      await axios.post(`${API_URL}/bookings`, {
        eventTypeId: eventType.id,
        inviteeName: formData.name,
        inviteeEmail: formData.email,
        inviteeTimezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        startTime: selectedSlot.start,
        endTime: selectedSlot.end
      });
      
      setIsConfirmed(true);
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to book appointment');
    }
  };

  const getDaysInMonth = () => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    return eachDayOfInterval({ start, end });
  };

  const getStartDayOfWeek = () => {
    return startOfMonth(currentMonth).getDay();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!eventType) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Event Not Found</h1>
          <p className="text-gray-600">This event type does not exist</p>
        </div>
      </div>
    );
  }

  if (isConfirmed) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="max-w-md w-full mx-4">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">You're scheduled!</h1>
            <p className="text-gray-600 mb-6">A calendar invitation has been sent to your email address.</p>
            
            <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
              <h3 className="font-semibold text-gray-900 mb-3">{eventType.name}</h3>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center">
                  <CalendarIcon className="w-4 h-4 mr-2" />
                  <span>{selectedDate && format(selectedDate, 'EEEE, MMMM d, yyyy')}</span>
                </div>
                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-2" />
                  <span>{selectedSlot?.display} ({eventType.duration} min)</span>
                </div>
              </div>
            </div>

            <Button onClick={() => router.push('/')} className="w-full bg-blue-600 hover:bg-blue-700">
              Schedule Another Event
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="grid md:grid-cols-5 gap-0">
            {/* Left Panel - Event Info */}
            <div className="md:col-span-2 p-8 border-r border-gray-200">
              <div className="mb-6">
                <div className="flex items-center space-x-2 text-sm text-gray-600 mb-4">
                  <CalendarIcon className="w-4 h-4" />
                  <span>John Doe</span>
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">{eventType.name}</h1>
                {eventType.description && (
                  <p className="text-gray-600 mb-4">{eventType.description}</p>
                )}
                <div className="flex items-center text-gray-600">
                  <Clock className="w-5 h-5 mr-2" />
                  <span>{eventType.duration} min</span>
                </div>
              </div>

              {selectedDate && selectedSlot && (
                <div className="mt-8">
                  <div className="bg-blue-50 rounded-lg p-4 mb-6">
                    <div className="text-sm font-medium text-blue-900 mb-1">
                      {format(selectedDate, 'EEEE, MMMM d')}
                    </div>
                    <div className="text-lg font-semibold text-blue-600">
                      {selectedSlot.display}
                    </div>
                  </div>

                  <form onSubmit={handleBooking} className="space-y-4">
                    <div>
                      <Label htmlFor="name">Name *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                        className="mt-1"
                      />
                    </div>

                    <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 mt-6">
                      Schedule Event
                    </Button>
                  </form>
                </div>
              )}
            </div>

            {/* Right Panel - Calendar & Time Slots */}
            <div className="md:col-span-3 p-8">
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Select a Date & Time</h2>

                {/* Calendar */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {format(currentMonth, 'MMMM yyyy')}
                    </h3>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                      >
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-7 gap-1">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                      <div key={day} className="text-center text-xs font-medium text-gray-600 py-2">
                        {day}
                      </div>
                    ))}

                    {Array.from({ length: getStartDayOfWeek() }).map((_, i) => (
                      <div key={`empty-${i}`} />
                    ))}

                    {getDaysInMonth().map((day) => {
                      const isSelected = selectedDate && isSameDay(day, selectedDate);
                      const isPastDay = isPast(startOfDay(day)) && !isToday(day);

                      return (
                        <button
                          key={day.toString()}
                          onClick={() => {
                            setSelectedDate(day);
                            setSelectedSlot(null);
                          }}
                          disabled={isPastDay}
                          className={`
                            aspect-square p-2 text-sm rounded-lg transition-all
                            ${isSelected ? 'bg-blue-600 text-white font-semibold' : ''}
                            ${isToday(day) && !isSelected ? 'bg-blue-50 text-blue-600 font-semibold' : ''}
                            ${!isSelected && !isToday(day) && !isPastDay ? 'hover:bg-gray-100' : ''}
                            ${isPastDay ? 'text-gray-300 cursor-not-allowed' : 'cursor-pointer'}
                          `}
                        >
                          {format(day, 'd')}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Time Slots */}
                {selectedDate && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 mb-3">
                      {format(selectedDate, 'EEEE, MMMM d')}
                    </h3>

                    {loadingSlots ? (
                      <div className="flex justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                      </div>
                    ) : timeSlots.length === 0 ? (
                      <div className="text-center py-8 text-gray-600">
                        No available time slots for this date
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-2 max-h-96 overflow-y-auto">
                        {timeSlots.map((slot) => (
                          <button
                            key={slot.start}
                            onClick={() => setSelectedSlot(slot)}
                            className={`
                              px-4 py-3 rounded-lg border text-sm font-medium transition-all
                              ${selectedSlot?.start === slot.start
                                ? 'bg-blue-600 text-white border-blue-600'
                                : 'border-gray-300 hover:border-blue-600 hover:bg-blue-50'
                              }
                            `}
                          >
                            {slot.display}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}