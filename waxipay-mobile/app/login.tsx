import LoginScreen from "@/screens/LoginScreen";
import { useRouter } from "expo-router";

export default function Login() {
  const router = useRouter();

  const navigation = {
    navigate: (screen: string) => {
      if (screen === "Register") router.push("/register");
    },
    replace: (screen: string) => {
      if (screen === "Dashboard") router.replace("/(tabs)");
    },
  };

  return <LoginScreen navigation={navigation} />;
}
