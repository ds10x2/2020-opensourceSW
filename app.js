const express = require('express');
const multer = require('multer');
const bodyParser = require('body-parser');
const session = require('express-session');
const util = require('util');
const vision = require('@google-cloud/vision'); //google cloud vision api module
const {Translate} = require('@google-cloud/translate').v2;
const credentials = require(keyFilename);
const translate = new Translate({credentials});
const client = new vision.ImageAnnotatorClient( {credentials} );
const {Storage} = require('@google-cloud/storage'); //google cloud translate api storage api moudle
const projectId = 'focused-clock-277615';
const keyFilename = '/home/ubuntu/termproject/focused-clock-277615-3a427d503822.json';
const storage = new Storage({projectId, keyFilename});
var upload = multer({ storage: _storage});
var fs = require('fs');
const path = require('path');
const HTTPS = require('https');
const domain = "www.tplinechatbot.tk"
const sslport = 23023;
var app = express();

const TOKEN = 'h8xN39Zg0nRmPhRcwCfUt35UhGQvinzOSzl1VSHWPdaKaW4VDDs2bTvhvxnOH1FVzzJ4t1L0ih/uJ1idIKz8SvPin3PM4nLgt6roTaEVw105aIsZqDwlsKPS2ewb2WVbL2TK/BqVEBQ2MmHO2xFRzAdB04t89/1O/w1cDnyilFU='
const PAPAGO_URL = 'https://openapi.naver.com/v1/papago/n2mt'
const PAPAGO_ID = 'W5BknW1dTHXMah9QZ_KK'
const PAPAGO_SECRET = 'doQdf3ZMU3'
const TARGET_URL = 'https://api.line.me/v2/bot/message/reply'
const PAPAGO_LANG_URL = 'https://naveropenapi.apigw.ntruss.com/langs/v1/dect'
var request = require('request');

var _storage = multer.diskStorage({
    destination: function (req, file, cb) {  
      cb(null, 'uploads/')
    },
    filename: function (req, file, cb) { 
      cb(null, file.originalname)
    }
  })

  

app.use(bodyParser.urlencoded({ extended: false }));
app.locals.pretty = true;
app.set('views', './views_file');
app.set('view engine', 'jade');

app.use('/user', express.static('uploads'));


//파일 업로드
app.get('/upload', function(req, res){
    res.render('upload');
})

//업로드된 파일 받기
var transMessage;
app.post('/upload', upload.single('userfile'), function(req, res){
    console.log(req.file);

    ImageRecognition(req.file.originalname); //사진에서 문자 인식

    res.send('Uploaded' + req.file.originalname + "번역결과 : "+ transMessage);
})

var langcode2 = 'en';
app.use(bodyParser.json());
app.post('/hook', function (req, res) {

  var eventObj = req.body.events[0];
  var source = eventObj.source;
  var message = eventObj.message;

  // request log
  console.log('======================', new Date() ,'======================');
  console.log('[request]', req.body);
  console.log('[request source] ', eventObj.source);
  console.log('[request message]', eventObj.message);

  if(IsItCommand(eventObj.message.text)){
    if (eventObj.message.text == "!명령어"){
      request.post(
        {url: TARGET_URL, headers: {'Authorization': `Bearer ${TOKEN}`},json: {"replyToken":eventObj.replyToken,
                "messages":[{"type":"text", "text":"!명령어\n!언어\n!사진번역"}]}
        },(error, response, body) => {
            console.log(body)
        }); 
    }else if(eventObj.message.text == "!언어"){
      request.post(
      {url: TARGET_URL, headers: {'Authorization': `Bearer ${TOKEN}`},json: {"replyToken":eventObj.replyToken,
              "messages":[{"type":"text", "text":"원하시는 언어를 !영어 와 같은 형태로 입력해주세요."},
              {"type":"text", "text":"지원 가능 언어 목록\n한국어\n영어\n일본어\n중국어 번체\n중국어 간체\n베트남어\n이탈리아어\n프랑스어\n인도네시아어\n독일어\n태국어\n러시아어\n스페인어"}]}
      },(error, response, body) => {
          console.log(body)
      }); 

    }else if(eventObj.message.text == "!사진번역"){
      request.post(
        {url: TARGET_URL, headers: {'Authorization': `Bearer ${TOKEN}`},json: {"replyToken":eventObj.replyToken,
                "messages":[{"type":"text", "text":"https://www.tplinechatbot.tk:23023/upload"}]}
        },(error, response, body) => {
            console.log(body)
        }); 
    }else{
      if (langList.some(x=>{return "!" + x.name == eventObj.message.text})){
        var setlangcode = langList.find(x=>{return "!" + x.name ==  eventObj.message.text});
        if (setlangcode.code == 'jp'){
          langcode2 = 'ja';
        } else{
          langcode2 = setlangcode.code;
        }
        request.post(
          {url: TARGET_URL, headers: {'Authorization': `Bearer ${TOKEN}`},json: {"replyToken":eventObj.replyToken,
                  "messages":[{"type":"text", "text":"언어가 설정되었습니다."}]}
          },(error, response, body) => {
              console.log(body)
          }); 
    

        } else{
        request.post(
          {url: TARGET_URL, headers: {'Authorization': `Bearer ${TOKEN}`},json: {"replyToken":eventObj.replyToken,
                  "messages":[{"type":"text", "text":"지원하지 않는 명령어 혹은 언어입니다."}]}
          },(error, response, body) => {
              console.log(body)
          }); 
  
      }
  }
  }else {
    PAPAGOtrans_forLine(eventObj.replyToken, eventObj.message.text, langcode2);
    }
    

  //PAPAGOtrans_forLine(eventObj.replyToken, eventObj.message.text, langcode2);
  

  res.sendStatus(200);
});


//문자 인식 함수
async function ImageRecognition(uploadedfilename) { 
  const fileName = `/home/ubuntu/termproject/uploads/${uploadedfilename}`;
  const [result] = await client.textDetection(fileName);
  console.log('Text: '+ result.fullTextAnnotation.text);
  PAPAGOtranslation (result.fullTextAnnotation.text); //번역
}


//papago trans
function PAPAGOtranslation (query) {
  request.post(
    {
      url: PAPAGO_URL,
      form: {'source':'ko', 'target':'en', 'text':query},
      headers: {'X-Naver-Client-Id':PAPAGO_ID, 'X-Naver-Client-Secret': PAPAGO_SECRET},
      body: `source=ko&target=en&text=` + query,
      json:true
    }, (error, response, body) => {
      if(!error && response.statusCode == 200) {
        transMessage = body.message.result.translatedText;
        console.log("번역 결과: " + transMessage);
    }
});
}

//line message trans 
async function PAPAGOtrans_forLine(replyToken, query, lang2) {

  //언어감지
  let [detections] = await translate.detect(query);
  detections = Array.isArray(detections) ? detections : [detections];
  console.log('Detections:');
  console.log(detections[0].language);
  langcode1 = detections[0].language;
  

  request.post(
    {
      url: PAPAGO_URL,
      form: {'source':`${langcode1}`, 'target':`${lang2}`, 'text':query},
      headers: {'X-Naver-Client-Id':PAPAGO_ID, 'X-Naver-Client-Secret': PAPAGO_SECRET},
      body: `source=ko&target=en&text=` + query,
      json:true
    }, (error, response, body) => {
      if(!error && response.statusCode == 200) {
        var transMessage = body.message.result.translatedText;
        console.log(transMessage);
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
    }else{request.post(
      {url: TARGET_URL, headers: {'Authorization': `Bearer ${TOKEN}`},json: {"replyToken":replyToken,
                "messages":[{"type":"text", "text":"오류가 발생했습니다.\n1. 번역이 지원되지 않는 언어입니다.\n2.설정된 언어로 번역을 시도했습니다.\n\n언어를 다시 설정해주세요.\n명령어 예시 : !영어"}]}
        },(error, response, body) => {
            console.log(body)
        }); 
    }
});
}

function IsItCommand (message_){
  if (message_.charAt(0) == "!" ){
    return true;
  }
  return false;
}

const langList = new Array(
  {code : 'ko', name:	'한국어'},
  {code : 'en', name:	'영어'},
  {code : 'jp', name:	'일본어'},
  {code : 'zh-CN', name:	'중국어 간체'},
  {code : 'zh-TW', name:	'중국어 번체'},
  {code : 'vi', name:	'베트남어'},
  {code : 'id', name:	'인도네시아어'},
  {code : 'th', name: '태국어'},
  {code : 'de', name: '독일어'},
  {code : 'ru', name: '러시아어'},
  {code : 'es', name: '스페인어'},
  {code : 'it', name: '이탈리아어'},
  {code : 'fr', name: '프랑스어'})

//sever
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