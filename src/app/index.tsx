import { Link, Text, View } from "@/tw";

export default function HomeScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-election-cream px-8">
      <Text className="text-4xl font-bold text-election-red">
        1000人生総選挙
      </Text>
      <Text className="mt-4 text-center text-base text-election-ink">
        あなたに近い1000人の「小さな一歩」を{"\n"}勝手に開票します
      </Text>
      <Link
        href="/election"
        className="mt-10 rounded-full bg-election-red px-10 py-4 text-lg font-bold text-white"
      >
        🗳️ 総選挙をはじめる
      </Link>
    </View>
  );
}
