#include <ESP32Servo.h>

Servo testServo;

// サーボの信号線ピン
const int SERVO_PIN = 13;

// 動作確認用（基板上の青色LED）
const int STATUS_LED_PIN = 2;

// サーボの安全な可動範囲（無理な負荷を防ぐため30〜150度に制限）
const int MIN_ANGLE = 30;
const int MAX_ANGLE = 150;

// 首振りのなめらかさと速度を制御するステップ待機時間（ミリ秒）
const int STEP_DELAY_MS = 20;

void setup() {
  Serial.begin(115200);
  Serial.println("=== サーボ単体テスト開始 ===");

  // ESP32が動いていることを目視確認できるようにLEDを出力設定
  pinMode(STATUS_LED_PIN, OUTPUT);
  digitalWrite(STATUS_LED_PIN, HIGH);

  // ESP32Servo ライブラリのPWMタイマー割り当て
  ESP32PWM::allocateTimer(0);
  ESP32PWM::allocateTimer(1);
  ESP32PWM::allocateTimer(2);
  ESP32PWM::allocateTimer(3);

  // 一般的なホビー用サーボ（SG90等）の規格に合わせて設定
  testServo.setPeriodHertz(50);
  testServo.attach(SERVO_PIN, 500, 2400);

  // 通電確認のため初期位置（90度）へ直ちに動かす
  Serial.println("サーボを正面（90度）へ移動します...");
  testServo.write(90);
  delay(1000);
}

void loop() {
  // 右から左へゆっくり首振り（LED点灯）
  Serial.println("30度 -> 150度 へ移動中");
  digitalWrite(STATUS_LED_PIN, HIGH);
  for (int angle = MIN_ANGLE; angle <= MAX_ANGLE; angle++) {
    testServo.write(angle);
    delay(STEP_DELAY_MS);
  }

  delay(500);

  // 左から右へゆっくり首振り（LED消灯）
  Serial.println("150度 -> 30度 へ移動中");
  digitalWrite(STATUS_LED_PIN, LOW);
  for (int angle = MAX_ANGLE; angle >= MIN_ANGLE; angle--) {
    testServo.write(angle);
    delay(STEP_DELAY_MS);
  }

  delay(500);
}
