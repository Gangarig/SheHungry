export type Restaurant = {
  id: string;
  name: string;
  cuisine: string;
  neighbourhood: string;
  signatureDish: string;
  price: '$' | '$$' | '$$$';
  description: string;
  tags: string[];
};

const restaurantRows: Array<[string, string, string, string, string, Restaurant['price'], string, string[]]> = [
  ['amber-table', 'Amber Table', 'Modern Austrian', 'Neubau', 'Brown-butter spaetzle', '$$', 'Warm, seasonal plates in a candlelit corner room.', ['Date night', 'Seasonal']],
  ['basil-bloom', 'Basil & Bloom', 'Italian', 'Mariahilf', 'Burrata with grilled peaches', '$$', 'A bright all-day trattoria with a sunny little terrace.', ['Lunch', 'Vegetarian-friendly']],
  ['cardamom-club', 'Cardamom Club', 'Indian', 'Leopoldstadt', 'Smoky butter paneer', '$$', 'Fragrant sharing dishes and spice-forward cocktails.', ['Groups', 'Spicy']],
  ['dashi-darling', 'Dashi Darling', 'Japanese', 'Innere Stadt', 'Miso black cod', '$$$', 'A tiny counter for careful Japanese plates.', ['Date night', 'Reservations']],
  ['ember-noodle', 'Ember Noodle', 'Thai', 'Margareten', 'Charred chilli noodles', '$', 'Fast, fiery noodles with an open kitchen.', ['Quick bite', 'Late night']],
  ['fig-and-feta', 'Fig & Feta', 'Greek', 'Josefstadt', 'Whipped feta flatbread', '$$', 'Relaxed Greek sharing plates made for long lunches.', ['Terrace', 'Vegetarian-friendly']],
  ['golden-ladle', 'Golden Ladle', 'Vietnamese', 'Alsergrund', 'Lemongrass pho', '$', 'Comforting bowls, crunchy herbs, and fast service.', ['Quick bite', 'Cozy']],
  ['harvest-house', 'Harvest House', 'Plant-based', 'Wieden', 'Mushroom schnitzel', '$$', 'A vegetable-first kitchen that still feels indulgent.', ['Vegan-friendly', 'Seasonal']],
  ['island-oven', 'Island Oven', 'Pizza', 'Ottakring', 'Hot-honey margherita', '$', 'Chewy pizza, good playlists, and generous pours.', ['Groups', 'Casual']],
  ['juniper-room', 'Juniper Room', 'Contemporary European', 'Landstrasse', 'Celeriac steak', '$$$', 'A polished small-plates dinner destination.', ['Date night', 'Reservations']],
  ['kefi-kitchen', 'Kefi Kitchen', 'Mediterranean', 'Neubau', 'Lemon chicken orzo', '$$', 'Easy-going Mediterranean food for the whole table.', ['Groups', 'Lunch']],
  ['little-lima', 'Little Lima', 'Peruvian', 'Leopoldstadt', 'Citrus sea bass ceviche', '$$', 'Fresh, bright flavours and pisco sours.', ['Date night', 'Gluten-free options']],
  ['miso-moon', 'Miso Moon', 'Korean', 'Favoriten', 'Gochujang fried chicken', '$$', 'A lively room built around Korean comfort food.', ['Groups', 'Late night']],
  ['north-star-bistro', 'North Star Bistro', 'French', 'Alsergrund', 'Gruyere gougeres', '$$$', 'A neighbourhood bistro for a quietly special night.', ['Date night', 'Wine']],
  ['olive-street', 'Olive Street', 'Turkish', 'Brigittenau', 'Lamb pide', '$', 'A cheerful grill with smoky breads and salads.', ['Casual', 'Groups']],
  ['paper-lantern', 'Paper Lantern', 'Chinese', 'Rudolfsheim', 'Sichuan aubergine', '$$', 'Big flavours, hand-pulled noodles, no fuss.', ['Spicy', 'Vegetarian-friendly']],
  ['quiet-corner', 'Quiet Corner', 'Cafe', 'Hietzing', 'Ricotta toast with herbs', '$', 'A gentle spot for coffee, cake, and a slow morning.', ['Brunch', 'Cozy']],
  ['rosemary-row', 'Rosemary Row', 'Middle Eastern', 'Margareten', 'Tahini chicken shawarma', '$$', 'Colourful, casual plates with heaps of fresh herbs.', ['Terrace', 'Groups']],
  ['saffron-supper', 'Saffron Supper', 'Persian', 'Innere Stadt', 'Pistachio lamb rice', '$$$', 'A dramatic dining room for celebration dinners.', ['Date night', 'Reservations']],
  ['tangerine-taco', 'Tangerine Taco', 'Mexican', 'Neubau', 'Crispy fish tacos', '$', 'A casual taco bar with bright salsas and frozen margaritas.', ['Casual', 'Late night']],
];

export const restaurants: Restaurant[] = restaurantRows.map(([id, name, cuisine, neighbourhood, signatureDish, price, description, tags]) => ({
  id, name, cuisine, neighbourhood, signatureDish, price: price as Restaurant['price'], description, tags,
}));
