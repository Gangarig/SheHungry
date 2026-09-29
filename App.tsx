/* eslint-disable react-hooks/immutability -- Reanimated shared values are intentionally mutated inside gesture worklets. */
import { StatusBar } from 'expo-status-bar';
import { useCallback, useMemo, useState } from 'react';
import { ImageBackground, Pressable, SafeAreaView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, { interpolate, runOnJS, useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';

type Restaurant = { id: string; name: string; category: string; distance: string; price: string; rating: string; note: string; image: string };

const restaurants: Restaurant[] = [
  { id: 'nuri', name: 'Nuri', category: 'Korean comfort food', distance: '8 min walk', price: '€€', rating: '4.8', note: 'Crispy chicken, bibimbap & good energy.', image: 'https://images.unsplash.com/photo-1562565652-a0d8f0c59eb4?auto=format&fit=crop&w=1200&q=85' },
  { id: 'mama-liu', name: 'Mama Liu', category: 'Hand-pulled noodles', distance: '12 min walk', price: '€', rating: '4.7', note: 'Warm bowls, chilli oil and handmade noodles.', image: 'https://images.unsplash.com/photo-1552611052-33e04de081de?auto=format&fit=crop&w=1200&q=85' },
  { id: 'maki-house', name: 'Maki House', category: 'Modern Japanese', distance: '5 min walk', price: '€€', rating: '4.6', note: 'Bright rolls, small plates and matcha dessert.', image: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=1200&q=85' },
];

const SWIPE_DISTANCE = 105;

function RestaurantCard({ restaurant, onSwipe }: { restaurant: Restaurant; onSwipe: (liked: boolean) => void }) {
  const translateX = useSharedValue(0);
  const rotation = useSharedValue(0);
  const { width } = useWindowDimensions();
  const finishSwipe = useCallback((liked: boolean) => {
    onSwipe(liked);
    translateX.value = 0;
    rotation.value = 0;
  }, [onSwipe, rotation, translateX]);

  const pan = useMemo(() => Gesture.Pan()
    .onChange((event) => {
      translateX.value = event.translationX;
      rotation.value = event.translationX / 28;
    })
    .onEnd((event) => {
      const liked = event.translationX > SWIPE_DISTANCE || event.velocityX > 700;
      const skipped = event.translationX < -SWIPE_DISTANCE || event.velocityX < -700;
      if (liked || skipped) {
        const direction = liked ? 1 : -1;
        translateX.value = withTiming(direction * width * 1.25, { duration: 210 }, () => runOnJS(finishSwipe)(liked));
        rotation.value = withTiming(direction * 24, { duration: 210 });
      } else {
        translateX.value = withSpring(0, { damping: 14, stiffness: 150 });
        rotation.value = withSpring(0, { damping: 14, stiffness: 150 });
      }
    }), [finishSwipe, rotation, translateX, width]);

  const cardStyle = useAnimatedStyle(() => ({ transform: [{ translateX: translateX.value }, { rotate: `${rotation.value}deg` }] }));
  const likeStyle = useAnimatedStyle(() => ({ opacity: interpolate(translateX.value, [10, 90], [0, 1], 'clamp') }));
  const nopeStyle = useAnimatedStyle(() => ({ opacity: interpolate(translateX.value, [-90, -10], [1, 0], 'clamp') }));

  return <GestureDetector gesture={pan}><Animated.View style={[styles.card, cardStyle]}><ImageBackground source={{ uri: restaurant.image }} resizeMode="cover" style={styles.cardImage} imageStyle={styles.cardImageRadius}>
    <View style={styles.gradient} />
    <Animated.View style={[styles.stamp, styles.likeStamp, likeStyle]}><Text style={styles.stampText}>YUM</Text></Animated.View>
    <Animated.View style={[styles.stamp, styles.nopeStamp, nopeStyle]}><Text style={styles.stampText}>PASS</Text></Animated.View>
    <View style={styles.cardContent}>
      <View style={styles.categoryPill}><Text style={styles.categoryPillText}>{restaurant.category}</Text></View>
      <Text style={styles.restaurantName}>{restaurant.name}</Text><Text style={styles.restaurantNote}>{restaurant.note}</Text>
      <View style={styles.metaRow}><Text style={styles.metaText}>★ {restaurant.rating}</Text><Text style={styles.metaDivider}>•</Text><Text style={styles.metaText}>{restaurant.distance}</Text><Text style={styles.metaDivider}>•</Text><Text style={styles.metaText}>{restaurant.price}</Text></View>
    </View>
  </ImageBackground></Animated.View></GestureDetector>;
}

export default function App() {
  const [index, setIndex] = useState(0);
  const [likes, setLikes] = useState<Restaurant[]>([]);
  const current = restaurants[index];
  const handleSwipe = useCallback((liked: boolean) => {
    if (liked && current) setLikes((previous) => [...previous, current]);
    setIndex((previous) => previous + 1);
  }, [current]);
  const restart = () => { setIndex(0); setLikes([]); };

  return <GestureHandlerRootView style={styles.root}><SafeAreaView style={styles.safeArea}><StatusBar style="dark" />
    <View style={styles.header}><View><Text style={styles.eyebrow}>NEARBY IN VIENNA</Text><Text style={styles.logo}>shehungry<Text style={styles.logoDot}>.</Text></Text></View><View style={styles.likesButton}><Text style={styles.likesIcon}>♥</Text><Text style={styles.likesCount}>{likes.length}</Text></View></View>
    <View style={styles.deck}>{current ? <RestaurantCard key={current.id} restaurant={current} onSwipe={handleSwipe} /> : <View style={styles.emptyState}><Text style={styles.emptyEmoji}>✨</Text><Text style={styles.emptyTitle}>That’s your taste for now.</Text><Text style={styles.emptyCopy}>{likes.length ? `${likes.length} saved for your next meal.` : 'Try a fresh set of places.'}</Text><Pressable onPress={restart} style={styles.restartButton}><Text style={styles.restartText}>Start again</Text></Pressable></View>}</View>
    {current && <View style={styles.actions}><Pressable accessibilityLabel="Skip restaurant" onPress={() => handleSwipe(false)} style={[styles.actionButton, styles.skipButton]}><Text style={styles.skipText}>×</Text></Pressable><Pressable accessibilityLabel="Like restaurant" onPress={() => handleSwipe(true)} style={[styles.actionButton, styles.likeButton]}><Text style={styles.heartText}>♥</Text></Pressable></View>}
    <Text style={styles.hint}>Swipe left to pass · right to save</Text>
  </SafeAreaView></GestureHandlerRootView>;
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#FFF9F3' },
  safeArea: { flex: 1, maxWidth: 640, width: '100%', alignSelf: 'center', paddingHorizontal: 20 },
  header: { height: 92, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  eyebrow: { color: '#9B7869', fontSize: 10, fontWeight: '800', letterSpacing: 1.5 },
  logo: { color: '#291A16', fontSize: 31, fontWeight: '900', letterSpacing: -1.5 },
  logoDot: { color: '#FF5A4E' },
  likesButton: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 13, paddingVertical: 9, borderRadius: 22, backgroundColor: '#FFE8E0' },
  likesIcon: { color: '#E9534A', fontSize: 18 }, likesCount: { color: '#8E3E39', fontWeight: '800' },
  deck: { flex: 1, minHeight: 410, justifyContent: 'center' },
  card: { height: '100%', maxHeight: 610, borderRadius: 30, overflow: 'hidden', backgroundColor: '#EADAD0', shadowColor: '#55251F', shadowOffset: { width: 0, height: 15 }, shadowOpacity: 0.17, shadowRadius: 24, elevation: 7 },
  cardImage: { flex: 1, justifyContent: 'flex-end' }, cardImageRadius: { borderRadius: 30 },
  gradient: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(19, 10, 6, 0.13)' },
  cardContent: { padding: 25, backgroundColor: 'rgba(24, 13, 9, 0.62)' },
  categoryPill: { alignSelf: 'flex-start', backgroundColor: '#FCEAE3', borderRadius: 20, paddingHorizontal: 11, paddingVertical: 6, marginBottom: 12 },
  categoryPillText: { color: '#7A3B2D', fontSize: 12, fontWeight: '800' },
  restaurantName: { color: '#FFFFFF', fontSize: 38, fontWeight: '900', letterSpacing: -1.4 },
  restaurantNote: { color: '#FBEDE6', fontSize: 15, lineHeight: 22, marginTop: 4 },
  metaRow: { flexDirection: 'row', alignItems: 'center', marginTop: 17, gap: 8 },
  metaText: { color: '#FFFFFF', fontSize: 13, fontWeight: '700' }, metaDivider: { color: '#FFD2BE' },
  stamp: { position: 'absolute', top: 46, paddingVertical: 7, paddingHorizontal: 12, borderWidth: 3, borderRadius: 8, zIndex: 2, transform: [{ rotate: '-14deg' }] },
  likeStamp: { left: 25, borderColor: '#FFF', backgroundColor: '#FF5A4E' }, nopeStamp: { right: 25, borderColor: '#FFF', backgroundColor: '#463A34', transform: [{ rotate: '14deg' }] },
  stampText: { color: '#FFF', fontSize: 18, fontWeight: '900', letterSpacing: 1 },
  actions: { flexDirection: 'row', justifyContent: 'center', gap: 18, paddingVertical: 20 },
  actionButton: { width: 58, height: 58, borderRadius: 29, alignItems: 'center', justifyContent: 'center', shadowColor: '#543329', shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.14, shadowRadius: 10, elevation: 4 },
  skipButton: { backgroundColor: '#FFFFFF' }, likeButton: { backgroundColor: '#FF5A4E' },
  skipText: { color: '#9C7161', fontSize: 39, fontWeight: '300', marginTop: -6 }, heartText: { color: '#FFF', fontSize: 27 },
  hint: { textAlign: 'center', color: '#96766A', fontSize: 12, paddingBottom: 14 },
  emptyState: { alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFF0E8', borderRadius: 30, padding: 34, minHeight: 350 },
  emptyEmoji: { fontSize: 40 }, emptyTitle: { color: '#3B2520', textAlign: 'center', fontSize: 25, fontWeight: '900', marginTop: 14 },
  emptyCopy: { color: '#82665C', textAlign: 'center', fontSize: 15, marginTop: 10 },
  restartButton: { backgroundColor: '#FF5A4E', paddingHorizontal: 20, paddingVertical: 13, borderRadius: 22, marginTop: 24 }, restartText: { color: '#FFF', fontWeight: '800' },
});
