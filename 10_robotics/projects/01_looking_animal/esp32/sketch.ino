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
  
  // 起動時の初期位置を90度（正面）にしておく
  myServo.write(90);
  Serial.println("Ready. Please type an angle:");
}

void loop() {
  // シリアルモニタからデータが送られてきているか確認
  if (Serial.available() > 0) {
    // 改行（Enterキー）が押されるまでの文字列を読み取る
    String command = Serial.readStringUntil('\n');
    command.trim(); // 余分な空白や改行を消す

    // 空っぽのデータでなければ処理する
    if (command.length() > 0) {
      applyAngleCommand(command);
    }
  }
}

// 受け取った文字列を角度に変換してサーボを動かす関数
void applyAngleCommand(String text) {
  // 文字列を整数（int）に変換する
  int angle = text.toInt();

  // シリアルモニタに「何度に動かしたか」を表示して確認
  Serial.print("Moving to angle: ");
  Serial.println(angle);

  // サーボをその角度に動かす
  myServo.write(angle);
}
