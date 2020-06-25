

<!-- ABOUT THE PROJECT -->
## About The Project

* 전송 받은 메세지의 언어를 인식하고 번역
* 타깃 언어의 기본 값은 영어, 명령어를 통해 변경가능


<!-- GETTING STARTED -->
## Getting Started

![QRcode](/uploads/e949c9ce75f325aea3b5ccf0b71012e2/QRcode.png)
* QR코드를 통해 라인 친구 추가 가능


### Installation

1. API
   [https://console.cloud.google.com/?hl=ko](https://console.cloud.google.com/?hl=ko)
   [https://developers.line.biz/en/](https://developers.line.biz/en/)
   [https://developers.naver.com/main/](https://developers.naver.com/main/)
2. Clone the repo
```sh
git clone http://khuhub.khu.ac.kr/2019102171/termproject.git
```
3. Install NPM packages
```sh
npm install
```
4. Enter your API in `app.js`
```JS
const keyFilename = '구글 클라우드 플랫폼 키파일 경로';
const PAPAGO_ID = '파파고 api ID';
const PAPAGO_SECRET = '파파고 api secret';
const TOKEN = '라인 챗봇 토큰'
```



<!-- USAGE EXAMPLES -->
## Usage

* QR코드를 통해 친구 추가를 한 뒤 원하는 메세지를 입력하면 번역된 결과가 자동으로 전송
* 입력하는 언어는 자동으로 인식하며 타깃 언어는 영어가 기본 설정
* ! 언어 명령어를 통해 지원 가능한 언어를 확인하고 변경 가능


<!-- LICENSE -->
## License

MIT License

Copyright (c) [year] [fullname]

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.



<!-- CONTACT -->
## Contact

padasol@khu.ac.kr
