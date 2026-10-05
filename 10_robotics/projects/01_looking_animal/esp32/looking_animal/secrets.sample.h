// Wi-Fi 接続情報の見本ファイル（Git にコミットする）
//
// 使い方:
//   1. このファイルを同じフォルダに secrets.h という名前でコピーする
//   2. secrets.h の値を自分の環境に書き換える
//
// secrets.h は .gitignore で除外しているため、パスワードがリポジトリに残らない。
// Arduino IDE はスケッチフォルダ内のファイルしかビルドに含めないので、
// secrets.h は必ず looking_animal.ino と同じフォルダに置くこと。
#pragma once

// ESP32 は 2.4GHz 帯にしか接続できないため、5GHz の SSID は指定しない
#define WIFI_SSID     "your-ssid"
#define WIFI_PASSWORD "your-password"
