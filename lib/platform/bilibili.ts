/**
 * B站 API 集成
 *
 * 公开接口（无需认证）：
 * - 视频信息: api.bilibili.com/x/web-interface/view?aid=xxx 或 ?bvid=xxx
 * - 视频统计: api.bilibili.com/x/web-interface/archive/stat?aid=xxx
 *
 * 局限性：
 * - 留存数据、观众画像、流量来源等需要创作者登录后从创作中心获取
 * - 本工具提供手动录入 + 未来可扩展 OAuth 授权拉取
 */

export interface BilibiliVideoInfo {
  bvid: string;
  aid: number;
  title: string;
  pic: string;
  duration: number;
  pubdate: number;
  desc: string;
  owner: { name: string; mid: number; face: string };
  stat: {
    view: number;
    like: number;
    coin: number;
    favorite: number;
    share: number;
    reply: number;
    danmaku: number;
  };
}

export interface BilibiliStatResponse {
  code: number;
  message: string;
  data: {
    aid: number;
    bvid: string;
    view: number;
    like: number;
    coin: number;
    favorite: number;
    share: number;
    reply: number;
    danmaku: number;
  };
}

function extractBvid(input: string): string | null {
  // Handle full URLs: https://www.bilibili.com/video/BV1xx411c7mD/
  const bvMatch = input.match(/BV[A-Za-z0-9]+/);
  if (bvMatch) return bvMatch[0];

  // Handle aid: av123456 or just 123456
  const avMatch = input.match(/av(\d+)/i);
  if (avMatch) return avMatch[0];

  // If it looks like a BV号
  if (input.startsWith("BV")) return input;

  return null;
}

export async function fetchVideoStat(videoId: string): Promise<BilibiliStatResponse["data"] | null> {
  const id = extractBvid(videoId);
  if (!id) return null;

  const isBvid = id.startsWith("BV");
  const param = isBvid ? `bvid=${id}` : `aid=${id.replace("av", "")}`;
  const url = `https://api.bilibili.com/x/web-interface/archive/stat?${param}`;

  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": "VideoForge/1.0 (https://github.com/your-username/videoforge)",
        Referer: "https://www.bilibili.com/",
      },
    });
    const json = (await res.json()) as BilibiliStatResponse;
    if (json.code === 0) return json.data;
    return null;
  } catch {
    return null;
  }
}

export async function fetchVideoInfo(videoId: string): Promise<BilibiliVideoInfo | null> {
  const id = extractBvid(videoId);
  if (!id) return null;

  const isBvid = id.startsWith("BV");
  const param = isBvid ? `bvid=${id}` : `aid=${id.replace("av", "")}`;
  const url = `https://api.bilibili.com/x/web-interface/view?${param}`;

  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": "VideoForge/1.0",
        Referer: "https://www.bilibili.com/",
      },
    });
    const json = await res.json();
    if (json.code === 0) return json.data;
    return null;
  } catch {
    return null;
  }
}

export function extractBilibiliVideoId(input: string): string | null {
  return extractBvid(input);
}
