export const SCREEN_COPY={
  ready:{eyebrow:'READY TO PLAY',title:'こたえをねらって ビームをうとう！',description:'カードをおしつづけよう。はじめてなら、れんしゅうしてみよう。',button:'はじめる →'},
  paused:{eyebrow:'TAKE A BREAK',title:'ひとやすみ',description:'時間は止まっています。同じ問題からつづけられます。',button:'つづける →'},
  result:{eyebrow:'CHALLENGE COMPLETE',title:'おしまい！',description:'よくがんばったね。60びょうでこわせたカード',button:'もういちど →'},
};
export const LEVELS={easy:{minOperand:1,maxOperand:4,maxSum:5},wide:{minOperand:0,maxOperand:9,maxSum:18}};
export const PAUSE_COPY={
  manual:'休憩中です。同じ問題からつづけられます。',
  hidden:'画面を切り替えたので時間を止めました。',
  blur:'ほかの画面を操作しているので時間を止めました。',
  pagehide:'ページを離れたので時間を止めました。',
  camera:'カメラが停止したので時間を止めました。',
  'camera-setup':'カメラを準備するため時間を止めました。',
  tracking:'からだを見つけられないので時間を止めました。',
};
export class ScreenFlow{
  constructor(){this.screen='ready';this.level='easy';}
  practice(){this.screen='practice';}
  finishPractice(){this.screen='ready';}
  selectLevel(level){if(!LEVELS[level])throw new RangeError('Unknown level');this.level=level;}
  start(){this.screen='playing';return {...LEVELS[this.level]};}
  result(){this.screen='result';}
}
