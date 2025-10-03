import PaymentScreen from "@/screens/PaymentScreen";
import { useRouter } from "expo-router";

export default function Payment() {
  const router = useRouter();

  const navigation = {
    goBack: () => router.back(),
  };

  return <PaymentScreen navigation={navigation} />;
}
