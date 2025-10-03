import ProfileScreen from "@/screens/ProfileScreen";
import { useRouter } from "expo-router";

export default function Profile() {
  const router = useRouter();

  const navigation = {
    goBack: () => router.back(),
  };

  return <ProfileScreen navigation={navigation} />;
}
