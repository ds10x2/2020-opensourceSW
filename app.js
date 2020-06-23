const express = require('express');
const multer = require('multer');
const bodyParser = require('body-parser');
const session = require('express-session');
const util = require('util');
const vision = require('@google-cloud/vision'); //google cloud vision api module
const translate = require('@google-cloud/translate').v3beta1; //google cloud translate api module
const credentials = require('/home/ubuntu/termproject/focused-clock-277615-3a427d503822.json');
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

var func_result;
//업로드된 파일 받기
app.post('/upload', upload.single('userfile'), function(req, res){
    console.log(req.file);

    ImageRecognition(req.file.originalname); //사진에서 문자 인식
    var transresult = PAPAGOtranslation(func_result);

    res.send('Uploaded' + req.file.originalname + ' 번역결과 ' + transresult );
})

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

  var detect = detectLangs(eventObj.message.text);

  PAPAGOtrans_forLine(eventObj.replyToken, eventObj.message.text, detect);
  

  res.sendStatus(200);
});


//문자 인식 함수
async function ImageRecognition(uploadedfilename) { 
  const fileName = `/home/ubuntu/termproject/uploads/${uploadedfilename}`;
  const [result] = await client.textDetection(fileName);
  const func_result =  await result.fullTextAnnotation.text;
  console.log('Text: '+ result.fullTextAnnotation.text);
  //transresult = PAPAGOtranslation (result.fullTextAnnotation.text); //번역
  //const detections = result.textAnnotations;
  //detections.forEach(text => console.log(text));
}

//google cloud storage bucket list 함수
async function googlevisiontest(){
    
  try {
  const [buckets] = await storage.getBuckets();

  console.log('Buckets:');
  buckets.forEach((bucket) => {
      console.log(bucket.name);
  });
  } catch (err) {
  console.error('ERROR:', err);
  }
}
//googlevisiontest();

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
        var transMessage = body.message.result.translatedText;
        console.log("번역 결과: " + transMessage);
    }
});
return transMessage;
}

//detectLangs
function detectLangs(query){
  request.post(
    {
      url: PAPAGO_LANG_URL,
      form: {'query': query},
      headers: {'X-Naver-Client-Id':PAPAGO_ID, 'X-Naver-Client-Secret': PAPAGO_SECRET}
    }, (error, response, body) => {
    if (!error && response.statusCode == 200) {
      var result = body.langCode;
    }
  });
  return result;

 }


//line message trans 
function PAPAGOtrans_forLine (replyToken, query, detect) {

  request.post(
    {
      url: PAPAGO_URL,
      form: {'source':`${detect}`, 'target':'en', 'text':query},
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
    }
});
}

function IsItCommand (message_){
  if (message_[0] == "!" ){
    return true;
  }
  return false;
}

function selectCommand (replyToken, message_){
  var result;
  if (message_ == "!명령어"){
    result = "명령어 설명";
  }else if (message_ == ("!이미지" || "!사진") ){
    result = "https://www.tplinechatbot.tk:23023/upload.\n\
    링크에 접속하여 사진을 첨부해주세요.";
  }else if (message_ == "!언어"){
    result = "번역가능한 언어 리스트입니다.\n\
    원하시는 언어를 '!영어'와 같이 입력해주세요.";
  }
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
                    "text":result
                }
            ]
        }
    },(error, response, body) => {
        console.log(body)
    });
}

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