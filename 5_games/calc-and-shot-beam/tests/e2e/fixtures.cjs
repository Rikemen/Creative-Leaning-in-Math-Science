exports.audioProbe=()=>{
  const Native=window.Audio;window.testAudio=[];
  window.Audio=function(src){const a=new Native(src);testAudio.push(a);return a;};
};
exports.mockBody=async page=>{
  await page.addInitScript(()=>{
    window.poseMissing=false;window.wristsNear=false;window.poseOffset=0;window.elbowsMissing=false;window.wristsMissing=false;window.wristGap=null;
    window.makePose=()=>[
      ['left_shoulder',300,200],['right_shoulder',700,200],['left_elbow',220,350],['right_elbow',780,350],
      ['left_wrist',wristGap===null?(wristsNear?460:280):500-wristGap*200,wristGap===null?(wristsNear?280:100):280],
      ['right_wrist',wristGap===null?(wristsNear?540:850):500+wristGap*200,wristGap===null?(wristsNear?290:480):280],
    ].map(([name,x,y])=>({name,x:x+poseOffset,y,confidence:(elbowsMissing&&name.includes('elbow'))||(wristsMissing&&name.includes('wrist'))?0:.9}));
    navigator.mediaDevices.getUserMedia=async constraints=>{
      if(constraints.audio!==false)throw Error('Unexpected microphone access');
      const c=document.createElement('canvas');c.width=1280;c.height=720;
      const ctx=c.getContext('2d');ctx.fillStyle='#334455';ctx.fillRect(0,0,1280,720);
      window.testStream=c.captureStream(25);return testStream;
    };
  });
  await page.route('https://unpkg.com/ml5@1.3.0/dist/ml5.min.js',r=>r.fulfill({contentType:'text/javascript',body:`window.ml5={bodyPose:async()=>({model:{dispose(){}},detect:async()=>poseMissing?[]:[{keypoints:makePose()}]})};`}));
};
exports.answerIndex=page=>page.evaluate(()=>{
  const [a,b]=document.querySelector('#problem').textContent.match(/\d+/g).map(Number);
  return [...document.querySelectorAll('#choices .number')].findIndex(e=>Number(e.textContent)===a+b);
});
exports.snapshot=page=>page.evaluate(()=>({problem:document.querySelector('#problem').textContent,
  hp:[...document.querySelectorAll('#choices .card-hp i')].map(e=>e.style.transform),
  score:document.querySelector('#score').textContent,time:document.querySelector('#time').textContent}));
exports.calibrateAndStart=async page=>{
  await page.waitForFunction(()=>!document.querySelector('#aim-calibrate').disabled);
  await page.locator('#aim-calibrate').click();
  await page.waitForFunction(()=>!document.querySelector('#body-start').disabled);
  await page.locator('#body-start').click();
  await page.waitForFunction(()=>document.querySelector('#camera-setup').hidden);
  await page.waitForFunction(()=>document.querySelector('#feedback').dataset.tracking==='tracking');
};
