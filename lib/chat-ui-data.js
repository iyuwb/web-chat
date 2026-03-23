export const CURRENT_USER_AVATAR = "/avatars/current-user.svg";

const PEER_AVATARS = [
  "/avatars/peer-1.svg",
  "/avatars/peer-2.svg",
  "/avatars/peer-3.svg",
  "/avatars/peer-4.svg",
  "/avatars/peer-5.svg",
  "/avatars/peer-6.svg",
];

export const MOOD_OPTIONS = [
  {
    id: "quiet",
    label: "沉思",
    icon: "sparkles",
    desktopTags: ["沉思", "极简", "午夜"],
    mobileTags: ["夜行者", "想聊电影"],
    chipClass: "from-primary-container to-tertiary-container",
  },
  {
    id: "calm",
    label: "冷静",
    icon: "waves",
    desktopTags: ["雨天", "慢热", "留白"],
    mobileTags: ["听雨", "治愈系"],
    chipClass: "from-primary to-primary-fixed-dim",
  },
  {
    id: "minimal",
    label: "极简",
    icon: "circle",
    desktopTags: ["代码", "星空", "阅读"],
    mobileTags: ["咖啡", "夜读"],
    chipClass: "from-tertiary-fixed to-primary-container",
  },
  {
    id: "haze",
    label: "薄雾",
    icon: "cloud",
    desktopTags: ["海浪", "远行", "散步"],
    mobileTags: ["观星", "安静陪伴"],
    chipClass: "from-primary-fixed-dim to-secondary-container",
  },
];

export const PLACEHOLDER_ACTIONS = {
  archive: "当前版本不保留历史记录，所有消息只在会话进行时临时中转。",
  echoes: "应用不会保存“我的回响”或长期画像，关闭后即清空。",
  profile: "这里没有长期身份档案，只有本次会话里临时生成的匿名代号。",
  settings: "默认就是零存储模式，没有额外隐私开关需要配置。",
  notifications: "当前版本不接入系统通知，避免产生额外本地状态。",
  help: "输入代号后进入发现页，选择在线访客即可发起匿名对话。",
  fingerprint: "应用不会采集设备指纹，这个入口只保留原型视觉。",
  theme: "主题切换仅保留视觉占位，不会影响匿名中转逻辑。",
};

const defaultMoodOption =
  MOOD_OPTIONS.find((option) => option.id === "calm") ?? MOOD_OPTIONS[0];
const moodOptionsById = new Map(
  MOOD_OPTIONS.map((option) => [option.id, option]),
);

export function getMoodOption(moodId) {
  return moodOptionsById.get(moodId) ?? defaultMoodOption;
}

export function getPeerAvatar(clientId = "") {
  const seed = [...clientId].reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return PEER_AVATARS[seed % PEER_AVATARS.length];
}
