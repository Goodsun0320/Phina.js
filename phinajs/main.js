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
var SCREEN_RECT = Rect(0, 0, 640, 960); // 画面の矩形

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
    this.enemyGroup = DisplayElement().addChildTo(this);
    // プレイヤー
    this.player = Player().addChildTo(this).setPosition(this.gridX.center(), this.gridY.center(3));
    // 敵
    Enemy().addChildTo(this.enemyGroup).setPosition(this.gridX.center(-3), this.gridY.center(-2));
    // 弾を発射できない敵
    Enemy({
      canShot: false,
    }).addChildTo(this.enemyGroup).setPosition(this.gridX.center(3), this.gridY.center(-2));
  },
  // 毎フレーム処理
  update: function() {
    // 敵の弾とプレイヤー
    this.hitTestBulletToPlayer();
  },
  // 敵の弾とプレイヤーの当たり判定
  hitTestBulletToPlayer: function() {
    var self = this;
    var player = this.player;

    enemyBulletGroup.children.each(function(bullet) {
      // 当たり判定用の矩形
      var r1 = bullet.collider.getAbsoluteRect();
      var r2 = player.collider.getAbsoluteRect();
      // ヒットなら
      if (Collision.testRectRect(r1, r2)) {
        // 弾削除
        bullet.remove();
        // 爆発表示
        Explosion().addChildTo(self).setPosition(player.x, player.y);
        // プレイヤー削除
        player.remove();
      }
    });
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
    this.superInit({ speed: 5 });
    // フレームアニメーション指定
    this.anim.gotoAndPlay('player');
    // 当たり判定用矩形
    this.collider = Collider({
      width: 20,
      height: 20,
    }).addChildTo(this);
    // 弾の発射間隔
    var shotDelay = 1000;
    // 一定間隔で弾を発射
    this.tweener.clear()
                .call(function() {
                  this.shot();
                }, this)
                .wait(shotDelay)
                .setLoop(true); 
  },
  // 弾発射
  shot: function() {
    var self = this;
    // 左右の弾
    [-10, 10].each(function(dx) {
      var bullet = PlayerBullet().addChildTo(playerBulletGroup);
      bullet.setPosition(self.x + dx, self.y).setFrameIndex(0);
    });
  },
  // 毎フレーム更新処理
  update: function(app) {
    // 移動する向きを求める
    var direction = app.keyboard.getKeyDirection();
    // 機体の移動
    this.move(direction);
  },
});
/*
 * 敵クラス
 */
phina.define("Enemy", {
  // 継承
  superClass: 'SpaceShip',
  // 初期化
  init: function(param) {
    // 親クラス初期化
    this.superInit({ speed: 0.5 });
    // フレームアニメーション指定
    this.anim.gotoAndPlay('enemy');
    // 当たり判定用矩形
    this.collider = Collider({
      width: 40,
      height: 40,
    }).addChildTo(this);
    // 弾を発射できるか
    var canShot = (param && param.canShot !== undefined) ? param.canShot : true;
    if (!canShot) return;
    // 弾の発射間隔
    var shotDelay = 6000;
    // 一定間隔で弾を発射
    this.tweener.clear()
                .call(function() {
                  this.shot();
                }, this)
                .wait(shotDelay)
                .setLoop(true);
  },
  // 弾発射
  shot: function() {
    var self = this;
    // 弾
    [-20, 0, 20].each(function(degree) {
      // 弾作成
      var bullet = EnemyBullet(4).addChildTo(enemyBulletGroup);
      bullet.setPosition(self.x, self.y);
      // 発射方向を決める
      var deg = self.rotation + degree + 90;
      // 角度と大きさからベクトル作成
      var vec = Vector2().fromDegree(deg, bullet.speed);
      // ベクトルを代入
      bullet.physical.velocity = vec;
    });
  },
  // 毎フレーム更新処理
  update: function() {
    // 機体の移動
    this.move(Vector2.DOWN);
        // 画面下に出たら削除
        if (this.top > SCREEN_RECT.bottom) {
          this.remove();
        }
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
/*
 * プレイヤーの弾クラス
 */
phina.define("PlayerBullet", {
  // 継
  superClass: 'Sprite',
  // 初期化
  init: function() {
    // 親クラス初期化
    this.superInit('bullet', 64, 64);
    // スピード
    var speed = 10;
    // 当たり判定用のコライダー
    this.collider = Collider({
      width: 10,
      height: 30,
    }).addChildTo(this);
    // 上向き速度を与える
    this.physical.velocity.y = -speed;
  },
});
/*
 * 敵の弾クラス
 */
phina.define("EnemyBullet", {
  // 継承
  superClass: 'Sprite',
  // 初期化
  init: function() {
    // 親クラス初期化
    this.superInit('bullet', 64, 64);
    this.setFrameIndex(1);
    // スピード
    this.speed = 10;
    // 当たり判定用のコライダー
    this.collider = Collider({
      width: 10,
      height: 10,
    }).addChildTo(this);
  },
});
/*
 * 爆発クラス
 */
phina.define("Explosion", {
  // 継承
  superClass: 'Sprite',
  // 初期化
  init: function(param) {
    // 親クラス初期化
    this.superInit('explosion', 64, 64);
    // フレームアニメーションをアタッチ
    FrameAnimation('explosion').attachTo(this).gotoAndPlay('explosion');
  },
});
/*
 * コライダークラス
 */
phina.define("Collider", {
  // 継承
  superClass: 'RectangleShape',
  // 初期化
  init: function(param) {
    // 親クラス初期化
    this.superInit({
      width: param.width,
      height: param.height,
      fill: null,
      stroke: 'red',
    });
    this.hide();
  },
  // コライダーの絶対座標の矩形
  getAbsoluteRect: function() {
    var x = this.left + this.parent.x;
    var y = this.top + this.parent.y;
    return Rect(x, y, this.width, this.height);
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