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
var app = express();

const TOKEN = 'h8xN39Zg0nRmPhRcwCfUt35UhGQvinzOSzl1VSHWPdaKaW4VDDs2bTvhvxnOH1FVzzJ4t1L0ih/uJ1idIKz8SvPin3PM4nLgt6roTaEVw105aIsZqDwlsKPS2ewb2WVbL2TK/BqVEBQ2MmHO2xFRzAdB04t89/1O/w1cDnyilFU='
const PAPAGO_URL = 'https://openapi.naver.com/v1/papago/n2mt'
const PAPAGO_ID = 'W5BknW1dTHXMah9QZ_KK'
const PAPAGO_SECRET = 'doQdf3ZMU3'
var request = require('request');

var _storage = multer.diskStorage({
    destination: function (req, file, cb) {  //path - 파일의 형식에 따라 나눔 if문
      cb(null, 'uploads/')
    },
    filename: function (req, file, cb) { //filename 중복된 파일이 존재하는지
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
app.post('/upload', upload.single('userfile'), function(req, res){
    console.log(req.file);

    ImageRecognition(req.file.originalname); //사진에서 문자 인식
    //PAPAGOtranslation();

    res.send('Uploaded' + req.file.originalname );
})


//문자 인식 함수
async function ImageRecognition(uploadedfilename) { 
  const fileName = `/home/ubuntu/termproject/uploads/${uploadedfilename}`;
  const [result] = await client.textDetection(fileName);
  console.log('Text: '+ result.fullTextAnnotation.text);
  PAPAGOtranslation (result.fullTextAnnotation.text); //번역
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
        console.log(transMessage);
        /* //라인에 전송
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
            }); */
    }
});
}

 var server = app.listen(23023);