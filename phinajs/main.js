// グローバルに展開
phina.globalize();

// アセット
var ASSETS = {
  image: {
    'spaceship': './assets/image/spaceship.png',
    'bullet': './assets/image/bullet.png',
    'explosion': './assets/image/explosion.png',
  },
  
  spritesheet: {
    "spaceship": 
    {
      "frame": {
        "width": 64,
        "height": 64,
        "cols": 4,
        "rows": 4
      },
      "animations" : {
        "player": {
          "frames": [0,1,2,3,2,1],
          "next": "player",
          "frequency": 1
        },
        "enemy": {
          "frames": [4,5,6,7,6,5],
          "next": "enemy",
          "frequency": 1
        }
      }
    },
    'explosion': 
    {
      "frame": {
        "width": 64,
        "height": 64,
        "cols": 10,
        "rows": 1
      },
      "animations" : {
        "explosion": {
          "frames": [0,1,2,3,4,5,6,7,8,9],
          "frequency": 1
        }
      }
    },
  },
  
};

/*
 * メインシーン
 */
phina.define("MainScene", {
  // 継承
  superClass: 'DisplayScene',
  // 初期化
  init: function() {
    // 親クラス初期化
    this.superInit();
    // 背景色
    this.backgroundColor = 'black';
    // グループ
    playerBulletGroup = DisplayElement().addChildTo(this);
    // プレイヤー
    Player().addChildTo(this).setPosition(this.gridX.center(), this.gridY.center(3));
    // プレイヤーの弾作成
    PlayerBullet().addChildTo(this).setPosition(this.gridX.center(), this.gridY.center());
  },
});
/*
 * プレイヤークラス
 */
phina.define("Player", {
  // 継承
  superClass: 'Sprite',
  // 初期化
  init: function() {
    // 親クラス初期化
    this.superInit('spaceship', 64, 64);
    // フレームアニメーションをアタッチ
    FrameAnimation('spaceship').attachTo(this).gotoAndPlay('player');
    // 移動スピード
    this.speed = 5;
  },
  // 毎フレーム更新処理
  update: function(app) {
    // 移動する向きを求める
    var direction = app.keyboard.getKeyDirection();
    // 移動する向きとスピードを代入する
    this.moveBy(direction.x * this.speed, direction.y * this.speed);
  },
});
/*
* プレイヤーの弾クラス
*/
phina.define("PlayerBullet", {
 // 継
 superClass: 'DisplayElement',
 // 初期化
 init: function() {
   // 親クラス初期化
   this.superInit();
   // スピード
   var speed = 10;
   var self = this;
   // 左右の弾
   [-10, 10].each(function(dx) {
    var playerbullet = Sprite('bullet', 64, 64).addChildTo(self).setPosition(self.x + dx, self.y);
    playerbullet.frameIndex = 0;
   });
   // 上向き速度を与える
   this.physical.velocity.y = -speed;
 },
});

/*
 * メイン処理
 */
phina.main(function() {
  // アプリケーションを生成
  var app = GameApp({
    // MainSceneから開始
    startLabel: 'main',
    // アセット指定
    assets: ASSETS,
  });
  // 実行
  app.run();
  // 無理やり canvas にフォーカス
  ;(function() {
    var canvas = app.domElement;
    canvas.setAttribute('tabindex', '0');
    canvas.focus();
  })();
});