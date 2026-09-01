import { useEffect, useRef, useState } from "react";
import { BirthDateField } from "@/components/ui/birth-date-field";
import { FlowButton } from "@/components/ui/flow-button";
import { FlowHeader } from "@/components/ui/flow-header";
import { ElectionFlowStepper } from "@/features/election/election-flow-stepper";
import { GENDERS } from "@/constants/options";
import { toAgeRange } from "@/features/onboarding/age-range";
import { markElectionHandoff } from "@/features/onboarding/handoff";
import { SummoningOverlay } from "@/features/onboarding/summoning-overlay";
import { ensureSignedIn } from "@/services/firebase/auth";
import { mirrorProfile } from "@/services/firebase/mirror";
import { useProfileStore } from "@/stores/profile";
import { Pressable, ScrollView, Text, TextInput, View } from "@/tw";
import type { UserProfile } from "@/types";

const BORDER_EMPTY = "#afb8c1";
const BORDER_IDLE = "#f6f6f6";
const BORDER_FILLED = "#f4728a";
const NICKNAME_MAX_LENGTH = 20;
/** 招集演出を見せる時間。選挙フローへの受け渡しはこの後に行う */
const SUMMONING_MS = 2200;

function FieldLabel({ children }: { children: string }) {
  return (
    <Text className="font-flow text-[14px] leading-[21px] text-flow-ink">
      {children}
    </Text>
  );
}

/** Figma 2052:18454 — ニックネーム必須・生年月日必須・性別任意 */
export function ProfileForm() {
  const setProfile = useProfileStore((s) => s.setProfile);
  const [nickname, setNickname] = useState("");
  const [gender, setGender] = useState<string | null>(null);
  const [birthDate, setBirthDate] = useState<string | null>(null);
  const [summoning, setSummoning] = useState(false);
  const pendingProfile = useRef<UserProfile | null>(null);

  const trimmedNickname = nickname.trim();
  const canSubmit = Boolean(trimmedNickname && birthDate);

  // 招集演出を見せ切ってからプロフィールを確定する。
  // setProfileでStack.Protectedのガードが反転し、この画面はアンマウントされる
  useEffect(() => {
    if (!summoning) return;
    const timer = setTimeout(() => {
      const profile = pendingProfile.current;
      if (!profile) return;
      markElectionHandoff();
      setProfile(profile);
    }, SUMMONING_MS);
    return () => clearTimeout(timer);
  }, [summoning, setProfile]);

  const handleSubmit = () => {
    if (!trimmedNickname || !birthDate || summoning) return;

    // Firestoreはundefined値を受け付けないため、未選択の性別はキーごと省略する
    const profile: UserProfile = {
      nickname: trimmedNickname,
      // 年代はAIプロンプトとFirestoreミラーが読むので、生年月日から埋めておく
      ageRange: toAgeRange(birthDate),
      birthDate,
      ...(gender ? { gender } : {}),
    };

    // DBへ保存（Firebase未設定時は自動的にスキップ）
    ensureSignedIn()
      .then(() => mirrorProfile(profile))
      .catch((e) => {
        if (__DEV__) console.warn("[profile]", e);
      });

    pendingProfile.current = profile;
    setSummoning(true);
  };

  if (summoning) return <SummoningOverlay />;

  return (
    <View className="flex-1 bg-flow-bg">
      <FlowHeader title="プロフィール登録" hideBack />

      <ScrollView
        keyboardDismissMode="interactive"
        keyboardShouldPersistTaps="handled"
        contentContainerClassName="pb-16"
      >
        {/* ステッパーと見出しまでは白地、カードから下が薄いグレー地 */}
        <View className="bg-white px-5 pb-3">
          <ElectionFlowStepper current={0} alwaysShow />
          <Text className="mt-3 text-center font-flow text-[18px] leading-[27px] text-flow-ink">
            {"まずはあなたについて\n教えて下さい"}
          </Text>
        </View>

        <View className="mx-5 mt-5 gap-[32px] rounded-[20px] border border-[#f6f6f6] bg-white p-[20px]">
          <View className="gap-[8px]">
            <FieldLabel>ニックネーム</FieldLabel>
            <TextInput
              value={nickname}
              onChangeText={setNickname}
              placeholder="あなたのお名前"
              placeholderTextColor="#6e7781"
              maxLength={NICKNAME_MAX_LENGTH}
              className="h-[36px] rounded-[8px] border bg-white px-4 font-flow text-[14px] text-[#1f1f1f]"
              style={{
                borderColor: trimmedNickname ? BORDER_FILLED : BORDER_EMPTY,
              }}
            />
          </View>

          <View className="gap-[8px]">
            <FieldLabel>性別</FieldLabel>
            <View className="flex-row gap-[8px]">
              {GENDERS.map((g) => {
                const selected = g === gender;
                return (
                  <Pressable
                    key={g}
                    onPress={() => setGender((prev) => (prev === g ? null : g))}
                    accessibilityRole="radio"
                    accessibilityState={{ selected }}
                    className="h-[50px] flex-1 justify-center rounded-[8px] border bg-white px-5"
                    style={{
                      borderColor: selected ? BORDER_FILLED : BORDER_IDLE,
                    }}
                  >
                    <Text className="font-flow text-[12px] text-[#1f1f1f]">
                      {g}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <View className="gap-[8px]">
            <FieldLabel>生年月日</FieldLabel>
            <BirthDateField value={birthDate} onChange={setBirthDate} />
          </View>

          <FlowButton
            label="次へ進む"
            size="sm"
            disabled={!canSubmit}
            disabledFillColor="#d0d7de"
            onPress={handleSubmit}
            className="w-full"
          />
        </View>

      </ScrollView>
    </View>
  );
}
