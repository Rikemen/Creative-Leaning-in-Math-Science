#include <ESP32Servo.h>

Servo myServo;
int servoPin = 13;

void setup() {
  // シリアル通信の開始（デバッグ用）
  Serial.begin(115200);

  // ESP32Servo の初期化設定
  ESP32PWM::allocateTimer(0);
  ESP32PWM::allocateTimer(1);
  ESP32PWM::allocateTimer(2);
  ESP32PWM::allocateTimer(3);
  
  // サーボモーターをピン13に割り当て
  myServo.setPeriodHertz(50); // 標準的な 50Hz
  myServo.attach(servoPin, 500, 2400); // 最小パルス幅と最大パルス幅（一般的なサーボの設定）
}

void loop() {
  // 0度から180度までゆっくり動かす
  for (int pos = 0; pos <= 180; pos += 1) {
    myServo.write(pos);
    delay(15);
  }
  
  // 180度から0度までゆっくり戻す
  for (int pos = 180; pos >= 0; pos -= 1) {
    myServo.write(pos);
    delay(15);
  }
}
