#include <ESP32Servo.h>
#include <WiFi.h>
#include <WebSocketsServer.h> // WebSocket用ライブラリ
#include "secrets.h"

Servo myServo;
int servoPin = 13;

// ポート81番で待ち受ける WebSocket サーバーを作成
WebSocketsServer webSocket = WebSocketsServer(81);

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
  
  // WebSocket サーバーの開始
  webSocket.begin();
  webSocket.onEvent(webSocketEvent); // メッセージが届いたときの処理を登録
  Serial.println("WebSocket server started on port 81");
  
  // サーボモーターをピン13に割り当て
  myServo.setPeriodHertz(50); // 標準的な 50Hz
  myServo.attach(servoPin, 500, 2400); // 最小パルス幅と最大パルス幅（一般的なサーボの設定）
  
  // 起動時の初期位置を90度（正面）にしておく
  myServo.write(90);
  Serial.println("Ready. Please type an angle:");
}

void loop() {
  // 常に WebSocket の通信を監視する
  webSocket.loop();

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

// -----------------------------------------------------
// WebSocket でメッセージが届いたときに自動で呼ばれる関数
// -----------------------------------------------------
void webSocketEvent(uint8_t num, WStype_t type, uint8_t * payload, size_t length) {
  switch (type) {
    case WStype_DISCONNECTED:
      Serial.printf("[%u] Disconnected!\n", num);
      break;
      
    case WStype_CONNECTED:
      Serial.printf("[%u] Connected!\n", num);
      break;
      
    case WStype_TEXT:
      // ペイロード（受け取ったデータ）を文字列（String）に変換する
      String text = String((char *)payload);
      
      // T25 で作った「角度チェック＆サーボを動かす関数」に渡す！
      applyAngleCommand(text);
      break;
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
