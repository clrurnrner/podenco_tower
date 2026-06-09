const w_width = window.innerWidth;
const w_height = window.innerHeight;
const d_width = 600;
const d_height = 650;

let activeBlock; // 現在操作中のオブジェクト
let isFalling = false; // 落下中かどうか判定
let iszooming = false;
let cursors; // キーボード入力をグローバルで保持
let blocks = [];
let baseY = 500;
let towerTopY = 0;
let towerHeight = 0;
let zoom = null;
let targetCenterY = 0;
let cameraCenterY = 0;

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

    const gdata = this.cache.json.get("podenco");
    const gverts = gdata.vertices.map(([x, y]) => ({
        x, y
    }));
    const gbody = Phaser.Physics.Matter.Matter.Bodies.fromVertices(
        d_width / 2 - 10, baseY, gverts
    );

    const podenco = this.matter.add.sprite(d_width / 2 - 10, baseY, "podenco"
    );
    
    podenco.setExistingBody(gbody);
    podenco.setStatic(true);
    podenco.setSensor(true);

    // キー入力の初期化はcreate内で1回だけ行う
    cursors = this.input.keyboard.createCursorKeys();

    this.cameras.main.centerOn(
        d_width / 2,
        baseY - 200
    );

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
        towerTopY = getTowerTopY();
        towerHeight = baseY - towerTopY;
        zoom = Phaser.Math.Clamp(
            d_height / 2 / (150 + (towerHeight + 200) / 2),
            0.01,
            1
        );
        targetCenterY = (towerTopY - 200 + baseY) / 2;
        cameraCenterY = this.cameras.main.midPoint.y;
        
        iszooming = true;
    }

    if (iszooming){
        
        this.cameras.main.zoom = Phaser.Math.Linear(
            this.cameras.main.zoom,
            zoom,
            0.2
        );

        cameraCenterY = Phaser.Math.Linear(
            cameraCenterY,
            targetCenterY,
            0.1
        )
        this.cameras.main.centerOn(
            d_width / 2,
            cameraCenterY
        );

        if ((Math.abs(this.cameras.main.zoom - zoom) < 0.1) && (Math.abs(cameraCenterY - targetCenterY) < 2)){
            spawnBlock(this);
            iszooming = false;
        }

        }

}

// 新しいオブジェクトを画面上部に出現
function spawnBlock(scene){
    const towerTopY = getTowerTopY();
    const spawnY = Math.min(80, towerTopY - 200);

    const keys = ["ocoto", "fuji", "shirapoon", "yuichiro", "dog"];
    const randomKey = keys[Math.floor(Math.random() * keys.length)];

    const data = scene.cache.json.get(randomKey);

    const verts = data.vertices.map(([x, y]) => ({
        x, y
    }));

    const body = Phaser.Physics.Matter.Matter.Bodies.fromVertices(
        d_width / 2, spawnY, verts
    );

    // スプライト作成
    activeBlock = scene.matter.add.sprite(d_width / 2, spawnY, randomKey
    );
    
    activeBlock.setExistingBody(body);

    activeBlock.setStatic(true);
    activeBlock.setSensor(true);

    blocks.push(activeBlock);

    // ステータス初期化
    isFalling = false;

}

// ブロック落下
function dropBlock(scene){
    if (!activeBlock) return ;

    isFalling = true;

    // 静的状態解除
    activeBlock.setStatic(false); 
    activeBlock.setSensor(false);

}

function getTowerTopY(){

    let topY = baseY;

    for (const block of blocks){

        if (!block.body) continue;

        topY = Math.min(
            topY,
            block.body.bounds.min.y
        );

    }

    return topY;
}
