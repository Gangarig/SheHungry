-- Curated launch catalogue for Vienna.  This is intentionally maintained by
-- SheHungry (provider = manual), rather than imported from a maps provider.
-- Confirm opening hours, menus and availability with each venue before launch.

alter table public.restaurants
  add column if not exists address text,
  add column if not exists neighbourhood text,
  add column if not exists website_url text,
  add column if not exists description text,
  add column if not exists tags text[] not null default '{}';

insert into public.restaurants
  (provider, provider_place_id, name, latitude, longitude, cuisine_types, price_level, address, neighbourhood, website_url, description, tags)
values
  ('manual', 'vienna-steirereck', 'Steirereck im Stadtpark', 48.2022, 16.3785, array['Austrian', 'Fine dining'], 4, 'Am Heumarkt 2A, 1030 Wien', 'Landstraße', 'https://www.steirereck.at/', 'A celebratory Austrian meal in the Stadtpark for an unhurried evening.', array['Date night', 'Fine dining', 'Reservations']),
  ('manual', 'vienna-tian', 'TIAN Restaurant Wien', 48.2072, 16.3761, array['Vegetarian', 'Fine dining'], 4, 'Himmelpfortgasse 23, 1010 Wien', 'Innere Stadt', 'https://www.tian-restaurant.com/wien/en/', 'Vegetable-led tasting menus for a considered special occasion.', array['Vegetarian', 'Vegan-friendly', 'Date night', 'Reservations']),
  ('manual', 'vienna-tian-bistro', 'TIAN Bistro am Spittelberg', 48.2044, 16.3521, array['Vegetarian', 'Bistro'], 2, 'Schrankgasse 4, 1070 Wien', 'Neubau', 'https://www.tian-restaurant.com/wien/en/', 'A relaxed vegetarian choice near the museums and Spittelberg lanes.', array['Vegetarian', 'Vegan-friendly', 'Cosy']),
  ('manual', 'vienna-mochi', 'Mochi', 48.2130, 16.3857, array['Japanese', 'Small plates'], 3, 'Praterstraße 15, 1020 Wien', 'Leopoldstadt', 'https://mochi.at/', 'Japanese-inspired small plates for sharing with a hungry table.', array['Date night', 'Good for groups', 'Reservations']),
  ('manual', 'vienna-neni', 'NENI am Naschmarkt', 48.1988, 16.3619, array['Middle Eastern', 'Israeli'], 2, 'Naschmarkt 510, 1060 Wien', 'Mariahilf', 'https://www.nenivienna.com/', 'Colourful, shareable plates at the lively Naschmarkt.', array['Good for groups', 'Vegetarian-friendly', 'Outdoor seats']),
  ('manual', 'vienna-seven-north', 'Seven North', 48.2028, 16.3518, array['Middle Eastern', 'Mediterranean'], 3, 'Schottenfeldgasse 74, 1070 Wien', 'Neubau', 'https://www.sevennorth.at/', 'A high-energy room for generous plates and a late dinner.', array['Date night', 'Good for groups', 'Late night']),
  ('manual', 'vienna-cafe-kandl', 'Café Kandl', 48.2029, 16.3495, array['Austrian', 'Café'], 2, 'Kandlgasse 12/2, 1070 Wien', 'Neubau', 'https://www.cafekandl.at/', 'Neighbourhood café energy with a menu that works from lunch into evening.', array['Cosy', 'Vegetarian-friendly', 'Casual']),
  ('manual', 'vienna-gasthaus-grunauer', 'Gasthaus Grünauer', 48.2032, 16.3516, array['Austrian', 'Gasthaus'], 2, 'Hermanngasse 32, 1070 Wien', 'Neubau', 'https://www.gruenauer.at/', 'Classic Viennese cooking in a welcoming neighbourhood setting.', array['Austrian classic', 'Cosy', 'Good for groups']),
  ('manual', 'vienna-zum-poschl', 'Zum Pöschl', 48.2056, 16.3763, array['Austrian', 'Gasthaus'], 3, 'Weihburggasse 17, 1010 Wien', 'Innere Stadt', 'https://www.zumposchl.at/', 'Traditional dishes and a compact, old-Vienna dining room.', array['Austrian classic', 'Date night', 'Reservations']),
  ('manual', 'vienna-glacis-beisl', 'Glacis Beisl', 48.2046, 16.3586, array['Austrian', 'Garden'], 2, 'Breite Gasse 4, 1070 Wien', 'Neubau', 'https://www.glacis-beisl.at/', 'A garden-backed Austrian favourite near the MuseumsQuartier.', array['Outdoor seats', 'Austrian classic', 'Cosy']),
  ('manual', 'vienna-wrenkh', 'Wrenkh', 48.2107, 16.3757, array['Vegetarian', 'Modern European'], 3, 'Bauernmarkt 10, 1010 Wien', 'Innere Stadt', 'https://www.wrenkh-wien.at/', 'Creative plant-forward plates a short walk from Stephansplatz.', array['Vegetarian', 'Vegan-friendly', 'Date night']),
  ('manual', 'vienna-cafe-azzurro', 'Café Azzurro', 48.2028, 16.3395, array['Italian', 'Café'], 2, 'Urban-Loritz-Platz 5, 1070 Wien', 'Neubau', 'https://cafeazzurro.at/', 'Easygoing Italian-leaning comfort food beside the U-Bahn.', array['Casual', 'Good for groups']),
  ('manual', 'vienna-cafe-cache', 'Café Caché', 48.1956, 16.3268, array['Café', 'International'], 2, 'Meiselstraße 2, 1150 Wien', 'Rudolfsheim-Fünfhaus', 'https://www.cafecache.at/', 'A local, low-key choice when you want to stay west of the centre.', array['Cosy', 'Casual']),
  ('manual', 'vienna-rosi', 'Rosi', 48.1887, 16.3331, array['Austrian', 'Contemporary'], 2, 'Sechshauser Straße 120, 1150 Wien', 'Rudolfsheim-Fünfhaus', 'https://www.rosi.wien/', 'A neighbourhood dinner spot with a modern, relaxed feel.', array['Date night', 'Casual']),
  ('manual', 'vienna-bruder', 'BRUDER', 48.1972, 16.3520, array['Contemporary', 'European'], 3, 'Windmühlgasse 20, 1060 Wien', 'Mariahilf', 'https://www.bruder.wien/', 'Contemporary plates for a proper evening out in the sixth.', array['Date night', 'Reservations']),
  ('manual', 'vienna-ca-phe-lalot', 'Cà Phê LALOT', 48.2127, 16.3697, array['Vietnamese'], 2, 'Wipplingerstraße 25, 1010 Wien', 'Innere Stadt', 'https://www.caphelalot.com/', 'Vietnamese flavours in the centre for a quick, bright meal.', array['Casual', 'Vegetarian-friendly']),
  ('manual', 'vienna-and-flora', '&flora', 48.2037, 16.3567, array['International', 'Vegetarian-friendly'], 2, 'Breite Gasse 9, 1070 Wien', 'Neubau', 'https://www.andflora.at/', 'An all-day dining option beside the museums with broad appeal.', array['Brunch', 'Vegetarian-friendly', 'Outdoor seats']),
  ('manual', 'vienna-disco-volante', 'Disco Volante', 48.1969, 16.3504, array['Pizza', 'Italian'], 2, 'Gumpendorfer Straße 98, 1060 Wien', 'Mariahilf', 'https://www.discovolante.at/', 'Pizza and a buzzing room for an uncomplicated night out.', array['Good for groups', 'Casual', 'Late night']),
  ('manual', 'vienna-pizzeria-il-mercato', 'Pizzeria Il Mercato', 48.2192, 16.3921, array['Pizza', 'Italian'], 1, 'Vorgartenmarkt Stand 4, 1020 Wien', 'Leopoldstadt', 'https://www.ilmercato.at/', 'Market-side pizza that works especially well for a laid-back lunch.', array['Casual', 'Outdoor seats', 'Good for groups']),
  ('manual', 'vienna-mraz-sohn', 'Mraz & Sohn', 48.2358, 16.3652, array['Austrian', 'Fine dining'], 4, 'Wallensteinstraße 59, 1200 Wien', 'Brigittenau', 'https://www.mraz-sohn.at/', 'Inventive tasting-menu territory for the night you want to remember.', array['Fine dining', 'Date night', 'Reservations']),
  ('manual', 'vienna-pramerl-wolf', 'Pramerl & the Wolf', 48.2265, 16.3572, array['Austrian', 'Fine dining'], 4, 'Pramergasse 21, 1090 Wien', 'Alsergrund', 'https://pramerlundwolf.com/', 'A small, ambitious destination for a long tasting-menu dinner.', array['Fine dining', 'Date night', 'Reservations']),
  ('manual', 'vienna-konstantin-filippou', 'Konstantin Filippou', 48.2105, 16.3771, array['Contemporary', 'Fine dining'], 4, 'Dominikanerbastei 17, 1010 Wien', 'Innere Stadt', 'https://www.konstantinfilippou.com/', 'Polished modern cooking when the occasion calls for something refined.', array['Fine dining', 'Date night', 'Reservations']),
  ('manual', 'vienna-amador', 'Amador', 48.2533, 16.3465, array['Austrian', 'Fine dining'], 4, 'Grinzinger Straße 86, 1190 Wien', 'Döbling', 'https://www.restaurant-amador.com/', 'A destination tasting menu in the wine-growing north of Vienna.', array['Fine dining', 'Date night', 'Reservations']),
  ('manual', 'vienna-mast-winebistro', 'MAST Winebistro', 48.2222, 16.3607, array['European', 'Wine bar'], 3, 'Porzellangasse 53, 1090 Wien', 'Alsergrund', 'https://www.mast.wien/', 'Seasonal plates and wine for a relaxed but intentional evening.', array['Date night', 'Wine', 'Reservations'])
on conflict (provider, provider_place_id) do update set
  name = excluded.name,
  latitude = excluded.latitude,
  longitude = excluded.longitude,
  cuisine_types = excluded.cuisine_types,
  price_level = excluded.price_level,
  address = excluded.address,
  neighbourhood = excluded.neighbourhood,
  website_url = excluded.website_url,
  description = excluded.description,
  tags = excluded.tags,
  updated_at = now();
