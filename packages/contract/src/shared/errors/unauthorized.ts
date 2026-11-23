// エラーに status を持たせない。HTTP の状態コードは、oRPC がコードの名前から決める
export const UnauthorizedError = { message: "ログインが必要です" } as const;
