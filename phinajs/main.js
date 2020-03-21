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
    // アセット表示
    Sprite('spaceship').addChildTo(this).setPosition(this.gridX.center(), this.gridY.center(-7));
    Sprite('bullet').addChildTo(this).setPosition(this.gridX.center(), this.gridY.center(-5));
    Sprite('explosion').addChildTo(this).setPosition(this.gridX.center(), this.gridY.center(-3));
    
    // 敵
    var enemy = Sprite('spaceship', 64, 64).addChildTo(this);
    enemy.setPosition(this.gridX.center(), this.gridY.center());
    // フレームアニメーションをアタッチ
    FrameAnimation('spaceship').attachTo(enemy).gotoAndPlay('enemy');
    // 敵弾
    var enemybullet = Sprite('bullet', 64, 64).addChildTo(this);
    enemybullet.setPosition(this.gridX.center(), this.gridY.center(1));
    // フレームインデックス指定
    enemybullet.frameIndex = 1;
    // 自機ショット
    var playerbullet = Sprite('bullet', 64, 64).addChildTo(this);
    playerbullet.setPosition(this.gridX.center(), this.gridY.center(2));
    playerbullet.frameIndex = 0;
    // プレイヤー
    var player = Sprite('spaceship', 64, 64).addChildTo(this);
    player.setPosition(this.gridX.center(), this.gridY.center(3));
    FrameAnimation('spaceship').attachTo(player).gotoAndPlay('player');
    // 爆発
    var explosion = Sprite('explosion', 64, 64).addChildTo(this);
    explosion.setPosition(this.gridX.center(), this.gridY.center(5));
    FrameAnimation('explosion').attachTo(explosion).gotoAndPlay('explosion');
    
  },
  
});
/*
 * メイン処理
 */
phina.main(function() {
  // アプリケーションを生成
  var app = GameApp({
    // アセット指定
    assets: ASSETS,
    // MainScene から開始
    startLabel: 'main',
  });
  // fps表示
  //app.enableStats();
  // 実行
  app.run();
});