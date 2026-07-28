import { useRouter } from "expo-router";
import { POSTER_ASPECT_RATIO } from "@/features/poster/templates";
import { WishPolicyCard } from "@/features/wishes/wish-policy-card";
import { useWishStore } from "@/stores/wishes";
import { Image } from "@/tw/image";
import { Pressable, ScrollView, Text, View } from "@/tw";

export default function MyPageScreen() {
  const router = useRouter();
  const wishes = useWishStore((state) => state.wishes);
  const hasHydrated = useWishStore((state) => state.hasHydrated);
  const activeWishes = wishes.filter((wish) => wish.status === "active");
  const doneWishes = wishes.filter((wish) => wish.status === "done");
  const excusedWishes = wishes.filter((wish) => wish.status === "excused");
  const latestWish = activeWishes[0] ?? null;

  return (
    <View className="flex-1 bg-[#f8f8f8]">
      <ScrollView contentContainerClassName="px-5 pb-16 pt-16">
        <View className="flex-row items-center">
          <Pressable onPress={() => router.dismissTo("/")} className="pr-4 py-2">
            <Text className="text-base font-bold text-[#555555]">ホーム</Text>
          </Pressable>
          <Text className="text-xl font-bold text-[#333333]">マイページ</Text>
        </View>

        {!hasHydrated ? (
          <View className="items-center py-20">
            <Text className="text-sm text-[#737373]">公約を読み込んでいます…</Text>
          </View>
        ) : wishes.length === 0 ? (
          <View className="mt-10 items-center rounded-2xl bg-white px-6 py-10">
            <Text className="text-lg font-bold text-[#333333]">
              まだ人生公約がありません
            </Text>
            <Text className="mt-3 text-center text-sm leading-6 text-[#737373]">
              総選挙を開いて、最初の小さな一歩を決めましょう
            </Text>
            <Pressable
              onPress={() => router.push("/election")}
              className="mt-6 h-12 items-center justify-center rounded-full bg-election-red px-8"
            >
              <Text className="text-base font-bold text-white">総選挙をはじめる</Text>
            </Pressable>
          </View>
        ) : (
          <>
            {latestWish && (
              <View className="mt-6 overflow-hidden rounded-2xl border-2 border-[#333333] bg-white p-5">
                <Text className="text-sm font-bold text-[#737373]">わたしの公約</Text>
                <Text className="mt-2 text-2xl font-bold leading-9 text-[#333333]">
                  {latestWish.text}
                </Text>
                <Pressable
                  onPress={() =>
                    router.push({
                      pathname: "/poster",
                      params: { wishId: latestWish.id },
                    })
                  }
                  className={`mt-5 overflow-hidden rounded-xl ${
                    latestWish.posterUri
                      ? ""
                      : "items-center justify-center border-2 border-dashed border-[#999999] bg-[#f8f8f8] py-10"
                  }`}
                >
                  {latestWish.posterUri ? (
                    <Image
                      source={latestWish.posterUri}
                      className="w-full"
                      style={{ aspectRatio: POSTER_ASPECT_RATIO }}
                    />
                  ) : (
                    <>
                      <Text className="text-3xl">📷</Text>
                      <Text className="mt-2 text-sm font-bold text-[#737373]">
                        写真を追加する
                      </Text>
                    </>
                  )}
                </Pressable>
                <View className="mt-4 items-center border-2 border-[#333333] py-2">
                  <Text className="text-sm font-bold text-[#333333]">人生総選挙党</Text>
                </View>
              </View>
            )}

            {activeWishes.length > 0 && (
              <>
                <View className="mt-8 self-start rounded-full bg-[#737373] px-4 py-1.5">
                  <Text className="text-xs font-bold text-white">あなたの人生公約</Text>
                </View>
                <View className="mt-3 gap-2">
                  {activeWishes.map((wish) => (
                    <View key={wish.id} className="rounded-xl bg-white px-4 py-3">
                      <Text className="text-sm font-bold text-[#333333]">
                        {wish.text}
                      </Text>
                    </View>
                  ))}
                </View>

                <Text className="mt-8 text-lg font-bold text-[#333333]">
                  実行中の政策
                </Text>
                <View className="mt-3 gap-3">
                  {activeWishes.map((wish) => (
                    <WishPolicyCard key={wish.id} wish={wish} />
                  ))}
                </View>
              </>
            )}

            {doneWishes.length + excusedWishes.length > 0 && (
              <Pressable
                onPress={() => router.push("/achievements")}
                className="mt-8 rounded-2xl bg-white p-5"
              >
                <View className="flex-row items-center justify-between">
                  <Text className="text-lg font-bold text-[#333333]">
                    公約の実績
                  </Text>
                  <Text className="text-sm font-bold text-[#999999]">
                    見る &gt;
                  </Text>
                </View>
                <View className="mt-3 flex-row items-center gap-4">
                  <View className="flex-row items-center gap-2">
                    <View className="rounded-full bg-election-red px-2.5 py-0.5">
                      <Text className="text-xs font-bold text-white">達成</Text>
                    </View>
                    <Text className="text-base font-bold text-[#333333]">
                      {doneWishes.length}件
                    </Text>
                  </View>
                  <View className="flex-row items-center gap-2">
                    <View className="rounded-full bg-[#999999] px-2.5 py-0.5">
                      <Text className="text-xs font-bold text-white">未達成</Text>
                    </View>
                    <Text className="text-base font-bold text-[#333333]">
                      {excusedWishes.length}件
                    </Text>
                  </View>
                </View>
              </Pressable>
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
}
