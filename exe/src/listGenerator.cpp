using namespace std;
#include <iostream>
#include <vector>

int main()
{

    // hL, hR, oL, oR, 手番
    // h: CPU(hero)
    // o: プレイヤー(opponent)
    // L, R: left, right
    // 手番: 0だとCPU、1だとプレイヤーの番
    int G[5][5][5][5][2];
    // 初期化
    for (int i = 0; i < 5; i++)
    {
        for (int j = 0; j < 5; j++)
        {
            for (int k = 0; k < 5; k++)
            {
                for (int l = 0; l < 5; l++)
                {
                    G[i][j][k][l][0] = 0;
                    G[i][j][k][l][1] = 0;
                }
            }
        }
    }

    // CPU必勝なら1、CPU必敗なら2、それ以外は0、不可能盤面は-1を入れる
    // 更新がなくなるまでQueueを用いて更新していく

    // 不可能盤面に代入
    // 手番でないときに0, 0になっていることはない
    for (int i = 0; i < 5; i++)
    {
        for (int j = 0; j < 5; j++)
        {
            G[i][j][0][0][0] = -1;
            G[0][0][i][j][1] = -1;
        }
    }

    // いずれかの勝利盤面についてGに代入する

    for (int i = 0; i < 5; i++)
    {
        for (int j = 0; j < 5; j++)
        {
            if (i == 0 && j == 0)
            {
                continue;
            }
            G[i][j][0][0][1] = 1;
            G[0][0][i][j][0] = 2;
        }
    }

    // 未確定盤面すべてを考える
    // 更新がされなくなったらwhileから抜ける

    bool update = true;
    int count = 0;
    while (update)
    {
        update = false;
        count++;
        for (int i = 0; i < 5; i++)
        {
            for (int j = 0; j < 5; j++)
            {
                for (int k = 0; k < 5; k++)
                {
                    for (int l = 0; l < 5; l++)
                    {
                        // 自分のターンのとき
                        //  すでに更新してあるかどうか
                        if (G[i][j][k][l][0] != 0)
                        {
                            continue;
                        }
                        // 更新されていないので更新できるか試す

                        // 相手必勝かを管理する真理値
                        bool lose = true;

                        // 左手で
                        // 相手の左手をたたく
                        if (G[i][j][(k + i) % 5][l][1] == 1 && i != 0 && k != 0)
                        {
                            G[i][j][k][l][0] = 1;
                            update = true;
                            continue;
                        }
                        else if (G[i][j][(k + i) % 5][l][1] != 2 && i != 0 && k != 0)
                        {
                            lose = false;
                        }
                        // 相手の右手をたたく
                        if (G[i][j][k][(l + i) % 5][1] == 1 && i != 0 && l != 0)
                        {
                            G[i][j][k][l][0] = 1;
                            update = true;
                            continue;
                        }
                        else if (G[i][j][k][(l + i) % 5][1] != 2 && i != 0 && l != 0)
                        {
                            lose = false;
                        }
                        // 自分の右手をたたく
                        if (G[i][(j + i) % 5][k][l][1] == 1 && i != 0 && j != 0)
                        {
                            G[i][j][k][l][0] = 1;
                            update = true;
                            continue;
                        }
                        else if (G[i][(j + i) % 5][k][l][1] != 2 && i != 0 && j != 0)
                        {
                            lose = false;
                        }
                        // 右手で
                        // 相手の左手をたたく
                        if (G[i][j][(k + j) % 5][l][1] == 1 && k != 0 && j != 0)
                        {
                            G[i][j][k][l][0] = 1;
                            update = true;
                            continue;
                        }
                        else if (G[i][j][(k + j) % 5][l][1] != 2 && k != 0 && j != 0)
                        {
                            lose = false;
                        }
                        // 相手の右手をたたく
                        if (G[i][j][k][(l + j) % 5][1] == 1 && l != 0 && j != 0)
                        {
                            G[i][j][k][l][0] = 1;
                            update = true;
                            continue;
                        }
                        else if (G[i][j][k][(l + j) % 5][1] != 2 && i != 0 && j != 0)
                        {
                            lose = false;
                        }
                        // 自分の左手をたたく
                        if (G[(i + j) % 5][j][k][l][1] == 1 && i != 0 && j != 0)
                        {
                            G[i][j][k][l][0] = 1;
                            update = true;
                            continue;
                        }
                        else if (G[(i + j) % 5][j][k][l][1] != 2 && i != 0 && j != 0)
                        {
                            lose = false;
                        }
                        // ここまでのすべての手が相手必勝なら相手必勝
                        if (lose)
                        {
                            G[i][j][k][l][0] = 2;
                            update = true;
                            continue;
                        }
                    }
                }
            }
        }
        for (int i = 0; i < 5; i++)
        {
            for (int j = 0; j < 5; j++)
            {
                for (int k = 0; k < 5; k++)
                {
                    for (int l = 0; l < 5; l++)
                    {
                        // 相手のターンのとき
                        //  すでに更新してあるかどうか
                        if (G[i][j][k][l][1] != 0)
                        {
                            continue;
                        }
                        // 更新されていないので更新できるか試す

                        // 相手必勝かを管理する真理値
                        bool lose = true;

                        // 左手で
                        // 相手の左手をたたく
                        if (G[(i + k) % 5][j][k][l][0] == 2 && i != 0 && k != 0)
                        {
                            G[i][j][k][l][1] = 2;
                            update = true;
                            continue;
                        }
                        else if (G[(i + k) % 5][j][k][l][0] != 1 && i != 0 && k != 0)
                        {
                            lose = false;
                        }
                        // 相手の右手をたたく
                        if (G[i][(j + k) % 5][k][l][0] == 2 && k != 0 && j != 0)
                        {
                            G[i][j][k][l][1] = 2;
                            update = true;
                            continue;
                        }
                        else if (G[i][(j + k) % 5][k][l][0] != 1 && k != 0 && j != 0)
                        {
                            lose = false;
                        }
                        // 自分の右手をたたく
                        if (G[i][j][k][(l + k) % 5][0] == 2 && l != 0 && k != 0)
                        {
                            G[i][j][k][l][1] = 2;
                            update = true;
                            continue;
                        }
                        else if (G[i][j][k][(l + k) % 5][0] != 1 && l != 0 && k != 0)
                        {
                            lose = false;
                        }
                        // 右手で
                        // 相手の左手をたたく
                        if (G[(i + l) % 5][j][k][l][0] == 2 && i != 0 && l != 0)
                        {
                            G[i][j][k][l][1] = 2;
                            update = true;
                            continue;
                        }
                        else if (G[(i + l) % 5][j][k][l][0] != 1 && i != 0 && l != 0)
                        {
                            lose = false;
                        }
                        // 相手の右手をたたく
                        if (G[i][(j + l) % 5][k][l][0] == 2 && l != 0 && j != 0)
                        {
                            G[i][j][k][l][1] = 2;
                            update = true;
                            continue;
                        }
                        else if (G[i][(j + l) % 5][k][l][0] != 1 && l != 0 && j != 0)
                        {
                            lose = false;
                        }
                        // 自分の左手をたたく
                        if (G[i][j][(k + l) % 5][l][0] == 2 && k != 0 && l != 0)
                        {
                            G[i][j][k][l][1] = 2;
                            update = true;
                            continue;
                        }
                        else if (G[i][j][(k + l) % 5][l][0] != 1 && k != 0 && l != 0)
                        {
                            lose = false;
                        }
                        // ここまでのすべての手が相手必勝なら相手必勝
                        if (lose)
                        {
                            G[i][j][k][l][1] = 1;
                            update = true;
                            continue;
                        }
                    }
                }
            }
        }
    }
    // 出力する
    // Gの値を改行で区切ってで出力
    for (int i = 0; i < 5; i++)
    {
        for (int j = 0; j < 5; j++)
        {
            for (int k = 0; k < 5; k++)
            {
                for (int l = 0; l < 5; l++)
                {
                    for (int m = 0; m < 2; m++)
                    {
                        cout << G[i][j][k][l][m] << endl;
                    }
                }
            }
        }
    }
    // なお、計算回数は1250*1250*(一つの更新の確認に必要な命令の個数)回で抑えられるので、十分高速に動く
}