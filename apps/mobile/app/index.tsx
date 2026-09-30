import {useCallback,useEffect,useMemo,useRef,useState} from 'react';
import {ActivityIndicator,Animated,Alert,ImageBackground,Linking,Modal,PanResponder,Pressable,ScrollView,Share,StyleSheet,Text,TextInput,View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import * as Location from 'expo-location';
import {ensureGuestIdentity,loadViennaDiscoveryDeck,persistSwipe,removeFavourite,newRequestId,exportMyData,deleteMyAccount,sendFeedback,friendlyError,type DiscoveryRestaurant} from '../lib/catalogue';
const C={bg:'#FFF9F5',ink:'#201A17',muted:'#756A64',coral:'#B52640',mint:'#137959',line:'#EEE5DF'};
const web=process.env.EXPO_PUBLIC_WEB_URL??'https://gangarig.github.io/shehungry';
export default function Discovery(){
 const[restaurants,setRestaurants]=useState<DiscoveryRestaurant[]>([]),[saved,setSaved]=useState<DiscoveryRestaurant[]>([]),[state,setState]=useState<'loading'|'ready'|'error'>('loading');
 const[notice,setNotice]=useState(''),[panel,setPanel]=useState<'saved'|'data'|'feedback'|null>(null),[busy,setBusy]=useState(false),[feedback,setFeedback]=useState('');
 const x=useRef(new Animated.Value(0)).current,lock=useRef(false),pending=useRef<{restaurant:string;liked:boolean;id:string}|null>(null);
 const load=useCallback(async()=>{setState('loading');try{await ensureGuestIdentity();const deck=await loadViennaDiscoveryDeck();setRestaurants(deck.restaurants);setSaved(deck.saved);setState('ready');setNotice('');}catch(e){setNotice(friendlyError(e));setState('error');}},[]);
 useEffect(()=>{void load();},[load]);
 const restaurant=restaurants[0];
 const decide=useCallback(async(liked:boolean)=>{if(!restaurant||lock.current)return;lock.current=true;setBusy(true);setNotice('');x.setValue(0);
 if(pending.current?.restaurant!==restaurant.id||pending.current.liked!==liked)pending.current={restaurant:restaurant.id,liked,id:newRequestId()};
 try{await persistSwipe(restaurant.id,liked?'like':'skip',pending.current.id);setSaved(current=>liked?[restaurant,...current.filter(r=>r.id!==restaurant.id)]:current.filter(r=>r.id!==restaurant.id));setRestaurants(current=>current.filter(r=>r.id!==restaurant.id));pending.current=null;}catch(e){setNotice(friendlyError(e)+' Your card is still here; tap again to retry.');}finally{lock.current=false;setBusy(false);}},[restaurant,x]);
 const pan=useMemo(()=>PanResponder.create({onMoveShouldSetPanResponder:(_,g)=>!lock.current&&Math.abs(g.dx)>10&&Math.abs(g.dx)>Math.abs(g.dy),onPanResponderMove:(_,g)=>{if(!lock.current)x.setValue(g.dx);},onPanResponderRelease:(_,g)=>{x.setValue(0);if(Math.abs(g.dx)>100)void decide(g.dx>0);},onPanResponderTerminate:()=>x.setValue(0)}),[decide,x]);
 async function action(fn:()=>Promise<void>){if(lock.current)return;lock.current=true;setBusy(true);setNotice('');try{await fn();}catch(e){setNotice(friendlyError(e));}finally{lock.current=false;setBusy(false);}}
 async function locate(){if(busy)return;setBusy(true);setNotice('');try{const permission=await Location.requestForegroundPermissionsAsync();if(permission.status!=='granted')throw Error('Location permission was not granted.');const place=await Location.getCurrentPositionAsync({accuracy:Location.Accuracy.Balanced});setRestaurants(current=>[...current].sort((a,b)=>Math.hypot((a.latitude-place.coords.latitude)*111,(a.longitude-place.coords.longitude)*74)-Math.hypot((b.latitude-place.coords.latitude)*111,(b.longitude-place.coords.longitude)*74)));setNotice('Showing the nearest available picks first. Your location stays on this device.');}catch(e){setNotice(e instanceof Error?e.message:'Location is unavailable.');}finally{setBusy(false);}}
 const button=(label:string,onPress:()=>void,disabled=false)=><Pressable accessibilityRole="button" accessibilityState={{disabled:disabled||busy}} disabled={disabled||busy} style={[s.refresh,{opacity:(disabled||busy)?0.5:1}]} onPress={onPress}><Text style={s.refreshText}>{label}</Text></Pressable>;
 const cardContent=restaurant&&<><View style={s.shade}/><Text style={s.rating}>{restaurant.neighbourhood}</Text><View style={s.cardContent}><Text style={s.neighbourhood}>{restaurant.neighbourhood}</Text><Text style={s.name}>{restaurant.name}</Text><Text style={s.meta}>{restaurant.cuisine} · {restaurant.priceLabel}</Text><Text style={s.description}>{restaurant.description}</Text><Text style={s.tags}>{restaurant.tags.slice(0,3).join(' · ')}</Text></View></>;
 return <SafeAreaView style={s.screen}><View style={s.top}><Text style={s.logo}>she<Text style={{color:C.coral}}>hungry</Text></Text>{button(`Saved ${saved.length}`,()=>setPanel('saved'))}</View>
 <ScrollView contentContainerStyle={{paddingBottom:30}}><View style={s.intro}><Text style={s.kicker}>VIENNA · FRIENDS BETA</Text><Text style={s.title}>Follow your appetite.</Text><Text style={s.sub}>A local list. Your next favourite table.</Text>{button('Use my location',()=>void locate())}</View>
 {notice?<Text style={s.actionError} accessibilityRole="alert">{notice}</Text>:null}
 {state==='loading'?<ActivityIndicator accessibilityLabel="Loading restaurants" color={C.coral}/>:state==='error'?<View style={s.empty}><Text style={s.emptyTitle}>We couldn’t set the table.</Text>{button('Try again',()=>void load())}</View>:restaurant?<><Animated.View {...pan.panHandlers} style={[s.card,{transform:[{translateX:x}]}]}>{restaurant.imageUrl?<ImageBackground source={{uri:restaurant.imageUrl}} style={s.image}>{cardContent}</ImageBackground>:<View style={[s.image,s.fallback]}>{cardContent}</View>}</Animated.View><View style={s.actions}><Pressable accessibilityRole="button" accessibilityLabel={`Skip ${restaurant.name}`} disabled={busy} style={s.round} onPress={()=>void decide(false)}><Text style={s.skip}>×</Text></Pressable><Pressable accessibilityRole="button" accessibilityLabel={`Save ${restaurant.name}`} disabled={busy} style={s.round} onPress={()=>void decide(true)}><Text style={s.heart}>♡</Text></Pressable></View><Text style={s.hint}>{busy?'Saving your choice…':'Swipe left to skip · right to save'}</Text>{restaurant.websiteUrl?button('Restaurant website',()=>void Linking.openURL(restaurant.websiteUrl!)):null}</>:<View style={s.empty}><Text style={s.emptyTitle}>You’ve seen every pick.</Text><Text style={s.emptyText}>Your saved places are ready when you are.</Text>{button('See saved places',()=>setPanel('saved'))}{button('Refresh list',()=>void load())}</View>}
 <View style={{flexDirection:'row',flexWrap:'wrap',justifyContent:'center'}}>{button('Feedback',()=>setPanel('feedback'))}{button('My data',()=>setPanel('data'))}{button('Privacy',()=>void Linking.openURL(web+'/privacy/'))}</View><Text style={s.hint}>Check opening hours and availability with the restaurant.</Text></ScrollView>
 <Modal visible={panel!==null} animationType="slide" transparent onRequestClose={()=>{if(!busy)setPanel(null);}}><View style={s.savedOverlay}><View style={s.savedPanel}><View style={s.panelTop}><Text style={s.panelTitle}>{panel==='saved'?'Saved places':panel==='feedback'?'Help shape SheHungry':'Your guest data'}</Text>{button('Close',()=>setPanel(null))}</View><ScrollView>{notice?<Text style={s.actionError} accessibilityRole="alert">{notice}</Text>:null}
 {panel==='saved'&&(saved.length?saved.map(r=><View style={s.savedRow} key={r.id}><View style={s.savedName}><Text style={s.savedRestaurantName}>{r.name}</Text><Text style={s.savedNeighbourhood}>{r.neighbourhood}</Text></View>{button('Remove',()=>void action(async()=>{await removeFavourite(r.id);setSaved(cur=>cur.filter(v=>v.id!==r.id));}))}</View>):<Text style={s.emptyText}>Use the heart button to save a place.</Text>)}
 {panel==='feedback'&&<><Text>Tell us what worked or what could be better. Please leave out sensitive personal details.</Text><TextInput accessibilityLabel="Your feedback" multiline maxLength={2000} style={{borderWidth:1,borderColor:C.line,borderRadius:12,padding:12,minHeight:140,marginVertical:12,color:C.ink}} value={feedback} onChangeText={setFeedback}/>{button('Send feedback',()=>void action(async()=>{await sendFeedback(feedback);setFeedback('');setPanel(null);setNotice('Thanks—your feedback was saved.');}),feedback.trim().length<5)}</>}
 {panel==='data'&&<><Text>Your guest session is stored securely on this device. Deleting app data can make saved places inaccessible. Export a copy before you start fresh.</Text>{button('Export my data',()=>void action(async()=>{await Share.share({message:JSON.stringify(await exportMyData(),null,2),title:'SheHungry data export'});}))}{button('Delete my data',()=>Alert.alert('Delete all your guest data?','This permanently deletes your identity, swipes, saved places and feedback.',[{text:'Cancel',style:'cancel'},{text:'Delete permanently',style:'destructive',onPress:()=>void action(async()=>{await deleteMyAccount();setSaved([]);setRestaurants([]);setPanel(null);setState('error');setNotice('Your data was deleted. Tap Try again to start a new guest session.');})}]))}</>}
 </ScrollView></View></View></Modal></SafeAreaView>;
}
const s = StyleSheet.create({
  screen: { flex: 1, position: 'relative', backgroundColor: C.bg, paddingHorizontal: 20 },
  top: { height: 62, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  logo: { fontFamily: 'Georgia', fontSize: 28, fontWeight: '800', letterSpacing: -1 },
  saved: { overflow: 'hidden', borderWidth: 1, borderColor: C.line, borderRadius: 18, color: C.ink, paddingHorizontal: 12, paddingVertical: 7 },
  intro: { paddingTop: 25, paddingBottom: 22 },
  kicker: { color: C.coral, fontSize: 12, fontWeight: '800', letterSpacing: 1.1 },
  title: { marginTop: 7, color: C.ink, fontFamily: 'Georgia', fontSize: 38, fontWeight: '700', letterSpacing: -1.5 },
  sub: { marginTop: 7, color: C.muted, fontSize: 15 },
  card: { height: 440, minHeight: 360, overflow: 'hidden', borderRadius: 28, elevation: 6, shadowColor: '#3B2420', shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.18, shadowRadius: 22 },
  image: { flex: 1, justifyContent: 'space-between', padding: 22 },
  imageRadius: { borderRadius: 28 },
  fallback: { backgroundColor: '#C65A42' },
  shade: { position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(21,14,11,.28)' },
  rating: { alignSelf: 'flex-start', overflow: 'hidden', borderRadius: 18, backgroundColor: 'rgba(255,255,255,.94)', color: C.ink, fontSize: 13, fontWeight: '800', paddingHorizontal: 10, paddingVertical: 7 },
  cardContent: { gap: 0 },
  neighbourhood: { color: '#fff', fontSize: 12, fontWeight: '800', letterSpacing: 1 },
  name: { marginTop: 3, color: '#fff', fontFamily: 'Georgia', fontSize: 36, fontWeight: '700', letterSpacing: -1.5 },
  meta: { marginTop: 4, color: '#fff', fontSize: 15, fontWeight: '700' },
  description: { maxWidth: 315, marginTop: 11, color: '#fff', fontSize: 15, lineHeight: 21 },
  tags: { marginTop: 10, color: '#fff', fontSize: 12, fontWeight: '700' },
  actions: { flexDirection: 'row', justifyContent: 'center', gap: 32, paddingTop: 24, paddingBottom: 11 },
  round: { width: 62, height: 62, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: C.line, borderRadius: 31, backgroundColor: '#fff' },
  like: { elevation: 3, shadowColor: C.mint, shadowOpacity: 0.2, shadowRadius: 16 },
  skip: { color: C.muted, fontSize: 33, fontWeight: '300' },
  heart: { color: C.mint, fontSize: 32 },
  hint: { color: C.muted, fontSize: 12, textAlign: 'center' },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16 },
  loadingTitle: { color: C.ink, fontFamily: 'Georgia', fontSize: 28, fontWeight: '700' },
  stateCard: { flex: 1, justifyContent: 'center', paddingBottom: 100 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingBottom: 100 },
  emptyTitle: { marginTop: 8, color: C.ink, fontFamily: 'Georgia', fontSize: 35, fontWeight: '700', letterSpacing: -1.3, textAlign: 'center' },
  emptyText: { marginTop: 10, color: C.muted, fontSize: 16, lineHeight: 22, textAlign: 'center' },
  setupText: { marginTop: 12, color: C.muted, fontSize: 14, lineHeight: 20 },
  restart: { marginTop: 25, borderRadius: 24, backgroundColor: C.coral, paddingHorizontal: 21, paddingVertical: 13 },
  restartText: { color: '#fff', fontWeight: '800' },
  refresh: { marginTop: 12, padding: 10 },
  refreshText: { color: C.ink, fontWeight: '800' },
  notice: { marginTop: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12, borderRadius: 14, backgroundColor: '#FFF0E6', padding: 12 },
  noticeText: { flex: 1, color: C.ink, fontSize: 13, lineHeight: 18 },
  retry: { color: C.coral, fontSize: 13, fontWeight: '800' },
  actionError: { marginTop: 14, borderRadius: 12, backgroundColor: '#FFE7E9', color: '#9D1E31', padding: 12 },
  savedOverlay: { position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, zIndex: 20, alignItems: 'center', justifyContent: 'flex-end', backgroundColor: 'rgba(32,26,23,.28)', padding: 16 },
  savedPanel: { width: '100%', maxHeight: '85%', borderRadius: 26, backgroundColor: '#fff', padding: 20 },
  panelTop: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 },
  panelTitle: { color: C.ink, fontFamily: 'Georgia', fontSize: 27, fontWeight: '700', letterSpacing: -1 },
  close: { width: 34, height: 34, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: C.line, borderRadius: 17 },
  closeText: { color: C.muted, fontSize: 26, lineHeight: 28 },
  savedRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12, borderTopWidth: 1, borderTopColor: C.line, paddingVertical: 13 },
  savedName: { flex: 1 },
  savedRestaurantName: { color: C.ink, fontSize: 16, fontWeight: '800' },
  savedNeighbourhood: { marginTop: 3, color: C.muted, fontSize: 13 },
  remove: { color: C.coral, fontSize: 13, fontWeight: '800' },
});
