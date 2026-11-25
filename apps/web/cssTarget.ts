// CSS を書き換える先のブラウザ（Baseline の Newly available）。既定のままだと light-dark() が OS の設定でしか切り替わらない形に書き換えられ、color-scheme が効かない。
// Storybook は build を引き継がないので .storybook/main.ts も読む。そのときにアプリの plugin を作らずに済むよう、vite.config.ts から分けている
export const CSS_TARGET = ["chrome123", "edge123", "firefox120", "safari17.5"];
