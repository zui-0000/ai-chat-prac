// 件数を画面に出す形にする。0 件のときは「なし」と出す
export const formatCount = (count: number): string => {
  if (count === 0) return "なし";
  return `${count} 件`;
};
