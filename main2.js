const w_width = window.innerWidth;
const w_height = window.innerHeight;
const d_width = 600;
const d_height = 650;

let activeBlock; // 現在操作中のオブジェクト
let isFalling = false; // 落下中かどうか判定
// let timeLeft = 5; // 制限時間
// let timerText; // 残り時間表示テキスト
let cursors; // キーボード入力をグローバルで保持

// 1, phaser3の設定データ
const config = {
    type: Phaser.AUTO,
    width: d_width, // 画面横幅
    height: d_height, // 画面縦幅
    antialias: false,
    scene: {
        preload: preload, // 素材の読み込み時の関数
        create: create, // 画面が作られた時の関数
        update: update // 連続実行される関数
    },

    physics: {
        default: "matter",
        matter: {
            debug: false, // スプライトに緑の枠を表示
            gravity: {y: 0.5} // 重力の方向とその強さ
        }
    },

    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },

    backgroundColor: '#7ebec6'

};

// 2, phaser3オブジェクトを作る
let phaser = new Phaser.Game(config);

function preload(){
    console.log("preload!!");
    this.load.image("dog", "./assets/dog.png");
    this.load.json("dog", "./assets/dog.json");
    this.load.image("shirapoon", "./assets/shirapoon.png");
    this.load.json("shirapoon", "./assets/shirapoon.json");
    this.load.image("yuichiro", "./assets/yuichiro.png");
    this.load.json("yuichiro", "./assets/yuichiro.json");
    this.load.image("ocoto", "./assets/ocoto.png");
    this.load.json("ocoto", "./assets/ocoto.json");
    this.load.image("fuji", "./assets/fuji.png");
    this.load.json("fuji", "./assets/fuji.json");
    this.load.image("podenco", "./assets/podenco.png");
    this.load.json("podenco", "./assets/podenco.json");

}

function create(){
    console.log("create!!");
    //this.add.image(d_width/2, d_height/2, "background"); // 画面中心に表示

    // 地面設定
    //let ground = this.matter.add.image(300, 550, "ground", null, {isStatic: true});
    //ground.setDisplaySize(500, 100);

    const gdata = this.cache.json.get("podenco");
    const gverts = gdata.vertices.map(([x, y]) => ({
        x, y
    }));
    const gbody = Phaser.Physics.Matter.Matter.Bodies.fromVertices(
        290, 500, gverts
    );

    const podenco = this.matter.add.sprite(290, 500, "podenco"
    );
    
    podenco.setExistingBody(gbody);
    podenco.setStatic(true);
    podenco.setSensor(true);

    // タイマー表示
    //timerText = this.add.text(20, 20, 'time: 5', {fontSize: '32px', fill: '#3316c7'});

    // キー入力の初期化はcreate内で1回だけ行う
    cursors = this.input.keyboard.createCursorKeys();

    // 最初のブロック生成
    spawnBlock(this);

}

function update(){
    console.log("update!!");

    // 操作可能な状態（落下前）の場合
    if (activeBlock && !isFalling){
        if(cursors.left.isDown){
            activeBlock.x -= 4; // 左へ
        }
        if(cursors.right.isDown){
            activeBlock.x += 4; // 右へ
        }

        if(Phaser.Input.Keyboard.JustDown(cursors.up)){
            activeBlock.angle += 30;
        }

        if(Phaser.Input.Keyboard.JustDown(cursors.down)){
            activeBlock.angle -= 30;
        }

        if(Phaser.Input.Keyboard.JustDown(cursors.space)){
            dropBlock(this);
        }
    }

    if (activeBlock && isFalling){
        activeBlock = null;
    }
    
    if (!activeBlock && (Phaser.Input.Keyboard.JustDown(cursors.space))){
        spawnBlock(this);
        }

}

// 新しいオブジェクトを画面上部に出現
function spawnBlock(scene){

    const keys = ["ocoto", "fuji", "shirapoon", "yuichiro", "dog"];
    const randomKey = keys[Math.floor(Math.random() * keys.length)];

    const data = scene.cache.json.get(randomKey);

    const verts = data.vertices.map(([x, y]) => ({
        x, y
    }));

    const body = Phaser.Physics.Matter.Matter.Bodies.fromVertices(
        d_width / 2, 80, verts
    );

    // スプライト作成
    activeBlock = scene.matter.add.sprite(d_width / 2, 80, randomKey
    );
    
    activeBlock.setExistingBody(body);

    activeBlock.setStatic(true);
    activeBlock.setSensor(true);

    // ステータス初期化
    isFalling = false;
    //timeLeft = 5;
    //timerText.setText('Time: ' + timeLeft);

    // 1秒ごとにカウントダウンするタイマーイベント作成
    // if (scene.countdownTimer) scene.countdownTimer.remove();
    //scene.countdownTimer = scene.time.addEvent({
    //    delay: 1000,
    //    callback: () => {
    //        if (!isFalling){
    //            timeLeft--;
    //           timerText.setText('Time: ' + timeLeft);

                // 0秒になったら落下開始
    //            if (timeLeft <= 0){
    //              dropBlock(scene);
    //            }
    //        }
    //    },
    //    callbackScope: scene,
    //    loop: true
    // });

}

// ブロック落下
function dropBlock(scene){
    if (!activeBlock) return ;

    isFalling = true;

    // 静的状態解除
    activeBlock.setStatic(false); 
    activeBlock.setSensor(false);

}
