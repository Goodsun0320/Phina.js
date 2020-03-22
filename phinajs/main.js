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

// グローバル変数
var playerBulletGroup = null;
var enemyBulletGroup = null;

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
    enemyBulletGroup = DisplayElement().addChildTo(this);
    // プレイヤー
    Player().addChildTo(this).setPosition(this.gridX.center(), this.gridY.center(3));
    // 敵
    Enemy().addChildTo(this).setPosition(this.gridX.center(-3), this.gridY.center(-2));
    Enemy().addChildTo(this).setPosition(this.gridX.center(3), this.gridY.center(-2));
  },
});
/*
 * スペースシップクラス
 */
phina.define("SpaceShip", {
  // 継承
  superClass: 'Sprite',
  // 初期化
  init: function(param) {
    // 親クラス初期化
    this.superInit('spaceship', 64, 64);
    // フレームアニメーションをアタッチ
    this.anim = FrameAnimation('spaceship').attachTo(this);
    // 移動スピード
    this.speed = param.speed;
  },
  // 機体の移動
  move: function(direction) {
    this.moveBy(direction.x * this.speed, direction.y * this.speed);
  },
});

phina.define("Collider", {
  // 継承
  superClass: 'RectangleShape',
  // 初期化
  init: function(param) {
    this.superInit({
      width: param.width,
      height: param.height,
      fill: null,
      stroke: 'red',
    });
  },
  // コライダーの絶対座標の矩形
  getAbsoluteRect: function() {
    var x = this.left + this.parent.x;
    var y = this.top + this.parent.y;
    return Rect(x, y, this.width, this.height);
  },
});

/*
 * プレイヤークラス
 */
phina.define("Player", {
  // 継承
  superClass: 'SpaceShip',
  // 初期化
  init: function() {
    // 親クラス初期化
    this.superInit({speed: 5 });
    // フレームアニメーションをアタッチ
    this.anim.gotoAndPlay('player');
    // 当たり判定
    this.collider = Collider({
      width: 20,
      height: 20,
    }).addChildTo(this);

    // 発射感覚
    var shotDelay = 1000;
    
    // 一定間隔で弾を発射
    this.tweener.clear()
                .call(function() {
                  this.shot();
                }, this)
                .wait(shotDelay)
                .setLoop(true); 
  },
  // 弾を発射
  shot: function() {
    PlayerBullet().addChildTo(playerBulletGroup).setPosition(this.x, this.y);
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
 * 敵クラス
 */
phina.define("Enemy", {
  // 継承
  superClass: 'SpaceShip',
  // 初期化
  init: function() {
    // 親クラス初期化
    this.superInit({ speed: 0.5 });
    // フレームアニメーション指定
    this.anim.gotoAndPlay('enemy');
    //
    var shotDelay = 6000;
    //
    this.tweener.clear()
                .call(function() {
                  this.shot();
                }, this)
                .wait(shotDelay)
                .setLoop(true);
  },
  // 弾発射
  shot: function() {
    EnemyBullet(this.rotation).addChildTo(enemyBulletGroup).setPosition(this.x, this.y);
  },
  // 毎フレーム更新処理
  update: function() {
    // 機体の移動
    this.move(Vector2.DOWN);
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
    Sprite('bullet', 64, 64).addChildTo(self).setPosition(self.x + dx, self.y).setFrameIndex(0);
   });
   // 上向き速度を与える
   this.physical.velocity.y = -speed;
 },
});

/*
 * 敵の弾クラス
 */
phina.define("EnemyBullet", {
  // 継承
  superClass: 'DisplayElement',
  // 初期化
  init: function(rotation) {
    // 親クラス初期化
    this.superInit();
    // スピード
    var speed = 10;
    var self = this;
    // 弾
    [-20, 0, 20].each(function(degree) {
      // 弾作成
      var bullet = Sprite('bullet', 64, 64).addChildTo(self).setFrameIndex(1);
      // 発射方向を決める
      var deg = rotation + degree + 90;
      // 角度と大きさからベクトル作成
      var vec = Vector2().fromDegree(deg, speed);
      // ベクトルを代入
      bullet.physical.velocity = vec;
    });
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