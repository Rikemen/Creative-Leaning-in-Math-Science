// ESP32基板上のインジケータLEDに割り当てられているGPIO番号
const int LED_PIN = 2;

// 動作確認が目視で分かりやすい点滅周期（1秒点灯・1秒消灯）
const int BLINK_INTERVAL_MS = 1000;

void setup() {
  // デジタル出力として電流を供給・遮断できるよう初期化
  pinMode(LED_PIN, OUTPUT);
}

void loop() {
  // LEDへ電圧を印加して点灯
  digitalWrite(LED_PIN, HIGH);
  delay(BLINK_INTERVAL_MS);

  // 電圧を0Vに落として消灯
  digitalWrite(LED_PIN, LOW);
  delay(BLINK_INTERVAL_MS);
}
