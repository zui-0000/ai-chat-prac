// 件数を画面に出す形にする。0 件のときは「なし」と出す
export const formatCount = (count: number): string => (count === 0 ? "なし" : `${count} 件`);
