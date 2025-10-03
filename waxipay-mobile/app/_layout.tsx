import { Stack, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useRef } from "react";
import { Provider } from "react-redux";
import { loadUser } from "../store/slices/authSlice";
import { store, useAppSelector } from "../store/store";

function RootLayoutNav() {
  const segments = useSegments();
  const router = useRouter();
  const { isAuthenticated, loading } = useAppSelector((state) => state.auth);
  const isFirstRender = useRef(true);

  useEffect(() => {
    store.dispatch(loadUser());
  }, []);

  useEffect(() => {
    if (loading) return;
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    const inAuthGroup = segments[0] === "(tabs)";
    const inPayment = segments[0] === "payment";
    const onLoginOrRegister =
      segments[0] === "login" || segments[0] === "register";

    if (!isAuthenticated && (inAuthGroup || inPayment)) {
      router.replace("/login");
    } else if (isAuthenticated && onLoginOrRegister) {
      router.replace("/(tabs)");
    }
  }, [isAuthenticated, segments, loading]);

  return (
    <>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="login" />
        <Stack.Screen name="register" />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="payment" />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <Provider store={store}>
      <RootLayoutNav />
    </Provider>
  );
}
