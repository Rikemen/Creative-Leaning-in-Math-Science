#include <ESP32Servo.h>
#include <WiFi.h>
#include "secrets.h"

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
  
  // Wi-Fi に接続する
  Serial.print("Connecting to Wi-Fi");
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  
  // 繋がるまで待つ
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println();
  Serial.print("Connected! IP Address: ");
  Serial.println(WiFi.localIP());
  
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
  // 1. 文字列が数字かどうかチェックする（数字以外なら無視）
  bool isNumber = true;
  for (int i = 0; i < text.length(); i++) {
    // '-'（マイナス記号）と数字以外が含まれていたらダメ
    if (!isDigit(text[i]) && text[i] != '-') {
      isNumber = false;
      break;
    }
  }
  
  if (!isNumber) {
    Serial.println("Error: Please input a number.");
    return; // ここで処理を終了して無視する
  }

  // 2. 文字列を整数（int）に変換する
  int angle = text.toInt();

  // 3. 角度を 30度 〜 150度 の範囲に制限する（物理的な破損を防ぐため）
  angle = constrain(angle, 30, 150);

  // 4. シリアルモニタに「何度に動かしたか」を表示して確認
  Serial.print("Moving to angle: ");
  Serial.println(angle);

  // 5. サーボをその角度に動かす
  myServo.write(angle);
}
