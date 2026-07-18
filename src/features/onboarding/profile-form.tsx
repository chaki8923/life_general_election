import { useState } from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "@/tw";
import { OptionChip } from "@/components/ui/option-chip";
import { AGE_RANGES, GENDERS } from "@/constants/options";
import { markElectionHandoff } from "@/features/onboarding/handoff";
import { ensureSignedIn } from "@/services/firebase/auth";
import { mirrorProfile } from "@/services/firebase/mirror";
import { useProfileStore } from "@/stores/profile";
import type { UserProfile } from "@/types";

/** プロフィール登録フォーム（ニックネーム必須・年代必須・性別任意） */
export function ProfileForm() {
  const setProfile = useProfileStore((s) => s.setProfile);
  const [nickname, setNickname] = useState("");
  const [ageRange, setAgeRange] = useState<string | null>(null);
  const [gender, setGender] = useState<string | null>(null);

  const canSubmit = Boolean(nickname.trim() && ageRange);

  const handleSubmit = () => {
    if (!nickname.trim() || !ageRange) return;

    // Firestoreはundefined値を受け付けないため、未選択の性別はキーごと省略する
    const profile: UserProfile = {
      nickname: nickname.trim(),
      ageRange,
      ...(gender ? { gender } : {}),
    };

    // DBへ保存（Firebase未設定時は自動的にスキップ）
    ensureSignedIn()
      .then(() => mirrorProfile(profile))
      .catch((e) => {
        if (__DEV__) console.warn("[profile]", e);
      });

    // 保存するとStack.Protectedガード反転でホームへ遷移し、
    // ホーム側がハンドオフフラグを消費して選挙フロー（興味関心）へ直行する
    markElectionHandoff();
    setProfile(profile);
  };

  return (
    <View className="flex-1 bg-election-cream">
      <ScrollView contentContainerClassName="px-6 pb-40 pt-16">
        <Text className="text-sm font-bold tracking-widest text-election-red">
          有権者登録
        </Text>
        <Text className="mt-2 text-3xl font-bold text-election-ink">
          あなたのことを{"\n"}教えてください
        </Text>
        <Text className="mt-2 text-sm text-election-ink/60">
          あなたに近い1000人を集めるために使います。あとから変わっても大丈夫。
        </Text>

        <Text className="mt-8 text-sm font-bold text-election-ink/60">
          ニックネーム
        </Text>
        <TextInput
          value={nickname}
          onChangeText={setNickname}
          placeholder="例: がんばるぞう"
          placeholderTextColor="#2b2b2b55"
          maxLength={20}
          className="mt-2 rounded-2xl border-2 border-election-ink/10 bg-election-paper px-4 py-3 text-base text-election-ink"
        />

        <Text className="mt-8 text-sm font-bold text-election-ink/60">
          年代
        </Text>
        <View className="mt-2 flex-row flex-wrap gap-2">
          {AGE_RANGES.map((age) => (
            <OptionChip
              key={age}
              label={age}
              selected={age === ageRange}
              onPress={() => setAgeRange(age)}
            />
          ))}
        </View>

        <Text className="mt-8 text-sm font-bold text-election-ink/60">
          性別（任意）
        </Text>
        <View className="mt-2 flex-row flex-wrap gap-2">
          {GENDERS.map((g) => (
            <OptionChip
              key={g}
              label={g}
              selected={g === gender}
              onPress={() => setGender((prev) => (prev === g ? null : g))}
            />
          ))}
        </View>
      </ScrollView>

      <View className="absolute inset-x-0 bottom-0 bg-election-cream/95 px-6 pb-10 pt-3">
        <Pressable
          onPress={handleSubmit}
          disabled={!canSubmit}
          className={`items-center rounded-full border-2 py-4 shadow-lg ${
            canSubmit
              ? "border-election-gold bg-election-red shadow-election-red/50 active:bg-election-red-dark"
              : "border-transparent bg-election-ink/20 shadow-none"
          }`}
        >
          <Text className="text-lg font-bold tracking-wide text-white">
            ✅ 登録して選挙へ
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
