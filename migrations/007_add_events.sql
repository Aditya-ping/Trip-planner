-- Migration 007: Add events table and seed initial events for 23 Indian cities

CREATE TABLE IF NOT EXISTS events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    city TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    category TEXT CHECK(category IN ('fair', 'festival', 'concert', 'market', 'other')) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    location_name TEXT,
    latitude REAL,
    longitude REAL,
    source TEXT CHECK(source IN ('api', 'user_submitted')) NOT NULL DEFAULT 'user_submitted',
    submitted_by INTEGER REFERENCES users(id),
    status TEXT CHECK(status IN ('pending', 'approved', 'rejected')) NOT NULL DEFAULT 'pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Seed initial approved big and local events across the 23 supported Indian cities
INSERT INTO events (city, title, description, category, start_date, end_date, location_name, latitude, longitude, source, status) VALUES
-- Agra
('Agra', 'Taj Mahotsav Cultural Festival', 'A 10-day carnival showcasing Indian arts, crafts, classical dance, and Mughlai culinary delights near the Taj Mahal.', 'festival', '2026-10-15', '2026-10-25', 'Shilpgram, near Eastern Gate Taj Mahal', 27.1685, 78.0421, 'api', 'approved'),
('Agra', 'Sadar Bazaar Night Market', 'Traditional evening market featuring leather goods, marble handicrafts, and street snacks.', 'market', '2026-08-15', '2027-12-31', 'Sadar Bazaar, Agra', 27.1601, 78.0075, 'api', 'approved'),

-- Amritsar
('Amritsar', 'Golden Temple Parkash Purab Celebrations', 'Grand religious illumination, fireworks, and continuous langar service honoring the holy scriptures.', 'festival', '2026-09-12', '2026-09-14', 'Sri Harmandir Sahib (Golden Temple)', 31.6200, 74.8765, 'api', 'approved'),
('Amritsar', 'Heritage Street Folk Music & Baisakhi Fair', 'Vibrant Punjabi folk music, Bhangra performance, and traditional craft displays along the Heritage Walk.', 'fair', '2026-11-01', '2026-11-05', 'Heritage Street, Town Hall', 31.6234, 74.8790, 'api', 'approved'),

-- Bangalore
('Bangalore', 'Bangalore Open Air Heavy Metal Fest', 'South Asia’s largest heavy metal and rock music festival featuring top international & Indian bands.', 'concert', '2026-09-20', '2026-09-21', 'Jayamahal Palace Grounds', 12.9985, 77.5925, 'api', 'approved'),
('Bangalore', 'Sunday Soul Sante Flea Market', 'Vibrant lifestyle flea market with indie music performances, food pop-ups, design stalls, and pet activities.', 'market', '2026-10-04', '2026-10-04', 'Jayamahal Palace Lawns', 12.9980, 77.5930, 'api', 'approved'),

-- Delhi
('Delhi', 'Delhi International Arts & Music Carnival', 'A sprawling festival featuring Sufi music, contemporary theater, indie rock, and international food stalls.', 'festival', '2026-09-25', '2026-09-27', 'Jawaharlal Nehru Stadium', 28.5829, 77.2343, 'api', 'approved'),
('Delhi', 'Dilli Haat Craft & Organic Farmer Market', 'Open-air craft bazaar with master weavers, traditional handlooms, and regional street food delicacies.', 'market', '2026-08-15', '2027-12-31', 'Dilli Haat, INA', 28.5744, 77.2081, 'api', 'approved'),

-- Gangtok
('Gangtok', 'Sikkim International Flower & Autumn Fest', 'A mesmerizing display of rare Himalayan orchids, indigenous plants, local wine tasting, and Sikkimese dance.', 'festival', '2026-10-10', '2026-10-18', 'Ridge Park & Flower Exhibition Centre', 27.3325, 88.6186, 'api', 'approved'),
('Gangtok', 'MG Marg Night Street Culture Fest', 'Pedestrian street festival showcasing local indie bands, momo stalls, and hand-woven carpet displays.', 'fair', '2026-09-05', '2026-09-07', 'MG Marg, Gangtok', 27.3290, 88.6130, 'api', 'approved'),

-- Goa
('Goa', 'Sunburn EDM & Live Concert Goa', 'Asia’s premier electronic music festival with world-renowned DJs, visual lighting shows, and beach vibes.', 'concert', '2026-12-27', '2026-12-29', 'Vagator Beach Grounds', 15.6030, 73.7336, 'api', 'approved'),
('Goa', 'Anjuna Wednesday Night Flea Market', 'Iconic seaside market with bohemian fashion, live acoustic jams, artisanal crafts, and Goan seafood.', 'market', '2026-08-20', '2027-05-30', 'Anjuna Beach Road', 15.5800, 73.7430, 'api', 'approved'),

-- Hyderabad
('Hyderabad', 'Hyderabad Sunrisers Live Concert & Sports Fanfest', 'Live musical performances, sports fan interactive zones, and Hyderabadi Biryani food courts.', 'concert', '2026-10-02', '2026-10-03', 'Gachibowli Stadium Complex', 17.4443, 78.3498, 'api', 'approved'),
('Hyderabad', 'Charminar Heritage & Bangles Night Market', 'Historic midnight shopping fest surrounding Charminar, featuring Laad Bazaar glass bangles & pearls.', 'market', '2026-09-15', '2027-12-31', 'Laad Bazaar, Charminar', 17.3616, 78.4747, 'api', 'approved'),

-- Jaipur
('Jaipur', 'Jaipur Literature Festival (JLF) Autumn Edition', 'The greatest literary show on Earth featuring Nobel laureates, novelists, poets, and live acoustic music sessions.', 'festival', '2026-10-22', '2026-10-26', 'Hotel Clarks Amer / Diggi Palace', 26.8520, 75.8050, 'api', 'approved'),
('Jaipur', 'Johari Bazaar Royal Handicraft Fair', 'Traditional bazaar setup featuring block-printed textiles, Kundan jewelry, and Kathputli puppet shows.', 'fair', '2026-09-01', '2026-09-10', 'Johari Bazaar, Pink City', 26.9210, 75.8250, 'api', 'approved'),

-- Jodhpur
('Jodhpur', 'RIFF Jodhpur International Folk Festival', 'World music festival set against the spectacular backdrop of Mehrangarh Fort during the full moon.', 'festival', '2026-10-24', '2026-10-28', 'Mehrangarh Fort Lawns', 26.2978, 73.0184, 'api', 'approved'),
('Jodhpur', 'Clock Tower Spice & Textile Fair', 'Atmospheric night market surrounding Ghanta Ghar with fragrant spices, bandhani sarees, and antique crafts.', 'market', '2026-08-20', '2027-12-31', 'Ghanta Ghar Market', 26.2950, 73.0240, 'api', 'approved'),

-- Kochi
('Kochi', 'Kochi-Muziris Contemporary Art Biennale & Fest', 'International exhibition of contemporary art, installation shows, coastal music gigs, and heritage walks.', 'festival', '2026-12-12', '2027-03-31', 'Fort Kochi & Mattancherry Venues', 9.9656, 76.2421, 'api', 'approved'),
('Kochi', 'Fort Kochi Spice & Handicrafts Flea Market', 'Colonial street market with antique clocks, Kerala spices, handmade soaps, and live kathakali teasers.', 'market', '2026-08-15', '2027-12-31', 'Princess Street, Fort Kochi', 9.9675, 76.2440, 'api', 'approved'),

-- Kodaikanal
('Kodaikanal', 'Kodaikanal Lake Flower & Autumn Carnival', 'Boating pageants, horticultural flower exhibitions, homemade chocolate stalls, and mountain music.', 'fair', '2026-09-18', '2026-09-22', 'Bryant Park & Kodai Lake', 10.2310, 77.4920, 'api', 'approved'),
('Kodaikanal', 'Coaker’s Walk Organic Farmer & Craft Market', 'Mist-shrouded mountain market with fresh hill produce, eucalyptus oils, and local handknits.', 'market', '2026-08-15', '2027-12-31', 'Coaker’s Walk Road', 10.2340, 77.4950, 'api', 'approved'),

-- Kolkata
('Kolkata', 'Durga Puja Grand Carnival & Street Art Fest', 'UNESCO Intangible Heritage festival with breathtaking thematic pandals, dhak drummers, and cultural shows.', 'festival', '2026-10-14', '2026-10-19', 'Park Street & Red Road Parade', 22.5540, 88.3510, 'api', 'approved'),
('Kolkata', 'College Street Boi Para Literary Book Market', 'World’s largest second-hand book market with rooftop adda sessions, tea stalls, and indie publisher meets.', 'market', '2026-08-15', '2027-12-31', 'College Street, Kolkata', 22.5740, 88.3630, 'api', 'approved'),

-- Leh Ladakh
('Leh Ladakh', 'Ladakh Cultural & Dragon Dance Festival', 'Vibrant monastic mask dances (Cham), traditional archery competitions, and Ladakhi folk songs.', 'festival', '2026-09-01', '2026-09-06', 'Leh Polo Ground & Hemis Monastery', 34.1642, 77.5847, 'api', 'approved'),
('Leh Ladakh', 'Main Bazaar Tibetan Craft & Pashmina Market', 'High-altitude evening bazaar with authentic pashmina shawls, silver jewelry, and Tibetan prayer wheels.', 'market', '2026-08-15', '2027-10-31', 'Leh Main Bazaar', 34.1620, 77.5830, 'api', 'approved'),

-- Manali
('Manali', 'Winter Carnival & Himachal Folk Festival', 'Snow sports, Himalayan beauty pageants, local apple cider tasting, and Kulvi dance performances.', 'fair', '2026-10-05', '2026-10-10', 'Mall Road & Solang Valley', 32.2432, 77.1892, 'api', 'approved'),
('Manali', 'Old Manali Indie Acoustic Nights & Flea Market', 'Boho night market with live acoustic guitar jams, handmade woolens, and organic mountain cafes.', 'market', '2026-08-15', '2027-12-31', 'Old Manali Village Street', 32.2540, 77.1830, 'api', 'approved'),

-- Mumbai
('Mumbai', 'Kala Ghoda Arts & Live Concert Festival', '9-day multi-disciplinary arts festival with indie rock concerts, heritage walks, street theater, and installations.', 'festival', '2026-11-07', '2026-11-15', 'Kala Ghoda Art District, Fort', 18.9275, 72.8322, 'api', 'approved'),
('Mumbai', 'NH7 Weekender Live Concert Mumbai', 'India’s happiest music festival featuring indie, hip-hop, metal, and rock artists across multiple stages.', 'concert', '2026-12-05', '2026-12-06', 'Mahalaxmi Racecourse Lawns', 18.9820, 72.8240, 'api', 'approved'),

-- Munnar
('Munnar', 'Tea Garden Harvest Festival & Eco Fair', 'Trekking tours, tea tasting workshops, tribal dance performances, and Kathakali cultural evenings.', 'fair', '2026-09-25', '2026-09-28', 'KDHP Tea Museum & Grounds', 10.0890, 77.0600, 'api', 'approved'),
('Munnar', 'Munnar Town Spice & Essential Oils Market', 'Fragrant bazaar with fresh cardamom, cinnamon, clove oils, and homemade Kerala dark chocolates.', 'market', '2026-08-15', '2027-12-31', 'Munnar Town Main Road', 10.0860, 77.0620, 'api', 'approved'),

-- Mysore
('Mysore', 'Mysuru Dasara Royal Illumination Festival', 'World-famous 10-day extravaganza featuring the lit-up Mysore Palace, Jumboo Savari elephant procession, and air shows.', 'festival', '2026-10-11', '2026-10-20', 'Mysore Palace & Exhibition Grounds', 12.3052, 76.6552, 'api', 'approved'),
('Mysore', 'Devaraja Market Silk & Sandalwood Bazaar', 'Historic 120-year-old covered market selling pure Mysore silk sarees, sandalwood carvings, and marigold garlands.', 'market', '2026-08-15', '2027-12-31', 'Sayyaji Rao Road', 12.3110, 76.6520, 'api', 'approved'),

-- Ooty
('Ooty', 'Nilgiri Autumn Flower & Tea Fair', 'Botanical gardens flower show, toy train heritage rides, and local bakery food tasting competition.', 'fair', '2026-09-10', '2026-09-14', 'Government Botanical Garden', 11.4150, 76.7110, 'api', 'approved'),
('Ooty', 'Commercial Road Homemade Chocolate & Woolen Market', 'Famous street market for fresh Ooty chocolates, Nilgiri tea, and handcrafted sweaters.', 'market', '2026-08-15', '2027-12-31', 'Commercial Road, Ooty', 11.4090, 76.7050, 'api', 'approved'),

-- Pondicherry
('Pondicherry', 'French Quarter Heritage & Jazz Night Fest', 'French colonial architectural walks, beachside live jazz concerts, and Franco-Tamil culinary pop-ups.', 'festival', '2026-10-16', '2026-10-18', 'Rock Beach Promenade & White Town', 11.9340, 79.8350, 'api', 'approved'),
('Pondicherry', 'Goubert Avenue Beachside Craft Market', 'Sunday evening boardwalk market featuring handmade paper crafts from Auroville, candles, and leather bags.', 'market', '2026-08-15', '2027-12-31', 'Goubert Avenue, Promenade Beach', 11.9320, 79.8360, 'api', 'approved'),

-- Rishikesh
('Rishikesh', 'International Yoga & Ganga Music Festival', 'World spiritual festival with morning yoga sessions, evening Ganga Aarti, and classical Indian sitar concerts.', 'festival', '2026-10-01', '2026-10-07', 'Parmarth Niketan & Triveni Ghat', 30.1205, 78.3134, 'api', 'approved'),
('Rishikesh', 'Laxman Jhula Spiritual & Handicraft Flea Market', 'Riverside bazaar selling rudraksha beads, brass idols, yoga mats, and organic herbal teas.', 'market', '2026-08-15', '2027-12-31', 'Laxman Jhula Road', 30.1240, 78.3270, 'api', 'approved'),

-- Shimla
('Shimla', 'Shimla Autumn Carnival & Theater Fest', 'Cultural pageants at The Ridge, Himachal folk dances, live orchestra concerts, and photography contests.', 'festival', '2026-10-08', '2026-10-12', 'The Ridge & Gaiety Theatre', 31.1048, 77.1734, 'api', 'approved'),
('Shimla', 'Mall Road & Lower Bazaar Crafts Market', 'Pedestrian hill market with wooden handicrafts, Himachali caps, and steamed momo stalls.', 'market', '2026-08-15', '2027-12-31', 'Mall Road, Shimla', 31.1040, 77.1720, 'api', 'approved'),

-- Udaipur
('Udaipur', 'World Music Festival & Lake City Carnival', 'International artists perform global music genres across iconic lake venues like Fateh Sagar and Jagmandir.', 'concert', '2026-11-13', '2026-11-15', 'Fateh Sagar Lake Palaces', 24.5940, 73.6760, 'api', 'approved'),
('Udaipur', 'Shilpgram Crafts Fair & Puppet Village', 'Rural arts and crafts complex showcasing Rajasthani folk dances, pottery workshops, and camel rides.', 'fair', '2026-12-21', '2026-12-30', 'Shilpgram Village Complex', 24.6130, 73.6550, 'api', 'approved'),

-- Varanasi
('Varanasi', 'Dev Deepawali & Ganga Mahotsav', 'Millions of earthen lamps (diyas) light up all 84 ghats, accompanied by classical music concerts and laser light shows.', 'festival', '2026-11-20', '2026-11-24', 'Dashashwamedh & Chet Singh Ghats', 25.3076, 83.0104, 'api', 'approved'),
('Varanasi', 'Banarasi Silk & Weaver Heritage Bazaar', 'Historic alleyway markets selling authentic handloom Banarasi silk sarees, zardozi embroidery, and gulabi meenakari.', 'market', '2026-08-15', '2027-12-31', 'Thatheri Bazaar & Vishwanath Gali', 25.3110, 83.0090, 'api', 'approved');
