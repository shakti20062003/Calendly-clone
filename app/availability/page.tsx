'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { Clock, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast, Toaster } from 'sonner';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const DAYS = [
  { value: 1, label: 'Monday' },
  { value: 2, label: 'Tuesday' },
  { value: 3, label: 'Wednesday' },
  { value: 4, label: 'Thursday' },
  { value: 5, label: 'Friday' },
  { value: 6, label: 'Saturday' },
  { value: 0, label: 'Sunday' }
];

const TIMEZONES = [
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'America/Toronto',
  'Europe/London',
  'Europe/Paris',
  'Europe/Berlin',
  'Asia/Tokyo',
  'Asia/Shanghai',
  'Asia/Kolkata',
  'Australia/Sydney',
  'Pacific/Auckland',
  'UTC'
];

interface AvailabilityRule {
  id?: number;
  day_of_week: number;
  start_time: string;
  end_time: string;
}

export default function AvailabilityPage() {
  const [timezone, setTimezone] = useState('America/New_York');
  const [rules, setRules] = useState<AvailabilityRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  

  useEffect(() => {
    fetchAvailability();
  }, []);

  const fetchAvailability = async () => {
    try {
      const response = await axios.get(`${API_URL}/availability`);
      setTimezone(response.data.schedule.timezone);
      setRules(response.data.rules);
    } catch (error) {
      console.error('Error fetching availability:', error);
      toast.error('Failed to load availability settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (rules.length === 0) {
        toast.error('Please add at least one availability rule');
      return;
    }

    setSaving(true);
    try {
      await axios.put(`${API_URL}/availability`, { timezone, rules });
      toast.success('Availability settings saved successfully');
    } catch (error) {
        toast.error('Failed to save availability settings');
    } finally {
      setSaving(false);
    }
  };

  const addRule = (day: number) => {
    setRules([...rules, {
      day_of_week: day,
      start_time: '09:00:00',
      end_time: '17:00:00'
    }]);
  };

  const removeRule = (index: number) => {
    setRules(rules.filter((_, i) => i !== index));
  };

  const updateRule = (index: number, field: keyof AvailabilityRule, value: any) => {
    const newRules = [...rules];
    newRules[index] = { ...newRules[index], [field]: value };
    setRules(newRules);
  };

  const applyToAllDays = () => {
    const selectedDays = Array.from(new Set(rules.map(r => r.day_of_week)));
    if (selectedDays.length === 0) return;

    const firstRule = rules[0];
    const newRules: AvailabilityRule[] = selectedDays.map(day => ({
      day_of_week: day,
      start_time: firstRule.start_time,
      end_time: firstRule.end_time
    }));

    setRules(newRules);
  };

  const getGroupedRules = () => {
    const grouped: { [key: number]: AvailabilityRule[] } = {};
    rules.forEach((rule) => {
      if (!grouped[rule.day_of_week]) {
        grouped[rule.day_of_week] = [];
      }
      grouped[rule.day_of_week].push(rule);
    });
    return grouped;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const groupedRules = getGroupedRules();

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Toaster />

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Availability</h1>
        <p className="text-gray-600">Set your weekly availability for meetings</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="mb-6">
          <Label htmlFor="timezone">Timezone</Label>
          <Select value={timezone} onValueChange={setTimezone}>
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TIMEZONES.map((tz) => (
                <SelectItem key={tz} value={tz}>
                  {tz}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900">Weekly Hours</h3>
            {rules.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={applyToAllDays}
              >
                Apply to all selected days
              </Button>
            )}
          </div>

          <div className="space-y-3">
            {DAYS.map((day) => {
              const dayRules = groupedRules[day.value] || [];
              const hasRules = dayRules.length > 0;

              return (
                <div key={day.value} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <span className="font-medium text-gray-900 w-24">{day.label}</span>
                      {!hasRules && (
                        <span className="text-sm text-gray-500">Unavailable</span>
                      )}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => addRule(day.value)}
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Add hours
                    </Button>
                  </div>

                  {hasRules && (
                    <div className="space-y-2 ml-27">
                      {rules.map((rule, index) => {
                        if (rule.day_of_week !== day.value) return null;

                        return (
                          <div key={index} className="flex items-center space-x-2">
                            <Input
                              type="time"
                              value={rule.start_time.slice(0, 5)}
                              onChange={(e) => updateRule(index, 'start_time', e.target.value + ':00')}
                              className="w-32"
                            />
                            <span className="text-gray-500">-</span>
                            <Input
                              type="time"
                              value={rule.end_time.slice(0, 5)}
                              onChange={(e) => updateRule(index, 'end_time', e.target.value + ':00')}
                              className="w-32"
                            />
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeRule(index)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-gray-200 flex justify-end">
          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <Clock className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <h4 className="font-medium text-blue-900 mb-1">How availability works</h4>
            <p className="text-sm text-blue-800">
              Set your weekly recurring availability. When someone books a meeting, they'll only see times within these hours. You can add multiple time slots per day for flexible scheduling.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}