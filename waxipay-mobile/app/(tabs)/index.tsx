import DashboardScreen from "@/screens/DashboardScreen";
import { useRouter } from "expo-router";

export default function Dashboard() {
  const router = useRouter();

  const navigation = {
    navigate: (screen: string) => {
      if (screen === "Payment") router.push("/payment");
      if (screen === "Transactions") router.push("/(tabs)/transactions");
      if (screen === "Profile") router.push("/(tabs)/profile");
    },
  };

  return <DashboardScreen navigation={navigation} />;
}
