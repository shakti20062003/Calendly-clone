// @ts-nocheck
require('dotenv').config({ path: '.env.local' });

const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
const moment = require('moment-timezone');

const app = express();
const PORT = process.env.PORT || 5000;


// ==================== EMAIL CONFIGURATION (GMAIL) ====================

// Configure the transporter for Brevo (Reliable)

// Email sending function
const axios = require('axios');

async function sendBookingConfirmation(booking, eventType) {
  if (!process.env.BREVO_API_KEY) {
    console.log('⚠️ Email skipped - BREVO_API_KEY not set');
    return;
  }

  try {
    const inviteeTimezone = booking.invitee_timezone || 'UTC';

    const startMoment = moment.utc(booking.start_time).tz(inviteeTimezone);
    const endMoment = moment.utc(booking.end_time).tz(inviteeTimezone);

    const formattedDate = startMoment.format('dddd, MMMM D, YYYY');
    const formattedTime = `${startMoment.format('h:mm A')} - ${endMoment.format('h:mm A')} (${startMoment.format('z')})`;


    await axios.post(
      'https://api.brevo.com/v3/smtp/email',
      {
        sender: {
          name: 'Calendly Clone',
          email: 'shaktiprasadbarik0490@gmail.com', // ✅ VERIFIED
        },
        to: [{ email: booking.invitee_email }],
        subject: `✅ Booking Confirmed: ${eventType.name}`,
        htmlContent: `
          <!DOCTYPE html>
        <html>
        <body style="margin:0;padding:0;background:#f3f4f6;font-family:Arial,Helvetica,sans-serif;">
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td align="center" style="padding:30px 10px;">
                <table width="600" cellpadding="0" cellspacing="0"
                  style="background:#ffffff;border-radius:12px;overflow:hidden;">

                  <!-- Header -->
                  <tr>
                    <td style="background:#4f46e5;color:#ffffff;padding:22px;">
                      <h1 style="margin:0;font-size:22px;">🎉 Your Meeting is Confirmed!</h1>
                    </td>
                  </tr>

                  <!-- Content -->
                  <tr>
                    <td style="padding:28px;color:#111827;">
                      <p style="font-size:16px;margin:0 0 12px;">
                        Hi <strong>${booking.invitee_name}</strong>,
                      </p>

                      <p style="font-size:15px;margin:0 0 20px;">
                        Your meeting has been successfully scheduled!
                      </p>

                      <!-- Info Card -->
                      <table width="100%" cellpadding="0" cellspacing="0"
                        style="background:#f9fafb;border-radius:10px;padding:16px;">
                        <tr>
                          <td style="padding:8px 0;">
                            📌 <strong>Event:</strong> ${eventType.name}
                          </td>
                        </tr>
                        <tr>
                          <td style="padding:8px 0;">
                            📅 <strong>Date:</strong> ${formattedDate}
                          </td>
                        </tr>
                        <tr>
                          <td style="padding:8px 0;">
                            🕒 <strong>Time:</strong> ${formattedTime}
                          </td>
                        </tr>
                        <tr>
                          <td style="padding:8px 0;">
                            ⏱ <strong>Duration:</strong> ${eventType.duration} minutes
                          </td>
                        </tr>
                      </table>

                      <p style="margin-top:20px;font-size:15px;">
                        We're looking forward to meeting with you!
                      </p>

                      <p style="margin-top:20px;font-size:14px;color:#6b7280;font-style:italic;">
                        If you need to cancel or reschedule, please contact us as soon as possible.
                      </p>
                    </td>
                  </tr>

                  <!-- Footer -->
                  <tr>
                    <td style="background:#f9fafb;padding:14px;text-align:center;font-size:12px;color:#6b7280;">
                      Powered by Calendly Clone
                    </td>
                  </tr>

                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>

        `,
      },
      {
        headers: {
          'api-key': process.env.BREVO_API_KEY,
          'Content-Type': 'application/json',
        },
      }
    );

    console.log('✅ Brevo API confirmation email sent to:', booking.invitee_email);
  } catch (error) {
    console.error(
      '❌ Brevo API email failed:',
      error.response?.data || error.message
    );
  }
}

async function sendCancellationEmail(booking, eventType, reason) {
  if (!process.env.BREVO_API_KEY) {
    console.log('⚠️ Email skipped - BREVO_API_KEY not set');
    return;
  }

  try {
    const inviteeTimezone = booking.invitee_timezone || 'UTC';

    const startMoment = moment.utc(booking.start_time).tz(inviteeTimezone);

    const formattedDate = startMoment.format('dddd, MMMM D, YYYY');


    await axios.post(
      'https://api.brevo.com/v3/smtp/email',
      {
        sender: {
          name: 'Calendly Clone',
          email: 'shaktiprasadbarik0490@gmail.com', // ✅ VERIFIED SENDER
        },
        to: [{ email: booking.invitee_email }],
        subject: `❌ Meeting Cancelled: ${eventType.name}`,
        htmlContent: `
          <!DOCTYPE html>
          <html>
          <body style="margin:0;padding:0;background:#f3f4f6;font-family:Arial,Helvetica,sans-serif;">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td align="center" style="padding:30px 10px;">
                  <table width="600" cellpadding="0" cellspacing="0"
                    style="background:#ffffff;border-radius:12px;overflow:hidden;">

                    <!-- Header -->
                    <tr>
                      <td align="center" style="background:#ef4444;color:#ffffff;padding:22px;">
                        <h1 style="margin:0;font-size:22px;">Meeting Cancelled</h1>
                      </td>
                    </tr>
                    <!-- Content -->
                    <tr>
                      <td style="padding:28px;color:#111827;">
                        <p style="font-size:16px;margin:0 0 12px;">
                          Hi <strong>${booking.invitee_name}</strong>,
                        </p>

                        <p style="font-size:15px;margin:0 0 20px;">
                          Your meeting has been cancelled.
                        </p>

                        <!-- Info Card -->
                        <table width="100%" cellpadding="0" cellspacing="0"
                          style="background:#f9fafb;border-radius:10px;padding:16px;">
                          <tr>
                            <td style="padding:8px 0;">
                              📌 <strong>Event:</strong> ${eventType.name}
                            </td>
                          </tr>
                          <tr>
                            <td style="padding:8px 0;">
                              📅 <strong>Date:</strong> ${formattedDate}
                            </td>
                          </tr>
                          ${reason
            ? `<tr>
                                  <td style="padding:8px 0;">
                                    📝 <strong>Reason:</strong> ${reason}
                                  </td>
                                </tr>`
            : ''
          }
                        </table>

                        <p style="margin-top:20px;font-size:15px;">
                          If you'd like to reschedule, please visit our booking page.
                        </p>
                      </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                      <td style="background:#f9fafb;padding:14px;text-align:center;font-size:12px;color:#6b7280;">
                        Powered by Calendly Clone
                      </td>
                    </tr>

                  </table>
                </td>
              </tr>
            </table>
          </body>
          </html>

        `,
      },
      {
        headers: {
          'api-key': process.env.BREVO_API_KEY,
          'Content-Type': 'application/json',
        },
      }
    );

    console.log('✅ Brevo API cancellation email sent to:', booking.invitee_email);
  } catch (error) {
    console.error(
      '❌ Brevo API cancellation email failed:',
      error.response?.data || error.message
    );
  }
}



// Add global error handlers
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
});

process.on('unhandledRejection', (error) => {
  console.error('❌ Unhandled Rejection:', error);
});


// ==================== SERVER SETUP ====================

console.log('🚀 Starting Calendly Clone Server (REST API mode)...');

// Supabase client (uses HTTPS - no port blocking!)
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

// Test connection
console.log('📊 Testing Supabase connection...');
supabase.from('event_types').select('count').limit(1)
  .then(({ data, error }) => {
    if (error) {
      console.error('❌ Supabase connection failed:', error.message);
    } else {
      console.log('✅ Supabase connected!');
    }
  });


// Middleware
app.use(cors());
app.use(express.json());

// Helper function to generate time slots
const generateTimeSlots = (
  date,
  rules,
  duration,
  bookedSlots,
  ownerTimezone,
  inviteeTimezone,
  bufferBefore = 0,
  bufferAfter = 0
) => {
  const slots = [];

  // Day should be decided in OWNER timezone
  const dayOfWeek = moment.tz(date, ownerTimezone).day();

  const dayRules = rules.filter((r) => r.day_of_week === dayOfWeek);

  dayRules.forEach((rule) => {
    // Create time in OWNER timezone
    const startTime = moment.tz(`${date} ${rule.start_time}`, ownerTimezone);
    const endTime = moment.tz(`${date} ${rule.end_time}`, ownerTimezone);

    let current = startTime.clone();

    while (current.clone().add(duration, "minutes").isSameOrBefore(endTime)) {
      const slotStartOwner = current.clone();
      const slotEndOwner = current.clone().add(duration, "minutes");

      // Compare bookings in UTC (IMPORTANT)
      const slotStartUTC = slotStartOwner.clone().utc();
      const slotEndUTC = slotEndOwner.clone().utc();

      const isBooked = bookedSlots.some((booking) => {
        const bookingStart = moment.utc(booking.start_time).subtract(bufferBefore, "minutes");
        const bookingEnd = moment.utc(booking.end_time).add(bufferAfter, "minutes");

        return slotStartUTC.isBefore(bookingEnd) && slotEndUTC.isAfter(bookingStart);
      });

      // Only show future slots (based on UTC for correctness)
      if (!isBooked && slotStartUTC.isAfter(moment.utc())) {
        // Convert to invitee timezone for UI display
        const slotInInvitee = slotStartOwner.clone().tz(inviteeTimezone);

        slots.push({
          start: slotStartUTC.toISOString(), // ✅ UTC stored
          end: slotEndUTC.toISOString(),     // ✅ UTC stored
          display: slotInInvitee.format("h:mm A"), // ✅ shown in invitee TZ
        });
      }

      current.add(15, "minutes");
    }
  });

  return slots;
};


// ==================== EVENT TYPES ROUTES ====================

app.get('/api/event-types', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('event_types')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/event-types/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    const { data, error } = await supabase
      .from('event_types')
      .select('*')
      .eq('slug', slug)
      .eq('is_active', true)
      .single();

    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Event type not found' });

    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/event-types', async (req, res) => {
  try {
    const { name, description, duration, slug, color } = req.body;
    const userId = 1;

    const { data, error } = await supabase
      .from('event_types')
      .insert({
        user_id: userId,
        name,
        description,
        duration,
        slug,
        color: color || '#4F46E5'
      })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        return res.status(400).json({ error: 'Slug already exists' });
      }
      throw error;
    }

    // Link to default schedule
    const { data: schedule } = await supabase
      .from('availability_schedules')
      .select('id')
      .eq('user_id', userId)
      .eq('is_default', true)
      .single();

    if (schedule) {
      await supabase
        .from('event_type_schedules')
        .insert({
          event_type_id: data.id,
          schedule_id: schedule.id
        });
    }

    res.status(201).json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.put('/api/event-types/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, duration, slug, color } = req.body;

    const { data, error } = await supabase
      .from('event_types')
      .update({
        name,
        description,
        duration,
        slug,
        color,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Event type not found' });

    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.delete('/api/event-types/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('event_types')
      .delete()
      .eq('id', id);

    if (error) throw error;

    res.json({ message: 'Event type deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ==================== AVAILABILITY ROUTES ====================

app.get('/api/availability', async (req, res) => {
  try {
    const userId = 1;

    const { data: schedule, error: scheduleError } = await supabase
      .from('availability_schedules')
      .select('*')
      .eq('user_id', userId)
      .eq('is_default', true)
      .single();

    if (scheduleError) throw scheduleError;

    const { data: rules, error: rulesError } = await supabase
      .from('availability_rules')
      .select('*')
      .eq('schedule_id', schedule.id)
      .order('day_of_week')
      .order('start_time');

    if (rulesError) throw rulesError;

    res.json({ schedule, rules });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.put('/api/availability', async (req, res) => {
  try {
    const { timezone, rules } = req.body;
    const userId = 1;

    const { data: schedule } = await supabase
      .from('availability_schedules')
      .select('id')
      .eq('user_id', userId)
      .eq('is_default', true)
      .single();

    if (!schedule) {
      return res.status(404).json({ error: 'Schedule not found' });
    }

    // Update timezone
    await supabase
      .from('availability_schedules')
      .update({ timezone })
      .eq('id', schedule.id);

    // Delete existing rules
    await supabase
      .from('availability_rules')
      .delete()
      .eq('schedule_id', schedule.id);

    // Insert new rules
    const newRules = rules.map(rule => ({
      schedule_id: schedule.id,
      day_of_week: rule.day_of_week,
      start_time: rule.start_time,
      end_time: rule.end_time
    }));

    await supabase
      .from('availability_rules')
      .insert(newRules);

    res.json({ message: 'Availability updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ==================== BOOKING ROUTES ====================

app.get('/api/availability/:slug/:date', async (req, res) => {
  try {
    const { slug, date } = req.params;

    // Invitee timezone from query
    const inviteeTimezone = req.query.timezone || 'UTC';

    // Get event type
    const { data: eventType, error: eventError } = await supabase
      .from('event_types')
      .select('*')
      .eq('slug', slug)
      .eq('is_active', true)
      .single();

    if (eventError) throw eventError;
    if (!eventType) return res.status(404).json({ error: 'Event type not found' });

    // Get schedule links
    const { data: scheduleLinks, error: scheduleLinkError } = await supabase
      .from('event_type_schedules')
      .select('schedule_id')
      .eq('event_type_id', eventType.id);

    if (scheduleLinkError) throw scheduleLinkError;

    const scheduleIds = (scheduleLinks || []).map(link => link.schedule_id);

    if (scheduleIds.length === 0) {
      return res.json({ slots: [] });
    }

    // ✅ Fetch owner's timezone from schedule
    const { data: schedules, error: scheduleErr } = await supabase
      .from('availability_schedules')
      .select('id, timezone')
      .in('id', scheduleIds);

    if (scheduleErr) throw scheduleErr;

    const ownerTimezone = schedules?.[0]?.timezone || 'UTC';

    // Fetch availability rules
    const { data: rules, error: rulesError } = await supabase
      .from('availability_rules')
      .select('*')
      .in('schedule_id', scheduleIds);

    if (rulesError) throw rulesError;

    // ✅ Get bookings only for that OWNER date range
    const startOfDayUTC = moment.tz(date, ownerTimezone).startOf('day').utc().toISOString();
    const endOfDayUTC = moment.tz(date, ownerTimezone).endOf('day').utc().toISOString();

    // ✅ Get all event types of this owner (same calendar)
    const { data: allEventTypes, error: allEventTypesError } = await supabase
      .from('event_types')
      .select('id')
      .eq('user_id', eventType.user_id)
      .eq('is_active', true);

    if (allEventTypesError) throw allEventTypesError;

    const allEventTypeIds = (allEventTypes || []).map((e) => e.id);

    // ✅ Fetch bookings of owner for this day (across all event types)
    const { data: bookings, error: bookingErr } = await supabase
      .from('bookings')
      .select('start_time, end_time')
      .in('event_type_id', allEventTypeIds)
      .eq('status', 'confirmed')
      .gte('start_time', startOfDayUTC)
      .lte('start_time', endOfDayUTC);

    if (bookingErr) throw bookingErr;

    
    const slots = generateTimeSlots(
      date,
      rules || [],
      eventType.duration,
      bookings || [],
      ownerTimezone,
      inviteeTimezone,
      eventType.buffer_before || 0,
      eventType.buffer_after || 0
    );

    res.json({
      slots,
      ownerTimezone,
      inviteeTimezone
    });
  } catch (err) {
    console.error("❌ Availability Error:", err);
    res.status(500).json({ error: 'Server error' });
  }
});


app.post('/api/bookings', async (req, res) => {
  try {
    const { eventTypeId, inviteeName, inviteeEmail, inviteeTimezone, startTime, endTime } = req.body;

    // ✅ Find owner of this event type
    const { data: currentEventType, error: currentEventTypeError } = await supabase
      .from('event_types')
      .select('user_id')
      .eq('id', eventTypeId)
      .single();

    if (currentEventTypeError) throw currentEventTypeError;

    const userId = currentEventType.user_id;

    // ✅ Get all event types of this owner
    const { data: allEventTypes, error: allEventTypesError } = await supabase
      .from('event_types')
      .select('id')
      .eq('user_id', userId)
      .eq('is_active', true);

    if (allEventTypesError) throw allEventTypesError;

    const allEventTypeIds = (allEventTypes || []).map((e) => e.id);

    // ✅ Overlap check across ALL event types of owner (this is the real fix)
    const { data: existing, error: existingError } = await supabase
      .from('bookings')
      .select('id, start_time, end_time')
      .in('event_type_id', allEventTypeIds)
      .eq('status', 'confirmed')
      .lt('start_time', endTime)   // existingStart < newEnd
      .gt('end_time', startTime);  // existingEnd > newStart

    if (existingError) throw existingError;

    if (existing && existing.length > 0) {
      return res.status(400).json({
        error: 'This time slot conflicts with an existing booking'
      });
    }



    // 1. Insert Booking
    const { data, error } = await supabase
      .from('bookings')
      .insert({
        event_type_id: eventTypeId,
        invitee_name: inviteeName,
        invitee_email: inviteeEmail,
        invitee_timezone: inviteeTimezone,
        start_time: startTime,
        end_time: endTime,
        status: 'confirmed'
      })
      .select()
      .single();

    if (error) throw error;

    // 2. Fetch Event Details for Email
    const { data: eventType, error: eventError } = await supabase
      .from('event_types')
      .select('*')
      .eq('id', eventTypeId)
      .single();

    // --- DEBUG LOGGING ---
    if (eventError || !eventType) {
      console.error("⚠️ EMAIL SKIPPED: Event Type not found for ID:", eventTypeId);
    } else {
      console.log("📧 Attempting to send email to:", inviteeEmail);
      // Call the email function
      sendBookingConfirmation(data, eventType).catch(err => console.error("Background Email Error:", err));
    }

    res.status(201).json(data);

  } catch (err) {
    console.error("❌ SERVER ERROR:", err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/bookings', async (req, res) => {
  try {
    const { type = 'upcoming' } = req.query;
    const userId = 1;

    // ✅ Owner timezone (from default schedule)
    const { data: ownerSchedule, error: ownerScheduleError } = await supabase
      .from('availability_schedules')
      .select('timezone')
      .eq('user_id', userId)
      .eq('is_default', true)
      .single();

    if (ownerScheduleError) {
      console.log("⚠️ Could not fetch owner timezone, using UTC");
    }

    const ownerTimezone = ownerSchedule?.timezone || 'UTC';


    let query = supabase
      .from('bookings')
      .select(`
        *,
        event_types!inner(name, duration, color, user_id)
      `)
      .eq('event_types.user_id', userId);

    const now = new Date().toISOString();

    if (type === 'upcoming') {
      query = query
        .gte('start_time', now)
        .eq('status', 'confirmed')
        .order('start_time', { ascending: true });
    } else {
      query = query
        .or(`start_time.lt.${now},status.eq.cancelled`)
        .order('start_time', { ascending: false });
    }

    const { data, error } = await query;

    if (error) throw error;

    // Transform data
    const transformed = data.map(booking => ({
      ...booking,
      event_name: booking.event_types.name,
      duration: booking.event_types.duration,
      color: booking.event_types.color
    }));

    res.json({
      ownerTimezone,
      meetings: transformed
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.patch('/api/bookings/:id/cancel', async (req, res) => {
  const { reason } = req.body;
  const { id } = req.params;

  try {
    // 1. Update booking status in DB
    const { data: booking, error } = await supabase
      .from('bookings')
      .update({ status: 'cancelled', cancellation_reason: reason })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    // 2. Fetch Event Type info (Needed for the email template)
    const { data: eventType } = await supabase
      .from('event_types')
      .select('*')
      .eq('id', booking.event_type_id)
      .single();

    // 3. Send Cancellation Email
    if (booking && eventType) {
      console.log("📧 Sending Cancellation email to:", booking.invitee_email);
      sendCancellationEmail(booking, eventType, reason).catch(err => console.error("Background Email Error:", err));
    }

    res.json({ message: 'Booking cancelled successfully' });

  } catch (error) {
    console.error("❌ Cancellation Error:", error);
    res.status(500).json({ error: 'Failed to cancel booking' });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    mail: 'brevo-api',
    env: !!process.env.BREVO_API_KEY,
  });
});


app.listen(PORT, () => {
  console.log('\n✅ Server is running!');
  console.log(`🌐 Frontend: http://localhost:3000`);
  console.log(`🔌 Backend API: http://localhost:${PORT}/api`);
  console.log(`🏥 Health Check: http://localhost:${PORT}/api/health`);
  console.log('\nUsing Supabase REST API (no port blocking!)');
  console.log('\nPress Ctrl+C to stop\n');
});