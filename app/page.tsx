'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { Plus, Clock, Edit2, Trash2, Copy, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast, Toaster } from 'sonner';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

console.log('🔍 API_URL:', API_URL); 

interface EventType {
  id: number;
  name: string;
  description: string;
  duration: number;
  slug: string;
  color: string;
}

export default function HomePage() {
  const [eventTypes, setEventTypes] = useState<EventType[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<EventType | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    duration: 30,
    slug: '',
    color: '#4F46E5'
  });

  useEffect(() => {
    fetchEventTypes();
  }, []);

  const fetchEventTypes = async () => {
    try {
      const response = await axios.get(`${API_URL}/event-types`);
      setEventTypes(response.data);
    } catch (error) {
      console.error('Error fetching event types:', error);
      toast.error('Failed to load event types');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingEvent) {
        await axios.put(`${API_URL}/event-types/${editingEvent.id}`, formData);
        toast.success('Event type updated successfully');
      } else {
        await axios.post(`${API_URL}/event-types`, formData);
        toast.success('Event type created successfully');
      }
      
      setIsCreateOpen(false);
      setEditingEvent(null);
      setFormData({ name: '', description: '', duration: 30, slug: '', color: '#4F46E5' });
      fetchEventTypes();
    } catch (error: any) {
      toast.error('Failed to save event type');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this event type?')) return;
    
    try {
      await axios.delete(`${API_URL}/event-types/${id}`);
      toast.success('Event type deleted successfully');
      fetchEventTypes();
    } catch (error) {
      toast.error('Failed to delete event type');
    }
  };

  const handleEdit = (event: EventType) => {
    setEditingEvent(event);
    setFormData({
      name: event.name,
      description: event.description || '',
      duration: event.duration,
      slug: event.slug,
      color: event.color
    });
    setIsCreateOpen(true);
  };

  const copyLink = (slug: string) => {
    const url = `${window.location.origin}/${slug}`;
    navigator.clipboard.writeText(url);
    toast.success('Link copied to clipboard');
  };

  const generateSlug = (name: string) => {
    return name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  };

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
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-2 gap-3">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">My Event Types</h1>
          
          <Dialog open={isCreateOpen} onOpenChange={(open) => {
            setIsCreateOpen(open);
            if (!open) {
              setEditingEvent(null);
              setFormData({ name: '', description: '', duration: 30, slug: '', color: '#4F46E5' });
            }
          }}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700 text-sm sm:text-base w-full sm:w-auto">
                <Plus className="w-4 h-4 mr-2" />
                New Event Type
              </Button>
            </DialogTrigger>
            
            <DialogContent className="w-[95vw] sm:max-w-md max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-base sm:text-lg">{editingEvent ? 'Edit Event Type' : 'Create Event Type'}</DialogTitle>
              </DialogHeader>
              
              <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
                <div>
                  <Label htmlFor="name" className="text-sm">Event Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => {
                      setFormData({ ...formData, name: e.target.value });
                      if (!editingEvent) {
                        setFormData(prev => ({ ...prev, slug: generateSlug(e.target.value) }));
                      }
                    }}
                    placeholder="15 Minute Meeting"
                    required
                    className="text-sm"
                  />
                </div>
                
                <div>
                  <Label htmlFor="description" className="text-sm">Description (optional)</Label>
                  <Input
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Quick consultation"
                    className="text-sm"
                  />
                </div>
                
                <div>
                  <Label htmlFor="duration" className="text-sm">Duration (minutes)</Label>
                  <Input
                    id="duration"
                    type="number"
                    min="5"
                    step="5"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                    required
                    className="text-sm"
                  />
                </div>
                
                <div>
                  <Label htmlFor="slug" className="text-sm">URL Slug</Label>
                  <Input
                    id="slug"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    placeholder="15min"
                    required
                    className="text-sm"
                  />
                  <p className="text-[10px] sm:text-xs text-gray-500 mt-1 break-all">
                    {window.location.origin}/{formData.slug}
                  </p>
                </div>
                
                <div>
                  <Label htmlFor="color" className="text-sm">Color</Label>
                  <div className="flex items-center space-x-2">
                    <input
                      id="color"
                      type="color"
                      value={formData.color}
                      onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                      className="h-9 sm:h-10 w-16 sm:w-20 rounded border border-gray-300"
                      aria-label="Event color picker"
                    />
                    <Input
                      value={formData.color}
                      onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                      className="flex-1 text-sm"
                    />
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-2 pt-2 sm:pt-4">
                  <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)} className="text-sm w-full sm:w-auto">
                    Cancel
                  </Button>
                  <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-sm w-full sm:w-auto">
                    {editingEvent ? 'Update' : 'Create'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
        
        <p className="text-sm sm:text-base text-gray-600">Create and manage your event types</p>
      </div>

      {eventTypes.length === 0 ? (
        <div className="text-center py-8 sm:py-12 bg-white rounded-lg border-2 border-dashed border-gray-300">
          <Clock className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400 mx-auto mb-3 sm:mb-4" />
          <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">No event types yet</h3>
          <p className="text-sm sm:text-base text-gray-600 mb-4">Get started by creating your first event type</p>
          <Button onClick={() => setIsCreateOpen(true)} className="bg-blue-600 hover:bg-blue-700 text-sm sm:text-base">
            <Plus className="w-4 h-4 mr-2" />
            Create Event Type
          </Button>
        </div>
      ) : (
        <div className="grid gap-3 sm:gap-4">
          {eventTypes.map((event) => (
            <div
              key={event.id}
              className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex flex-col sm:flex-row items-start justify-between gap-3">
                <div className="flex items-start space-x-3 sm:space-x-4 flex-1 w-full min-w-0">
                  <div
                    className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: event.color }}
                  >
                    <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-1 truncate">{event.name}</h3>
                    {event.description && (
                      <p className="text-sm sm:text-base text-gray-600 mb-2 line-clamp-2">{event.description}</p>
                    )}
                    <div className="flex items-center text-xs sm:text-sm text-gray-500">
                      <Clock className="w-3 h-3 sm:w-4 sm:h-4 mr-1 flex-shrink-0" />
                      <span>{event.duration} min</span>
                    </div>
                    <div className="mt-2 sm:mt-3 flex flex-wrap items-center gap-1 sm:gap-2">
                      <code className="text-[10px] sm:text-xs bg-gray-100 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded truncate max-w-[200px] sm:max-w-none">
                        {window.location.origin}/{event.slug}
                      </code>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyLink(event.slug)}
                        className="h-5 sm:h-6 px-1.5 sm:px-2"
                      >
                        <Copy className="w-3 h-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => window.open(`/${event.slug}`, '_blank')}
                        className="h-5 sm:h-6 px-1.5 sm:px-2"
                      >
                        <ExternalLink className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </div>
                
                <div className="flex sm:flex-col items-center sm:items-stretch gap-2 w-full sm:w-auto">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(event)}
                    className="flex-1 sm:flex-none text-xs sm:text-sm h-8 sm:h-9"
                  >
                    <Edit2 className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-0" />
                    <span className="sm:hidden ml-2">Edit</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(event.id)}
                    className="flex-1 sm:flex-none text-red-600 hover:text-red-700 hover:bg-red-50 text-xs sm:text-sm h-8 sm:h-9"
                  >
                    <Trash2 className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-0" />
                    <span className="sm:hidden ml-2">Delete</span>
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}