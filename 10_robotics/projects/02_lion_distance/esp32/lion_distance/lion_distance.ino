// Step 1: 距離センサー（HC-SR04）の読み取りテスト
// 段階的開発の最初のステップとして、センサーからの距離取得のみを行います。

const int trigPin = 5;
const int echoPin = 18;

void setup() {
  Serial.begin(115200);
  pinMode(trigPin, OUTPUT);
  pinMode(echoPin, INPUT);
  Serial.println("Step 1: Distance Sensor Test Started");
}

void loop() {
  // トリガー信号を10マイクロ秒間HIGHにする
  digitalWrite(trigPin, LOW);
  delayMicroseconds(2);
  digitalWrite(trigPin, HIGH);
  delayMicroseconds(10);
  digitalWrite(trigPin, LOW);

  // エコーピンがHIGHになっている時間（パルス幅）をマイクロ秒で取得
  long duration = pulseIn(echoPin, HIGH);

  // 音速(約340m/s)を用いて距離(cm)を計算
  // 往復の時間なので2で割る: (duration / 2) * 0.0343
  float distance = duration * 0.01715;

  Serial.print("Distance: ");
  Serial.print(distance);
  Serial.println(" cm");

  delay(500); // 0.5秒ごとに計測
}
