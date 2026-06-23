const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://vwknvwczbbykpfbhuzut.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ3a252d2N6YmJ5a3BmYmh1enV0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE5ODA0MzYsImV4cCI6MjA5NzU1NjQzNn0.p6-GWn_TK5ivUS6CUz_0sPohQ_Nrm9VYxQpISe-LoVQ';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const centers = [
  {
    id: 'c1000000-0000-0000-0000-000000000001',
    name: 'Philippine Red Cross — Cebu Chapter',
    address: 'M.J. Cuenco Ave, Cebu City',
    latitude: 10.3157,
    longitude: 123.8854,
    contact: '(032) 255-5944',
    hours: '8:00 AM – 5:00 PM, Mon–Sat'
  },
  {
    id: 'c2000000-0000-0000-0000-000000000002',
    name: 'Vicente Sotto Memorial Medical Center Blood Bank',
    address: 'B. Rodriguez St, Cebu City',
    latitude: 10.3066,
    longitude: 123.8946,
    contact: '(032) 253-9891',
    hours: '8:00 AM – 4:00 PM, Daily'
  },
  {
    id: 'c3000000-0000-0000-0000-000000000003',
    name: 'DOH Subnational Blood Center for Visayas',
    address: 'M.C. Briones St, Mandaue City',
    latitude: 10.3312,
    longitude: 123.9431,
    contact: '(032) 505-7090',
    hours: '8:00 AM – 5:00 PM, Mon–Fri'
  },
  {
    id: 'c4000000-0000-0000-0000-000000000004',
    name: 'Chong Hua Hospital Blood Bank',
    address: 'Don Mariano Cui St, Cebu City',
    latitude: 10.3098,
    longitude: 123.8925,
    contact: '(032) 255-8000',
    hours: '24/7, Open Daily'
  },
  {
    id: 'c5000000-0000-0000-0000-000000000005',
    name: 'Cebu Doctors\' University Hospital Blood Bank',
    address: 'Osmeña Blvd, Cebu City',
    latitude: 10.3125,
    longitude: 123.8907,
    contact: '(032) 255-5555',
    hours: '24/7, Open Daily'
  }
];

const events = [
  {
    id: 'e1000000-0000-0000-0000-000000000001',
    title: 'SM City Cebu Blood Drive',
    date: '2026-06-20',
    time_start: '9:00 AM',
    time_end: '4:00 PM',
    venue: 'SM City Cebu, Activity Center',
    address: 'North Reclamation Area, Cebu City',
    organizer: 'Philippine Red Cross Cebu',
    slots_available: 23,
    description: 'Walk-ins welcome. Bring a valid ID. Light snacks and a donor certificate provided after donation.',
    latitude: 10.3117,
    longitude: 123.9180,
    center_id: 'c1000000-0000-0000-0000-000000000001'
  },
  {
    id: 'e2000000-0000-0000-0000-000000000002',
    title: 'Ayala Center Cebu Donor Day',
    date: '2026-07-02',
    time_start: '10:00 AM',
    time_end: '3:00 PM',
    venue: 'Ayala Center Cebu, Atrium',
    address: 'Cebu Business Park, Cebu City',
    organizer: 'PRC Cebu Chapter',
    slots_available: 41,
    description: 'Part of the mid-year donor replenishment drive.',
    latitude: 10.3174,
    longitude: 123.9056,
    center_id: 'c1000000-0000-0000-0000-000000000001'
  },
  {
    id: 'e3000000-0000-0000-0000-000000000003',
    title: 'Robinsons Galleria Cebu Blood Letting',
    date: '2026-07-28',
    time_start: '10:00 AM',
    time_end: '4:00 PM',
    venue: 'Robinsons Galleria Cebu, Level 2',
    address: 'Gen. Maxilom Ave, Cebu City',
    organizer: 'DOH Blood Center',
    slots_available: 35,
    description: 'Join our community blood letting activity. All donors get a free health check.',
    latitude: 10.3055,
    longitude: 123.9095,
    center_id: 'c3000000-0000-0000-0000-000000000003'
  }
];

async function seed() {
  console.log('Seeding centers...');
  for (const center of centers) {
    const { error } = await supabase.from('centers').upsert(center, { onConflict: 'id' });
    if (error) console.error(`Error inserting center ${center.name}:`, error.message);
    else console.log(`Inserted/Updated center: ${center.name}`);
  }

  console.log('\nSeeding events...');
  for (const event of events) {
    const { error } = await supabase.from('events').upsert(event, { onConflict: 'id' });
    if (error) console.error(`Error inserting event ${event.title}:`, error.message);
    else console.log(`Inserted/Updated event: ${event.title}`);
  }
}

seed();
