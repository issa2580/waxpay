import TransactionsScreen from "@/screens/TransactionsScreen";
import { useRouter } from "expo-router";

export default function Transactions() {
  const router = useRouter();

  const navigation = {
    goBack: () => router.back(),
  };

  return <TransactionsScreen navigation={navigation} />;
}
