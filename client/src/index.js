function Game() {
    const img0 = document.getElementById("0");
    const img1 = document.getElementById("1");
    const img2 = document.getElementById("2");
    const img3 = document.getElementById("3");
    const losebutton = document.getElementsByClassName("lose-button")[0];
    const imgName = ["./img/macho0.png", "./img/macho1.png", "./img/macho2.png", "./img/macho3.png", "./img/macho4.png"];
    var machoCounter = [1, 1, 1, 1];
    var chat = ["動かすマッチョを選んでください", "叩くマッチョを選んでください", "CPUが選択しています", "　"];
    var status = 0;
    var from;
    var to;
    const imgs = [img0, img1, img2, img3];
    console.log(img0);
    console.log(imgs[0]);
    var sttest = document.getElementById("test");
    const section2 = document.getElementsByClassName("section2")[0];
    for (let i = 0; i < 4; i++) {
        console.log("test1");
        imgs[i].onclick = function () {
            console.log(i);
            if (status == 0) {
                from = i;
                console.log(from);
                if (machoCounter[from] != 0 && from > 1) {
                    imgs[i].style.border = "2px solid red";
                    status = 1;
                    sttest.innerText = chat[status];
                }
            }
            else if (status == 1) {
                to = i;
                if (from != to && machoCounter[to] != 0) {
                    imgs[from].style.border = "";
                    machoCounter[to] = (machoCounter[to] + machoCounter[from]) % 5;
                    status = 2;
                    sttest.innerText = chat[status];
                    update();
                    //delay(2);
                    console.log("投げた");
                    // exeファイルを実行するために裏に投げる
                    // from,toにexeの結果を代入
                    delay(2).then(() => {
                        // サーバーにリクエストを送信
                        console.log("投げた2");
                        fetch('http://localhost:5000/run-exe', { // サーバーのURLをフルパスに変更
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({
                                hL: machoCounter[0],
                                hR: machoCounter[1],
                                oL: machoCounter[2],
                                oR: machoCounter[3]
                            })
                        })
                            .then(response => {
                                console.log("Response Status:", response.status); // ステータスコードを確認
                                return response.json(); // JSON 形式でレスポンスを解析
                            })
                            .then(result => {
                                console.log("帰ってきた");
                                console.log(result.output.from);
                                console.log(result.output.to);
                                // サーバーからの結果を処理
                                from = result.output.from;
                                to = result.output.to;
                                console.log(from);
                                console.log(to);

                                // 反映する
                                machoCounter[to] = (machoCounter[to] + machoCounter[from]) % 5;
                                update();
                                if (machoCounter[2] == 0 && machoCounter[3] == 0) {
                                    //画面遷移YouLose
                                    section2.style.display = "flex";
                                    status = 3;
                                    sttest.innerText = chat[status];
                                }
                                else {
                                    status = 0;
                                    sttest.innerText = chat[status];
                                }
                            })
                            .catch(error => {
                                console.error('Error:', error);
                            });
                    });
                }
            }
            sttest.innerText = chat[status];
            console.log(machoCounter);
        }
    }
    function update() {
        for (var i = 0; i < imgs.length; i++) {
            imgs[i].src = imgName[machoCounter[i]];
            imgs[i].style.opacity = 0;
            animateImageOpacity(imgs[i]);
        }
    }
    function animateImageOpacity(image) {
        let opacity = 0.6;
        const intervalTime = 10; // 10ミリ秒ごとに更新
        const totalTime = 1000; // 1秒
        const step = 1 / (totalTime / intervalTime); // 各ステップでの増加量

        const intervalId = setInterval(() => {
            opacity += step;
            if (opacity >= 1) {
                opacity = 1;
                clearInterval(intervalId);
            }
            image.style.opacity = opacity;
        }, intervalTime);
    }
    function delay(n) {
        return new Promise(function (resolve) {
            setTimeout(resolve, n * 1000);
        });
    }
    losebutton.onclick = function () {
        status = 0;
        sttest.innerText = chat[status];
        for (var i = 0; i < 4; i++) {
            machoCounter[i] = 1;
        }
        update();
        console.log("もう一回！");
        section2.style.display = "none";
    }
}

function Roulette() {

    const bu = document.getElementById("roulette");
    const header = document.getElementsByClassName("header")[0];
    const sidebar = document.getElementsByClassName("sidebar")[0];
    const contents = document.getElementsByClassName("contents")[0];
    const machogame = document.getElementsByClassName("machogame")[0];


    bu.onclick = function () {
        header.style.display = "none";
        sidebar.style.display = "none";
        contents.style.display = "none";
        machogame.style.display = "block";
        Game();
    }
}

Roulette();