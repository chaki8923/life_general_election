/** 選挙フロー④のモチベーション選択肢（毎回の選挙で選ぶ。プロフィールには保存しない） */

export type ElectionMotivation = {
  id: string;
  label: string;
  icon: number;
};

export const ELECTION_MOTIVATIONS: ElectionMotivation[] = [
  {
    id: "high",
    label: "やる気に満ち溢れている",
    icon: require("../../assets/icons/motivation-high.svg"),
  },
  {
    id: "medium",
    label: "ほどよく頑張りたい",
    icon: require("../../assets/icons/motivation-medium.svg"),
  },
  {
    id: "small",
    label: "小さなことから始めたい",
    icon: require("../../assets/icons/motivation-small.svg"),
  },
];
