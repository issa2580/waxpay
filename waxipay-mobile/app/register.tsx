import RegisterScreen from "@/screens/RegisterScreen";
import { useRouter } from "expo-router";

export default function Register() {
  const router = useRouter();

  const navigation = {
    navigate: (screen: string) => {
      if (screen === "Login") router.push("/login");
    },
    goBack: () => router.back(),
    replace: (screen: string) => {
      if (screen === "Dashboard") router.replace("/(tabs)");
    },
  };

  return <RegisterScreen navigation={navigation} />;
}
