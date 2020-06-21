var express = require('express');
const request = require('request');
const TARGET_URL = 'https://api.line.me/v2/bot/message/reply'
const TOKEN = 'h8xN39Zg0nRmPhRcwCfUt35UhGQvinzOSzl1VSHWPdaKaW4VDDs2bTvhvxnOH1FVzzJ4t1L0ih/uJ1idIKz8SvPin3PM4nLgt6roTaEVw105aIsZqDwlsKPS2ewb2WVbL2TK/BqVEBQ2MmHO2xFRzAdB04t89/1O/w1cDnyilFU='
const PAPAGO_URL = 'https://openapi.naver.com/v1/papago/n2mt'
const PAPAGO_ID = 'W5BknW1dTHXMah9QZ_KK'
const PAPAGO_SECRET = 'doQdf3ZMU3'
const fs = require('fs');
const path = require('path');
const HTTPS = require('https');
const domain = "www.oss0522test.tk"
const sslport = 23023;
const bodyParser = require('body-parser');

const vision = require('@google-cloud/vision'); //구글 클라우드 비전 api
const line = require('@line/bot-sdk');


//1. 이미지 텍스트 추출 - google cloud vision api 사용
//   전송받은 이미지 불러오기 -> 추출
//2.  추출 후 바로 번역? / 텍스트만 출력?
//3. richmenu 활용하기 



/*
var query = "언어를 감지할 문장을 입력하세요.";
app.get('/detectLangs', function (req, res) {
   var api_url = 'https://openapi.naver.com/v1/papago/detectLangs';
   var request = require('request');
   var options = {
       url: api_url,
       form: {'query': query},
       headers: {'X-Naver-Client-Id':PAPAGO_ID, 'X-Naver-Client-Secret': PAPAGO_SECRET}
    };
   request.post(options, function (error, response, body) {
     if (!error && response.statusCode == 200) {
       res.writeHead(200, {'Content-Type': 'text/json;charset=utf-8'});
       res.end(body);
     } else {
       res.status(response.statusCode).end();
       console.log('error = ' + response.statusCode);
     }
   });
 });
 app.listen(3000, function () {
   console.log('http://127.0.0.1:3000/detectLangs app listening on port 3000!');
 });
 */

const client_vision = new vision.ImageAnnotatorClient();

 //이미지에서 텍스트 추출
function vision_image(bucketName, fileName){
  const [result] = await client_vision.textDetection(`gs://${bucketName}/${fileName}`);
  const detections = result.textAnnotations;
  console.log('Text:');
  detections.forEach(text => console.log(text));
}







const client_line = new line.Client({
  channelAccessToken: TOKEN
});

client_line.setRichMenuImage('<rich_menu_id>', fs.createReadStream('./example.png')) //richmenu 이미지 설정

client_line.createRichMenu(richmenu) //richmenu 만들기
  .then((richMenuId) =>
  console.log(richMenuId))

const richmenu = {
    "size": {
        "width": 2500,
        "height": 1686
      },
      "selected": false,
      "name": "Choose language",
      "chatBarText": "ko/ja/en/fr",
      "areas": [
        {
          "bounds": {
            "x": 0,
            "y": 0,
            "width": 2500,
            "height": 1686
          },
          "action": {
            "type": "postback",
            "data": "action=buy&itemid=123"
          }
        }
      ]
};









var app = express();
app.use(bodyParser.json());
var trans_lang;
app.post('/hook', function (req, res) {

    var eventObj = req.body.events[0];
    var source = eventObj.source;
    var message = eventObj.message;


    // request log
    console.log('======================', new Date() ,'======================');
    console.log('[request]', req.body);
    console.log('[request source] ', eventObj.source);
    console.log('[request message]', eventObj.message);

    
    if (eventObj.message.type == "text"){ //입력이 텍스트일 경우 

        if (eventObj.message.text == '영어'){
            trans_lang = 'en';
        }else if (eventObj.message.text == '일본어'){
            trans_lang = 'ja';
        }else if (eventObj.message.text == '프랑스어'){
            trans_lang = 'fr';
        }else {
            trans(eventObj.replyToken, eventObj.message.text, trans_lang);
        }

    } else if (eventObj.message.type == "image"){ //입력이 이미지일 경우 
      //이미지 저장? -> google cloud storage이나 웹
        vision_iamge(bucketName, fileName);
        //추출된 텍스트, 번역된 텍스트

    }
        

    res.sendStatus(200);
});


function trans(replyToken, message, language) {

    request.post(
        {
            url: PAPAGO_URL,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                'X-Naver-Client-Id': `${PAPAGO_ID}`,
                'X-Naver-Client-Secret': `${PAPAGO_SECRET}`
            },
            body: `source=ko&target=${language}&text=` + message,
            json:true
        },(error, response, body) => {
            if(!error && response.statusCode == 200) {
                console.log(body.message);
                var transMessage = body.message.result.translatedText;
                request.post(
                    {
                        url: TARGET_URL,
                        headers: {
                            'Authorization': `Bearer ${TOKEN}`
                        },
                        json: {
                            "replyToken":replyToken,
                            "messages":[
                                {
                                    "type":"text",
                                    "text":transMessage
                                }
                            ]
                        }
                    },(error, response, body) => {
                        console.log(body)
                    });
            }
        });

}

try {
    const option = {
      ca: fs.readFileSync('/etc/letsencrypt/live/' + domain +'/fullchain.pem'),
      key: fs.readFileSync(path.resolve(process.cwd(), '/etc/letsencrypt/live/' + domain +'/privkey.pem'), 'utf8').toString(),
      cert: fs.readFileSync(path.resolve(process.cwd(), '/etc/letsencrypt/live/' + domain +'/cert.pem'), 'utf8').toString(),
    };
  
    HTTPS.createServer(option, app).listen(sslport, () => {
      console.log(`[HTTPS] Server is started on port ${sslport}`);
    });
  } catch (error) {
    console.log('[HTTPS] HTTPS 오류가 발생하였습니다. HTTPS 서버는 실행되지 않습니다.');
    console.log(error);
  }