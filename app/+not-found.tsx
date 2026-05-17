import { Link, Stack } from 'expo-router';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useForgeTheme } from "@/hooks/useForgeTheme";

export default function NotFoundScreen() {
    const { T } = useForgeTheme();
    const s = useS(T);
  return (
    <>
      <Stack.Screen options={{ title: 'Not Found', headerShown: false }} />
      <View style={useS.container}>
        <Text style={useS.code}>404</Text>
        <Text style={useS.title}>Screen not found.</Text>
        <Text style={useS.sub}>The page you're looking for doesn't exist.</Text>
        <Link href="/" asChild>
          <TouchableOpacity style={useS.btn}>
            <Text style={useS.btnText}>Go to Home</Text>
          </TouchableOpacity>
        </Link>
      </View>
    </>
  );
}

const useS = (T: any) => StyleSheet.create({
          container: {
            flex: 1, backgroundColor: T.colors.bg0,
            alignItems: 'center', justifyContent: 'center', padding: 24,
          },
          code: {
            fontSize: 72, fontWeight: '800', color: T.colors.forge,
            textShadowColor: 'rgba(255,92,46,0.3)',
            textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 20,
            marginBottom: 8,
          },
          title: { fontSize: 20, fontWeight: '700', color: T.colors.t1, marginBottom: 8 },
          sub: { fontSize: 13, color: T.colors.t3, textAlign: 'center', marginBottom: 32 },
          btn: {
            backgroundColor: T.colors.forge, paddingHorizontal: 28, paddingVertical: 14,
            borderRadius: 14,
            shadowColor: T.colors.forge, shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.3, shadowRadius: 12, elevation: 6,
          },
          btnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
        });
