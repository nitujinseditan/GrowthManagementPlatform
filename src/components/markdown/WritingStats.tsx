"use client";

interface WritingStatsProps {
  content: string;
}

export default function WritingStats({ content }: WritingStatsProps) {
  const charCount = content.length;
  // 中文字 + 英文单词混合统计
  const chineseChars = (content.match(/[一-鿿]/g) || []).length;
  const englishWords = (content.match(/[a-zA-Z]+/g) || []).length;
  const wordCount = chineseChars + englishWords;
  // 中文阅读速度约 200-250 字/分钟
  const readingMinutes = Math.max(1, Math.ceil(wordCount / 200));

  if (charCount === 0) return null;

  return (
    <div className="flex items-center gap-3 text-xs text-stone-400 select-none">
      <span>{charCount.toLocaleString()} 字符</span>
      <span className="text-stone-300">·</span>
      <span>约 {wordCount.toLocaleString()} 字</span>
      <span className="text-stone-300">·</span>
      <span>阅读 {readingMinutes} 分钟</span>
    </div>
  );
}
